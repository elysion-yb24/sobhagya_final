import { cookies } from 'next/headers';
import { getApiBaseUrl, buildApiUrl, API_CONFIG } from '../config/api';

export const ACCESS_COOKIE = 'auth-token';
export const REFRESH_COOKIE = 'token';
export const INDICATOR_COOKIE = 'is_logged_in';

/** Marker returned to the client when a session can no longer be refreshed. */
export const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';

const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;
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
 * Mints a fresh access token from the HttpOnly refresh cookie, server-side.
 *
 * This is the single source of truth for "refresh from cookies" — used both by
 * the /api/auth/refresh route (the client 401 interceptor) and by apiFetch /
 * proxyPooja when an upstream call 401s. On success it rotates the auth-token +
 * token cookies and returns the new access token. Returns null when the session
 * genuinely can't be refreshed (the refresh cookie is missing/invalid).
 */
export async function refreshTokensServerSide(): Promise<string | null> {
  const { accessToken, refreshToken } = await getAuthCookies();

  // Without any cookie there is nothing to refresh from.
  if (!refreshToken && !accessToken) return null;

  const refreshOrAccess = refreshToken || accessToken!;

  let backendRes: Response;
  try {
    backendRes = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Backend auth middleware reads the refresh token from the standard
        // Cookie header (`token=...`) and/or the legacy `cookies` header.
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        Cookie: `${REFRESH_COOKIE}=${refreshOrAccess}`,
        cookies: refreshOrAccess,
        Origin: 'https://sobhagya.in',
      },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[refreshTokensServerSide] network error:', err);
    return null;
  }

  const text = await backendRes.text();
  let parsed: any;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { success: false, message: text };
  }

  const headerAccess = backendRes.headers.get('auth-token');
  const newAccess =
    (headerAccess && headerAccess !== 'null' ? headerAccess : null) ||
    parsed?.accessToken ||
    parsed?.data?.access_token ||
    parsed?.token ||
    null;

  if (!backendRes.ok || !newAccess) return null;

  const newRefresh =
    parseRefreshTokenFromSetCookie(backendRes.headers) ||
    parsed?.refreshToken ||
    parsed?.data?.refresh_token ||
    refreshOrAccess;

  await setAuthCookies({ accessToken: newAccess, refreshToken: newRefresh });
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
  // Local-dev override: when USER_SERVICE_URL is set, `/user/*` requests skip
  // the production gateway and hit the local user-service directly (which mounts
  // its routes at `/api/*`, not `/user/api/*` — nginx normally strips the prefix).
  const userServiceLocal = process.env.USER_SERVICE_URL;
  let url: string;
  if (userServiceLocal && path.startsWith('/user/')) {
    url = `${userServiceLocal.replace(/\/$/, '')}${path.slice('/user'.length)}`;
  } else {
    url = `${getApiBaseUrl()}${path}`;
  }
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
