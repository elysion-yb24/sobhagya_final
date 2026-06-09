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
    const { accessToken } = await getAuthCookies();

    const result = await apiFetch('/payment/api/transaction/phonepe-status-check', {
      method: 'POST',
      body,
      query: accessToken ? { token: accessToken } : undefined,
    });

    return NextResponse.json(result.data, { status: result.status, headers });
  } catch (error) {
    console.error('[phonepe/status-check] proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check PhonePe payment status' },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders(request) });
}
