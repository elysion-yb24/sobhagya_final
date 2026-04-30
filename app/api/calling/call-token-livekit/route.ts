import { NextResponse, NextRequest } from 'next/server';
import { getAuthCookies } from '../../../lib/server-auth';
const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

// Build CORS headers dynamically so we can echo the incoming origin and allow credentials
function getCorsHeaders(req?: NextRequest) {
  const origin = req?.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'auth-token',
  } as Record<string, string>;
}

/**
 * GET Handler — Supports polling for active calls
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const astrologerId = url.searchParams.get('astrologerId');

    console.log(`[call-token-livekit] GET request received. action=${action}, astrologerId=${astrologerId}`);

    // Build the target URL with existing search params
    const backendQueryParams = new URLSearchParams(url.searchParams);

    const { accessToken, refreshToken } = await getAuthCookies();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: 'Authentication failed, Please log in.' }, { 
        status: 401,
        headers: getCorsHeaders(req)
      });
    }

    const backendUrl = `${BACKEND_BASE}/calling/api/call/call-token-livekit?${backendQueryParams.toString()}`;

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `token=${refreshToken}`,
      'cookies': refreshToken,
    };

    console.log('[call-token-livekit] GET Proxying to:', backendUrl);

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: forwardHeaders,
    });

    const data = await res.json();
    return NextResponse.json(data, { 
      status: res.status,
      headers: getCorsHeaders(req) 
    });
  } catch (err) {
    console.error('[call-token-livekit] GET error', err);
    return NextResponse.json({ success: false, message: 'Proxy GET error', details: String(err) }, { 
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

/**
 * POST Handler — Supports initiating calls
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const channel = url.searchParams.get('channel') || '';
    const body = await req.json();

    const { accessToken, refreshToken } = await getAuthCookies();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: 'Authentication failed, Please log in.' }, { 
        status: 401,
        headers: getCorsHeaders(req)
      });
    }

    const backendQueryParams = new URLSearchParams(url.searchParams);

    const backendUrl = `${BACKEND_BASE}/calling/api/call/call-token-livekit?${backendQueryParams.toString()}`;

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'https://sobhagya.in',
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `token=${refreshToken}`,
      'cookies': refreshToken,
    };

    console.log('[call-token-livekit] POST Proxying to:', backendUrl);
    console.log('[call-token-livekit] receiverUserId:', body.receiverUserId);
    console.log('[call-token-livekit] Auth present:', !!accessToken);

    // Pre-flight: ensure caller has a profile in user-service (fixes missing profile bug)
    try {
      const ensureRes = await fetch(`${BACKEND_BASE}/user/api/ensure-profile`, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify({ phone: 'unknown' }),
      });
      const ensureData = await ensureRes.json().catch(() => null);
      console.log('[call-token-livekit] ensure-profile result:', ensureRes.status, JSON.stringify(ensureData));
    } catch (epErr) {
      console.warn('[call-token-livekit] ensure-profile check failed (non-fatal):', epErr);
    }

    // Ensure receiverUserId is sent as a String (required by backend Express Validator)
    const finalBody = { ...body };
    if (body.receiverUserId !== undefined) {
      finalBody.receiverUserId = String(body.receiverUserId);
    }

    console.log('[call-token-livekit] Request body being sent:', JSON.stringify(finalBody));
    console.log('[call-token-livekit] Request headers:', Object.fromEntries(
      Object.entries(forwardHeaders).map(([k, v]) => [k, typeof v === 'string' && v.length > 100 ? v.substring(0, 50) + '...' : v])
    ));

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(finalBody),
    });

    const text = await res.text();
    console.log(`[call-token-livekit] Backend response: status=${res.status}`);
    
    let parsed: any;
    try {
      if (text) {
        parsed = JSON.parse(text);
      } else {
        console.warn('[call-token-livekit] Backend returned empty response');
        parsed = { success: false, message: 'Empty response from backend' };
      }
    } catch (e) {
      console.error('[call-token-livekit] Failed to parse backend response as JSON:', text);
      parsed = { success: false, message: 'Server error: Invalid response format', details: text.substring(0, 100) };
    }

    // Capture the balance/token from successful response for logging (sanitized)
    if (parsed.success && parsed.data) {
      console.log('[call-token-livekit] Success: Token generated, room:', parsed.data.channel);
    } else {
      console.log('[call-token-livekit] Backend returned error:', parsed.message || 'Unknown error');
    }

    return NextResponse.json(parsed, { 
      status: res.status,
      headers: getCorsHeaders(req)
    });
  } catch (err) {
    console.error('[call-token-livekit] POST error', err);
    return NextResponse.json({ success: false, message: 'Proxy POST error', details: String(err) }, { 
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

/**
 * OPTIONS Handler — Supports pre-flight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}
