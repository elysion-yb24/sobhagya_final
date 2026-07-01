import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'auth-token';
const REFRESH_COOKIE = 'token';

/**
 * Best-effort check that a JWT's `exp` claim is still in the future. No
 * signature verification — the backend remains the source of truth; this only
 * lets the edge avoid serving protected pages with an obviously-dead token.
 * Returns true when the token is missing an exp or can't be parsed (fail-open).
 */
function isJwtUsable(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json);
    if (typeof exp !== 'number') return true;
    return exp * 1000 > Date.now();
  } catch {
    return true;
  }
}

const PROTECTED_PREFIXES = [
  '/chat',
  '/wallet',
  '/history',
  '/my-profile',
  '/astrologer-video-call',
  '/audio-call',
  '/video-call',
  '/partner-info',
  '/free-kundli',
  '/services/gun-milan',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // Allow through when the access token is still usable, OR when a refresh
  // cookie exists (the client-side 401 interceptor will mint a fresh access
  // token). Access cookies live 7 days but refresh cookies 90 — bouncing a
  // user with a valid refresh to /login would be wrong.
  if (isJwtUsable(accessToken) || refreshToken) return NextResponse.next();

  // No usable session — gate at the edge so users don't see a flash of protected
  // content before the client-side check kicks in. Client guards remain in place
  // for mid-session expiry; this is purely a fast path.
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', pathname + (search || ''));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/wallet/:path*',
    '/history/:path*',
    '/my-profile/:path*',
    '/astrologer-video-call/:path*',
    '/audio-call/:path*',
    '/video-call/:path*',
    '/partner-info/:path*',
    '/free-kundli/:path*',
    '/services/gun-milan/:path*',
  ],
};
