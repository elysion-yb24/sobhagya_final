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

  if (!accessToken || !refreshToken) {
    return {
      status: 401,
      ok: false,
      data: { success: false, message: 'Authentication failed, Please log in.', data: null } as unknown as T,
    };
  }

  const headers = new Headers(options.headers as HeadersInit | undefined);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Cookie', `${REFRESH_COOKIE}=${refreshToken}`);
  headers.set('cookies', refreshToken);
  headers.set('Origin', 'https://sobhagya.in');

  let url = `${getApiBaseUrl()}${path}`;
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
    await clearAuthCookies();
  }

  return { status: res.status, ok: res.ok, data: data as T };
}
