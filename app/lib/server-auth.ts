import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/api';

export const ACCESS_COOKIE = 'auth-token';
export const REFRESH_COOKIE = 'token';
export const INDICATOR_COOKIE = 'is_logged_in';

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
  const { accessToken, refreshToken } = await getAuthCookies();

  // Only the access token (Bearer) is mandatory — the upstream services
  // authenticate via the Authorization header. The refresh cookie is forwarded
  // when present for the chat middleware, but its absence must not 401 the
  // request, otherwise verify-otp races that don't populate the refresh cookie
  // would lock the user out immediately after login.
  if (!accessToken) {
    return {
      status: 401,
      ok: false,
      data: { success: false, message: 'Authentication failed, Please log in.', data: null } as unknown as T,
    };
  }

  const headers = new Headers(options.headers as HeadersInit | undefined);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${accessToken}`);

  // user-service and payment-service auth middleware require BOTH the
  // Authorization header AND a refresh-cookie value at the gate (see
  // sobhagya-backend-new/user-service/src/middlewares/authMiddleware.js:11).
  // The middleware only verifies the refresh value when the access token is
  // expired; otherwise its mere presence is enough to pass the gate. So if
  // the verify-otp Set-Cookie parse failed and we don't have a separate
  // refresh cookie, fall back to the access token. That keeps a freshly
  // authenticated user from getting 401-looped just because of a parser race.
  const refreshOrAccess = refreshToken || accessToken;
  headers.set('Cookie', `${REFRESH_COOKIE}=${refreshOrAccess}`);
  headers.set('cookies', refreshOrAccess);
  headers.set('Origin', 'https://sobhagya.in');

  // Local-dev override: when USER_SERVICE_URL is set, `/user/*` requests skip
  // the production gateway and hit the local user-service directly (which mounts
  // its routes at `/api/*`, not `/user/api/*` — nginx normally strips the prefix).
  // All other paths (`/auth/`, `/payment/`, `/chat/`, ...) keep going to the
  // configured gateway so you can run user-service in isolation.
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

  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
    cache: 'no-store',
  };
  if (options.body !== undefined && init.method !== 'GET' && init.method !== 'HEAD') {
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, init);

  const rotated = res.headers.get('auth-token');
  if (rotated && rotated !== 'null' && rotated !== accessToken) {
    await setAuthCookies({ accessToken: rotated });
  }

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: text };
  }

  if (res.status === 401) {
    // The 401 may be a false positive (missing cookie header, transient backend
    // hiccup, etc.). Log so we can debug without forcing the user to log in.
    // Only clear the server-side cookies on an *explicit* auth failure — a
    // bare "Authentication required." means a header was missing on our side,
    // which we should fix in apiFetch, not by logging the user out.
    const msg = (data && typeof data.message === 'string') ? data.message : '';
    console.warn(`[apiFetch] 401 from ${path}: "${msg}"`);
    if (/authentication failed|please log in|invalid token|expired/i.test(msg)) {
      await clearAuthCookies();
    }
  }

  return { status: res.status, ok: res.ok, data: data as T };
}
