import { NextRequest, NextResponse } from 'next/server';

const CHAT_THREAD_URL = 'https://chat.sobhagya.in/chat/';
const CHAT_THREADS_URL = 'https://chat.sobhagya.in/threads';

// Browser equivalent of the Flutter `_onTapHandler` cookie seeding step.
// Sets userId / access_token / token / role on `.sobhagya.in` so they are
// delivered to chat.sobhagya.in (Chatterbox) on the next request.
//
// Localhost / non-sobhagya.in hosts: browsers reject `Domain=.sobhagya.in`
// from a foreign host, so we fall back to URL-param navigation (today's
// behaviour) just to keep `npm run dev` from breaking outright.
export async function POST(req: NextRequest) {
  let body: { threadId?: string; userId?: string; role?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const authHeader = req.headers.get('authorization') || '';
  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : '';

  const forwardedRefresh = req.headers.get('cookies') || '';
  const refreshTokenCookie = req.cookies.get('refresh_token')?.value || '';
  const refreshToken = forwardedRefresh || refreshTokenCookie;

  const userId = (body.userId || '').trim();
  const role = (body.role || 'user').trim();

  if (!accessToken || !userId) {
    return NextResponse.json(
      { ok: false, message: 'Missing accessToken or userId' },
      { status: 400 }
    );
  }

  const threadId = (body.threadId || '').trim();
  const chatUrlBase = threadId
    ? `${CHAT_THREAD_URL}${encodeURIComponent(threadId)}`
    : CHAT_THREADS_URL;

  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  const isSobhagyaHost = host === 'sobhagya.in' || host.endsWith('.sobhagya.in');

  if (!isSobhagyaHost) {
    // Dev fallback: cannot set Domain=.sobhagya.in cookies from this origin.
    // Return a URL-param URL so localhost at least navigates somewhere.
    const qs = new URLSearchParams({ userId, access_token: accessToken, role });
    if (refreshToken) qs.set('token', refreshToken);
    return NextResponse.json({
      ok: true,
      chatUrl: `${chatUrlBase}?${qs.toString()}`,
      mode: 'url-params-dev-fallback',
    });
  }

  const res = NextResponse.json({
    ok: true,
    chatUrl: chatUrlBase,
    mode: 'cookies',
  });

  const baseAttrs = 'Domain=.sobhagya.in; Path=/; Secure; SameSite=None';
  res.headers.append(
    'Set-Cookie',
    `userId=${encodeURIComponent(userId)}; ${baseAttrs}`
  );
  res.headers.append(
    'Set-Cookie',
    `access_token=${encodeURIComponent(accessToken)}; ${baseAttrs}`
  );
  if (refreshToken) {
    res.headers.append(
      'Set-Cookie',
      `token=${encodeURIComponent(refreshToken)}; ${baseAttrs}; HttpOnly`
    );
  }
  res.headers.append(
    'Set-Cookie',
    `role=${encodeURIComponent(role)}; ${baseAttrs}`
  );

  return res;
}
