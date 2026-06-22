import { NextResponse, NextRequest } from 'next/server';
import { getAuthCookies } from '../../../lib/server-auth';

const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

// Local dev can point straight at the calling-service (e.g. http://localhost:8001,
// no `/calling` gateway prefix); prod goes through the gateway.
function callingTokenUrl(): string {
  const local = process.env.CALLING_SERVICE_URL;
  return local ? `${local}/api/call/pooja-live-token` : `${BACKEND_BASE}/calling/api/call/pooja-live-token`;
}

function corsHeaders(req?: NextRequest) {
  const origin = req?.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'auth-token',
  } as Record<string, string>;
}

/**
 * POST /api/calling/pooja-live-token → calling-service /api/call/pooja-live-token.
 * Used by the main app's native /chat (billed-chat surface). The chat web app
 * mints its own token via its gateway, so it does not use this route.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accessToken, refreshToken } = await getAuthCookies();
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed, Please log in.' },
        { status: 401, headers: corsHeaders(req) }
      );
    }
    const res = await fetch(callingTokenUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://sobhagya.in',
        Authorization: `Bearer ${accessToken}`,
        Cookie: `token=${refreshToken}`,
        cookies: refreshToken,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : { success: false, message: 'Empty response from backend' };
    } catch {
      parsed = { success: false, message: 'Invalid response format', details: text.slice(0, 120) };
    }
    return NextResponse.json(parsed, { status: res.status, headers: corsHeaders(req) });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Proxy POST error', details: String(err) },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}
