import { NextRequest, NextResponse } from 'next/server';
import { getChatBackendUrl } from '../../config/api';

/**
 * Build the headers forwarded to the chat-service backend.
 *
 * Backend middleware (`chat-service/src/middlewares/authMiddleware.js`) requires:
 *   - `Authorization: Bearer <access-token>`
 *   - a refresh token readable from EITHER `req.cookies.token` (the standard
 *     `Cookie: token=...` header, parsed by cookie-parser) OR `req.headers['cookies']`
 *     (a legacy custom header).
 *
 * This project's login flow stores the JWT in both `localStorage.authToken` and
 * a browser cookie named `token`. We therefore:
 *   1. Forward the incoming `Cookie` header verbatim so the backend's
 *      `req.cookies.token` is populated (same approach as `/api/wallet-balance`).
 *   2. Additionally populate the custom `cookies` header, preferring:
 *        incoming `cookies` header → `refresh_token` cookie → `token` cookie
 *        → falling back to the access token itself.
 *   3. Forward `Authorization` as-is.
 */
export function buildChatBackendHeaders(
  req: NextRequest,
  extra: Record<string, string> = {}
): { headers: Record<string, string>; accessToken: string | null; refreshToken: string | null } {
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // 1. Locate a refresh-token value for the legacy `cookies` custom header.
  const forwardedCookiesHeader = req.headers.get('cookies');
  const refreshTokenCookie = req.cookies.get('refresh_token')?.value || null;
  const tokenCookie = req.cookies.get('token')?.value || null;
  const refreshToken =
    forwardedCookiesHeader || refreshTokenCookie || tokenCookie || accessToken;

  // 2. Forward the browser's Cookie header verbatim so `req.cookies.token`
  //    resolves on the backend (cookie-parser reads the standard Cookie header).
  //    If the incoming request has no Cookie header but we do have an access
  //    token, synthesise a minimal `token=...` cookie so the backend's first
  //    auth check (`req.cookies.token`) succeeds even for API-only clients.
  const incomingCookieHeader = req.headers.get('cookie');

  const headers: Record<string, string> = {
    'Origin': 'https://sobhagya.in',
    ...extra,
  };
  if (authHeader) headers['Authorization'] = authHeader;
  if (refreshToken) headers['cookies'] = refreshToken;
  if (incomingCookieHeader) {
    headers['Cookie'] = incomingCookieHeader;
  } else if (refreshToken) {
    headers['Cookie'] = `token=${refreshToken}`;
  }

  return { headers, accessToken, refreshToken };
}

/** Forward a JSON request to the chat backend and return its JSON response. */
export async function proxyChatRequest(
  req: NextRequest,
  method: 'GET' | 'POST',
  backendPath: string,
  opts: {
    body?: any;
    searchParams?: URLSearchParams;
    requireAuth?: boolean;
  } = {}
): Promise<NextResponse> {
  try {
    const { headers, accessToken } = buildChatBackendHeaders(req, {
      'Content-Type': 'application/json',
    });

    if (opts.requireAuth !== false && !accessToken) {
      return NextResponse.json(
        { success: false, message: 'No auth token', data: null },
        { status: 401 }
      );
    }

    const qs = opts.searchParams?.toString();
    const url = `${getChatBackendUrl()}${backendPath}${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(opts.body ?? {}) : undefined,
    });

    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, message: text, data: null };
    }
    return NextResponse.json(parsed, { status: res.status });
  } catch (err: any) {
    console.error(`[chat-proxy] ${method} ${backendPath} error:`, err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Error', data: null },
      { status: 500 }
    );
  }
}

/** Copy selected query params from the incoming request into a URLSearchParams. */
export function pickQuery(req: NextRequest, keys: string[]): URLSearchParams {
  const incoming = new URL(req.url).searchParams;
  const out = new URLSearchParams();
  for (const k of keys) {
    const v = incoming.get(k);
    if (v) out.set(k, v);
  }
  return out;
}
