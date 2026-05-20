import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '../../../lib/server-auth';

// Server-side proxy for the astrology feature endpoints on user-service:
//   /api/astrology/kundli/generate         -> /user/api/kundli/generate
//   /api/astrology/kundli/mobile           -> /user/api/kundli/mobile
//   /api/astrology/kundli/chart/:chartId   -> /user/api/kundli/chart/:chartId
//   /api/astrology/kundli/dasha/:kind      -> /user/api/kundli/dasha/:kind
//   /api/astrology/kundli/ashtakvarga/:scope
//   /api/astrology/kundli/kp/:kind
//   /api/astrology/gun-milan/match
//   /api/astrology/horoscope
//   /api/astrology/geocode
//
// We can't call user-service directly from the browser because:
//   1. user-service's authMiddleware requires the refresh token via a custom
//      `cookies` header (or `req.cookies.token`), but the backend CORS config
//      doesn't whitelist `cookies` as an allowed request header, so preflight
//      blocks the browser fetch.
//   2. Even if it did, the HttpOnly auth cookies live on the localhost domain
//      and don't get sent to micro.sobhagya.in cross-origin.
//
// apiFetch (server-side) reads the cookies from the Next.js request and forwards
// both the Authorization header and `Cookie: token=...` to user-service, which
// is what authMiddleware actually expects.

function forwardPath(
  params: { path: string[] },
  searchParams: URLSearchParams,
): string {
  // featureApi paths already include the leading `api/...` segment that
  // matches user-service's mount point. Drop a duplicate `api` if the caller
  // happened to include it, then prefix with /user/api/ so nginx routes it.
  const segments = params.path[0] === 'api' ? params.path.slice(1) : params.path;
  const sub = segments.join('/');
  const qs = searchParams.toString();
  return `/user/api/${sub}${qs ? `?${qs}` : ''}`;
}

async function readBody(request: NextRequest): Promise<unknown> {
  const text = await request.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolved = await params;
  const url = new URL(request.url);
  const result = await apiFetch(forwardPath(resolved, url.searchParams), {
    method: 'GET',
  });
  return NextResponse.json(result.data, { status: result.status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolved = await params;
  const url = new URL(request.url);
  const body = await readBody(request);
  const result = await apiFetch(forwardPath(resolved, url.searchParams), {
    method: 'POST',
    body,
  });
  return NextResponse.json(result.data, { status: result.status });
}
