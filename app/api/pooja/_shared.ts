import { NextRequest, NextResponse } from 'next/server';
import { getUserServiceUrl, getPaymentServiceUrl } from '../../config/api';
import {
  REFRESH_COOKIE,
  SESSION_EXPIRED_CODE,
  getAuthCookies,
  setAuthCookies,
  clearAuthCookies,
  refreshTokensServerSide,
} from '../../lib/server-auth';

/**
 * Build headers forwarded to user-service for the Pooja/Remedy module.
 *
 * Tokens are sourced from the authoritative HttpOnly cookie store (not from a
 * client-supplied Authorization header) so a stale `localStorage.authToken`
 * mirror can never be forwarded after a cookie rotation/clear.
 */
function buildHeaders(accessToken: string | null, refreshToken: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: 'https://sobhagya.in',
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  // user-service auth middleware requires BOTH the Authorization header AND a
  // refresh-cookie value at the gate.
  const refreshOrAccess = refreshToken || accessToken;
  if (refreshOrAccess) {
    headers['cookies'] = refreshOrAccess;
    headers['Cookie'] = `${REFRESH_COOKIE}=${refreshOrAccess}`;
  }
  return headers;
}

/**
 * Proxy a JSON request to the user-service pooja API and relay its response.
 *
 * Mirrors apiFetch: cookie-authoritative auth with a single server-side
 * refresh-and-retry on a 401. A 401 only becomes a SESSION_EXPIRED signal when
 * the refresh itself fails — transient/expired-access 401s self-heal instead of
 * wiping the session.
 */
export async function proxyPooja(
  req: NextRequest,
  method: 'GET' | 'POST',
  backendPath: string,
  opts: { body?: any; searchParams?: URLSearchParams; requireAuth?: boolean } = {}
): Promise<NextResponse> {
  // user-service: catalog, orders, quote, internal lifecycle.
  return proxyTo(`${getUserServiceUrl()}/api/pooja${backendPath}`, 'pooja', method, opts);
}

/**
 * Proxy a pooja PAYMENT request to payment-service (which owns the wallet debit;
 * pooja is wallet-only). Same cookie-authoritative auth + single refresh-retry as
 * proxyPooja. Backend paths are relative to `/api/transaction` (e.g. '/pooja/wallet').
 */
export async function proxyPayment(
  req: NextRequest,
  method: 'GET' | 'POST',
  backendPath: string,
  opts: { body?: any; searchParams?: URLSearchParams; requireAuth?: boolean } = {}
): Promise<NextResponse> {
  return proxyTo(`${getPaymentServiceUrl()}/api/transaction${backendPath}`, 'payment', method, opts);
}

async function proxyTo(
  baseUrl: string,
  tag: string,
  method: 'GET' | 'POST',
  opts: { body?: any; searchParams?: URLSearchParams; requireAuth?: boolean } = {}
): Promise<NextResponse> {
  try {
    let { accessToken, refreshToken } = await getAuthCookies();

    // Auth-required call without an access cookie: try to mint one first.
    if (opts.requireAuth && !accessToken) {
      const minted = await refreshTokensServerSide();
      if (!minted) {
        return NextResponse.json(
          { success: false, code: SESSION_EXPIRED_CODE, message: 'Authentication failed, Please log in.', data: null },
          { status: 401 }
        );
      }
      ({ accessToken, refreshToken } = await getAuthCookies());
    }

    const qs = opts.searchParams?.toString();
    const url = `${baseUrl}${qs ? `?${qs}` : ''}`;

    const sendOnce = (access: string | null, refresh: string | null) =>
      fetch(url, {
        method,
        headers: buildHeaders(access, refresh),
        body: method === 'POST' ? JSON.stringify(opts.body ?? {}) : undefined,
      });

    // Only an authenticated context (token present or required) participates in
    // the refresh-retry / session-expiry flow; public catalog calls do not.
    const authed = opts.requireAuth || !!accessToken;

    let res = await sendOnce(accessToken, refreshToken);

    const rotated = res.headers.get('auth-token');
    if (rotated && rotated !== 'null' && rotated !== accessToken) {
      await setAuthCookies({ accessToken: rotated });
    }

    if (res.status === 401 && authed) {
      const newAccess = await refreshTokensServerSide();
      if (newAccess) {
        const { refreshToken: newRefresh } = await getAuthCookies();
        res = await sendOnce(newAccess, newRefresh);
      } else {
        console.warn(`[${tag}-proxy] 401 from ${url}; refresh failed → session expired`);
        await clearAuthCookies();
        return NextResponse.json(
          { success: false, code: SESSION_EXPIRED_CODE, message: 'Authentication failed, Please log in.', data: null },
          { status: 401 }
        );
      }
    }

    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, message: text, data: null };
    }
    return NextResponse.json(parsed, { status: res.status });
  } catch (err: any) {
    console.error(`[${tag}-proxy] ${method} ${baseUrl} error:`, err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Error', data: null },
      { status: 500 }
    );
  }
}

/** Copy selected query params from the incoming request. */
export function pickQuery(req: NextRequest, keys: string[]): URLSearchParams {
  const incoming = new URL(req.url).searchParams;
  const out = new URLSearchParams();
  for (const k of keys) {
    const v = incoming.get(k);
    if (v) out.set(k, v);
  }
  return out;
}
