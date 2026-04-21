import { NextRequest, NextResponse } from 'next/server';
import { getChatBackendUrl } from '../../config/api';

/**
 * Build the headers forwarded to the chat-service backend.
 * Backend middleware accepts the access token via `Authorization: Bearer ...`
 * and the refresh token via a custom `cookies` header (legacy convention).
 *
 * We extract:
 *  - access token from the Authorization header
 *  - refresh token from either the incoming `cookies` header or the
 *    `refresh_token` browser cookie
 */
export function buildChatBackendHeaders(
  req: NextRequest,
  extra: Record<string, string> = {}
): { headers: Record<string, string>; accessToken: string | null; refreshToken: string | null } {
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Refresh token: honour explicit `cookies` header first, then fall back to
  // reading `refresh_token` from the request cookie jar.
  const forwardedCookiesHeader = req.headers.get('cookies');
  const refreshTokenCookie = req.cookies.get('refresh_token')?.value || null;
  const refreshToken = forwardedCookiesHeader || refreshTokenCookie;

  const headers: Record<string, string> = {
    'Origin': 'https://sobhagya.in',
    ...extra,
  };
  if (authHeader) headers['Authorization'] = authHeader;
  if (refreshToken) headers['cookies'] = refreshToken;

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
