import { NextResponse, NextRequest } from 'next/server';
import { getAuthCookies } from '../../../lib/server-auth';

const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

function getCorsHeaders(req?: NextRequest) {
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
 * POST /api/calling/pooja-start-call → calling-service /api/call/pooja-start-call.
 * Rings the astrologer's device for the booked live puja. The video call itself
 * runs on the mobile (iOS/Android) apps — we mint no token on the web.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accessToken, refreshToken } = await getAuthCookies();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed, Please log in.' },
        { status: 401, headers: getCorsHeaders(req) },
      );
    }

    const res = await fetch(`${BACKEND_BASE}/calling/api/call/pooja-start-call`, {
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
      parsed = { success: false, message: 'Invalid response format' };
    }
    return NextResponse.json(parsed, { status: res.status, headers: getCorsHeaders(req) });
  } catch (err) {
    console.error('[pooja-start-call] POST error', err);
    return NextResponse.json(
      { success: false, message: 'Proxy POST error', details: String(err) },
      { status: 500, headers: getCorsHeaders() },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders() });
}
