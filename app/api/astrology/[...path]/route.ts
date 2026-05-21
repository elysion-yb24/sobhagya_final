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

// Server-side echo of the client's BirthDetailsForm validation (see
// app/components/astrology/BirthDetailsForm.tsx:111-130). Catches malformed
// requests that bypass the form (curl, mobile webview, replays) so they don't
// burn an upstream call with a body that the user-service will reject anyway.
function validateBirthDetailsBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  const b = body as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const year = num(b.year), month = num(b.month), day = num(b.day);
  const hour = num(b.hour), min = num(b.min);
  const lat = num(b.lat), lon = num(b.lon), tzone = num(b.tzone);
  if (year === null || year < 1900 || year > 2100) return 'Year out of range (1900-2100)';
  if (month === null || month < 1 || month > 12) return 'Invalid month';
  if (day === null || day < 1 || day > 31) return 'Invalid day';
  if (hour === null || hour < 0 || hour > 23) return 'Invalid hour';
  if (min === null || min < 0 || min > 59) return 'Invalid minute';
  if (lat === null || Math.abs(lat) > 90) return 'Latitude out of range';
  if (lon === null || Math.abs(lon) > 180) return 'Longitude out of range';
  if (tzone === null || Math.abs(tzone) > 14) return 'Timezone out of range';
  return null;
}

// Routes that accept a BirthDetails-shaped body (POST). Anything else is
// forwarded as-is — gun-milan has its own two-person shape and isn't worth
// the extra branching here.
const BIRTH_DETAILS_PATHS = new Set([
  'kundli/generate',
  'kundli/chart',
  'kundli/dasha',
  'kundli/ashtakvarga',
  'kundli/kp',
]);

function shouldValidateBirthDetails(segments: string[]): boolean {
  const joined = segments.join('/');
  for (const prefix of BIRTH_DETAILS_PATHS) {
    if (joined === prefix || joined.startsWith(prefix + '/')) return true;
  }
  return false;
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

  // Reject obviously malformed birth-details requests at the edge so the
  // upstream service isn't asked to reason about year=9999 or lat=200.
  const segments = resolved.path[0] === 'api' ? resolved.path.slice(1) : resolved.path;
  if (shouldValidateBirthDetails(segments)) {
    const err = validateBirthDetailsBody(body);
    if (err) {
      return NextResponse.json(
        { success: false, message: err, data: null },
        { status: 400 },
      );
    }
  }

  const result = await apiFetch(forwardPath(resolved, url.searchParams), {
    method: 'POST',
    body,
  });
  return NextResponse.json(result.data, { status: result.status });
}
