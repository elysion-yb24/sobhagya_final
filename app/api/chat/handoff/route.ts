import { NextRequest, NextResponse } from 'next/server';

// Chatterbox (chat.sobhagya.in) base — overridable for local dev where Chatterbox
// runs on http://localhost:9002.
const CHAT_WEB_APP_URL = (process.env.CHAT_WEB_APP_URL || 'https://chat.sobhagya.in').replace(/\/$/, '');
const CHAT_THREAD_URL = `${CHAT_WEB_APP_URL}/chat/`;
const CHAT_THREADS_URL = `${CHAT_WEB_APP_URL}/threads`;

/**
 * Harvest a FRESH access token by pinging user-service's auth middleware (it mints
 * a new token in the `auth-token` header when given an expired bearer + a valid
 * refresh cookie). We seed the fresh token for the chat web app because chat-service
 * uses a different Redis and can't refresh an expired token itself — so it must
 * receive a still-valid access token. Returns null if the token was already valid
 * (no mint) or the ping failed; callers fall back to the existing access token.
 */
async function mintFreshAccess(accessToken: string, refreshToken: string): Promise<string | null> {
  if (!accessToken && !refreshToken) return null;
  // Always mint against the PROD gateway: you log in via prod, so the refresh-token
  // session lives in PROD's Redis. Local services share the same JWT secret, so the
  // freshly-minted token validates at the local chat-service.
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://micro.sobhagya.in').replace(/\/$/, '');
  const url = `${base}/user/api/data`;
  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken || refreshToken}`,
        Cookie: `token=${refreshToken}`,
        cookies: refreshToken,
        Origin: 'https://sobhagya.in',
      },
      cache: 'no-store',
    });
    const minted = r.headers.get('auth-token');
    return minted && minted !== 'null' ? minted : null;
  } catch {
    return null;
  }
}

// Seed userId / access_token / token / role cookies that Chatterbox reads.
//
// - On *.sobhagya.in (prod): set `Domain=.sobhagya.in` so the cookies reach
//   chat.sobhagya.in.
// - On localhost (dev): cookies are scoped by HOST, not port, so a host-only
//   cookie set here (localhost:3000) is also sent to Chatterbox on localhost:9002.
//   We set them without Domain/Secure (http) so the user is auto-authed there too
//   — no separate Chatterbox login for the user.
export async function POST(req: NextRequest) {
  let body: { threadId?: string; userId?: string; role?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const authHeader = req.headers.get('authorization') || '';
  // Access token from the Bearer header, or the main app's HttpOnly `auth-token` cookie.
  const accessToken =
    (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '') ||
    req.cookies.get('auth-token')?.value ||
    '';

  // Refresh token: forwarded `cookies` header, or the main app's `token`
  // (REFRESH_COOKIE) / legacy `refresh_token` cookie.
  const refreshToken =
    req.headers.get('cookies') ||
    req.cookies.get('token')?.value ||
    req.cookies.get('refresh_token')?.value ||
    '';

  const userId = (body.userId || '').trim();
  const role = (body.role || 'user').trim();

  if (!accessToken || !userId) {
    return NextResponse.json(
      { ok: false, message: 'Missing accessToken or userId' },
      { status: 400 }
    );
  }

  const threadId = (body.threadId || '').trim();
  const chatUrl = threadId
    ? `${CHAT_THREAD_URL}${encodeURIComponent(threadId)}`
    : CHAT_THREADS_URL;

  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  const isSobhagyaHost = host === 'sobhagya.in' || host.endsWith('.sobhagya.in');

  // Prod: cross-subdomain cookie. Dev: host-only cookie (shared across localhost ports).
  const baseAttrs = isSobhagyaHost
    ? 'Domain=.sobhagya.in; Path=/; Secure; SameSite=None'
    : 'Path=/; SameSite=Lax';

  // chat-service can only validate a still-valid access token (it can't refresh),
  // so seed a freshly-minted one (falling back to the current token if valid/no mint).
  const fresh = await mintFreshAccess(accessToken, refreshToken);
  const seededAccess = fresh || accessToken;

  const res = NextResponse.json({ ok: true, chatUrl, mode: isSobhagyaHost ? 'cookies' : 'cookies-localhost' });
  res.headers.append('Set-Cookie', `userId=${encodeURIComponent(userId)}; ${baseAttrs}`);
  res.headers.append('Set-Cookie', `access_token=${encodeURIComponent(seededAccess)}; ${baseAttrs}`);
  if (refreshToken) {
    res.headers.append('Set-Cookie', `token=${encodeURIComponent(refreshToken)}; ${baseAttrs}; HttpOnly`);
  }
  res.headers.append('Set-Cookie', `role=${encodeURIComponent(role)}; ${baseAttrs}`);

  return res;
}
