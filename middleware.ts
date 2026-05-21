import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'auth-token';

const PROTECTED_PREFIXES = [
  '/chat',
  '/wallet',
  '/history',
  '/my-profile',
  '/astrologer-video-call',
  '/audio-call',
  '/video-call',
  '/partner-info',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const hasAuth = !!req.cookies.get(ACCESS_COOKIE)?.value;
  if (hasAuth) return NextResponse.next();

  // No access cookie — gate at the edge so users don't see a flash of protected
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
  ],
};
