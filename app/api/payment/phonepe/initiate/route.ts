import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, getAuthCookies } from '../../../../lib/server-auth';

// Same-origin BFF route: echo the caller's origin instead of a wildcard.
function corsHeaders(req: NextRequest) {
  return {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  } as Record<string, string>;
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request);
  try {
    const body = await request.json();

    // Auth is taken from the HttpOnly cookie — the client no longer needs to
    // attach a Bearer token. The backend also reads the token from a ?token=
    // query param, so forward the cookie's access token there too.
    const { accessToken } = await getAuthCookies();

    const result = await apiFetch('/payment/api/transaction/phonepe/initiate', {
      method: 'POST',
      body,
      query: accessToken ? { token: accessToken } : undefined,
    });

    return NextResponse.json(result.data, { status: result.status, headers });
  } catch (error) {
    console.error('[phonepe/initiate] proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate PhonePe payment' },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders(request) });
}
