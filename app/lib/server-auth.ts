import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/api';

export const ACCESS_COOKIE = 'auth-token';
export const REFRESH_COOKIE = 'token';
export const INDICATOR_COOKIE = 'is_logged_in';

/** Marker returned to the client when a session can no longer be refreshed. */
export const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';

// Both cookies live as long as the backend's server-side session (the refresh
// token is stored in a Redis set with a 90-day TTL fixed at login). The access
// cookie intentionally shares that lifetime even though the access JWT inside
// it expires after 15 minutes: the backend auth middleware mints a new access
// token (returned in the `auth-token` response header) whenever it receives an
// EXPIRED-but-genuine bearer plus a valid refresh cookie, so the stale JWT is
// exactly what we need to keep refreshing from.
const ACCESS_MAX_AGE = 60 * 60 * 24 * 90;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 90;

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export async function getAuthCookies() {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value || null,
    refreshToken: store.get(REFRESH_COOKIE)?.value || null,
  };
}

export async function setAuthCookies(args: { accessToken?: string | null; refreshToken?: string | null }) {
  const store = await cookies();
  if (args.accessToken) {
    store.set(ACCESS_COOKIE, args.accessToken, { ...baseCookieOptions(), maxAge: ACCESS_MAX_AGE });
  }
  if (args.refreshToken) {
    store.set(REFRESH_COOKIE, args.refreshToken, { ...baseCookieOptions(), maxAge: REFRESH_MAX_AGE });
    store.set(INDICATOR_COOKIE, '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(INDICATOR_COOKIE);
}

export function parseRefreshTokenFromSetCookie(headers: Headers): string | null {
  const getter = (headers as any).getSetCookie?.bind(headers);
  const setCookies: string[] = typeof getter === 'function' ? getter() : [];
  const fallback = headers.get('set-cookie');
  const all = setCookies.length ? setCookies : fallback ? [fallback] : [];
  for (const sc of all) {
    const match = sc.match(/(?:^|,\s*)token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Cheap authMiddleware-protected backend GET used purely to harvest a freshly
 * minted access token. There is no dedicated refresh endpoint on the backend;
 * instead, every service's auth middleware re-mints the access token in the
 * `auth-token` response header when the request carries an expired bearer plus
 * a refresh cookie that is still in the Redis session set. `/user/api/data`
 * (userController.fetch) is a single read-only query on the caller's own user.
 */
const REFRESH_PING_PATH = '/user/api/data';

/**
 * Resolves a gateway-prefixed path (`/user/...`, `/auth/...`) to an absolute
 * upstream URL. Local-dev override: when USER_SERVICE_URL is set, `/user/*`
 * requests skip the production gateway and hit the local user-service directly
 * (which mounts its routes at `/api/*`, not `/user/api/*` — nginx normally
 * strips the prefix).
 */
function resolveBackendUrl(path: string): string {
  const userServiceLocal = process.env.USER_SERVICE_URL;
  if (userServiceLocal && path.startsWith('/user/')) {
    return `${userServiceLocal.replace(/\/$/, '')}${path.slice('/user'.length)}`;
  }
  return `${getApiBaseUrl()}${path}`;
}

/**
 * Single-flight cache for the token-minting ping, keyed by the refresh token,
 * so a burst of concurrent BFF requests that all 401 together shares one
 * upstream call. Successful results linger briefly for stragglers; failures
 * are dropped immediately so a transient error doesn't block retries.
 */
const inflightRefreshes = new Map<string, Promise<string | null>>();
const REFRESH_RESULT_LINGER_MS = 5000;

function mintAccessTokenViaPing(refreshToken: string, accessToken: string | null): Promise<string | null> {
  const existing = inflightRefreshes.get(refreshToken);
  if (existing) return existing;

  const promise = (async (): Promise<string | null> => {
    // Prefer the stored (typically expired) access JWT as the bearer — that is
    // what triggers the middleware's mint path. With no access cookie at all
    // the middleware would reject the request outright, so fall back to the
    // refresh token, which is a genuine JWT signed with the same secret and is
    // accepted as a (long-lived) bearer.
    const bearer = accessToken || refreshToken;

    let backendRes: Response;
    try {
      backendRes = await fetch(resolveBackendUrl(REFRESH_PING_PATH), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearer}`,
          // The middleware reads the refresh token from the standard Cookie
          // header (`token=...`) and/or the legacy `cookies` header.
          Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
          cookies: refreshToken,
          Origin: 'https://sobhagya.in',
        },
        cache: 'no-store',
      });
    } catch (err) {
      console.error('[refreshTokensServerSide] network error:', err);
      return null;
    }

    const minted = backendRes.headers.get('auth-token');
    if (minted && minted !== 'null') return minted;

    // 2xx with no minted header means the bearer we sent is still valid
    // (middleware only re-mints for *expired* bearers) — keep using it.
    if (backendRes.ok) return bearer;

    // 401/403: the refresh token is no longer in the Redis session set
    // (logged out elsewhere / evicted / expired) — the session is dead.
    return null;
  })();

  inflightRefreshes.set(refreshToken, promise);
  promise.then(
    (result) => {
      setTimeout(() => inflightRefreshes.delete(refreshToken), result ? REFRESH_RESULT_LINGER_MS : 0);
    },
    () => inflightRefreshes.delete(refreshToken),
  );
  return promise;
}

/**
 * Mints a fresh access token from the HttpOnly refresh cookie, server-side.
 *
 * This is the single source of truth for "refresh from cookies" — used both by
 * the /api/auth/refresh route (the client 401 interceptor) and by apiFetch /
 * proxyPooja when an upstream call 401s. On success it re-sets the auth-token +
 * token cookies and returns the new access token. Returns null when the session
 * genuinely can't be refreshed (the refresh cookie is missing/invalid/evicted).
 */
export async function refreshTokensServerSide(): Promise<string | null> {
  const { accessToken, refreshToken } = await getAuthCookies();

  // Without any cookie there is nothing to refresh from.
  if (!refreshToken && !accessToken) return null;

  const refreshOrAccess = refreshToken || accessToken!;

  const newAccess = await mintAccessTokenViaPing(refreshOrAccess, accessToken);
  if (!newAccess) return null;

  // The upstream ping is shared across concurrent requests, but each request
  // must still write the cookies onto its own response. The refresh token is
  // never rotated by the backend, so re-setting it just extends the cookie.
  await setAuthCookies({ accessToken: newAccess, refreshToken: refreshOrAccess });
  return newAccess;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export interface ApiFetchResult<T = any> {
  status: number;
  ok: boolean;
  data: T;
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<ApiFetchResult<T>> {
  let { accessToken, refreshToken } = await getAuthCookies();

  // No access cookie: try to mint one from the refresh cookie before giving up.
  // Only when that also fails is the session genuinely dead.
  if (!accessToken) {
    const minted = await refreshTokensServerSide();
    if (!minted) {
      return {
        status: 401,
        ok: false,
        data: { success: false, code: SESSION_EXPIRED_CODE, message: 'Authentication failed, Please log in.', data: null } as unknown as T,
      };
    }
    ({ accessToken, refreshToken } = await getAuthCookies());
  }

  // Build the upstream URL once (independent of which token we send).
  let url = resolveBackendUrl(path);
  if (options.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const tail = qs.toString();
    if (tail) url += (url.includes('?') ? '&' : '?') + tail;
  }

  const sendOnce = async (access: string, refresh: string | null): Promise<Response> => {
    const headers = new Headers(options.headers as HeadersInit | undefined);
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${access}`);
    // user-service and payment-service auth middleware require BOTH the
    // Authorization header AND a refresh-cookie value at the gate.
    const refreshOrAccess = refresh || access;
    headers.set('Cookie', `${REFRESH_COOKIE}=${refreshOrAccess}`);
    headers.set('cookies', refreshOrAccess);
    headers.set('Origin', 'https://sobhagya.in');

    const init: RequestInit = {
      method: options.method || 'GET',
      headers,
      cache: 'no-store',
    };
    if (options.body !== undefined && init.method !== 'GET' && init.method !== 'HEAD') {
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }
    return fetch(url, init);
  };

  let res = await sendOnce(accessToken!, refreshToken);

  // Persist any token the upstream rotated mid-request.
  const rotated = res.headers.get('auth-token');
  if (rotated && rotated !== 'null' && rotated !== accessToken) {
    await setAuthCookies({ accessToken: rotated });
  }

  // On a 401, try a single server-side refresh + retry. Only a *failed refresh*
  // (the refresh cookie itself is dead) is a genuine logout signal — we never
  // wipe cookies on a transient/expired-access 401 anymore.
  if (res.status === 401) {
    const newAccess = await refreshTokensServerSide();
    if (newAccess) {
      const { refreshToken: newRefresh } = await getAuthCookies();
      res = await sendOnce(newAccess, newRefresh);
    } else {
      console.warn(`[apiFetch] 401 from ${path}; refresh failed → session expired`);
      await clearAuthCookies();
      return {
        status: 401,
        ok: false,
        data: { success: false, code: SESSION_EXPIRED_CODE, message: 'Authentication failed, Please log in.', data: null } as unknown as T,
      };
    }
  }

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: text };
  }

  return { status: res.status, ok: res.ok, data: data as T };
}
