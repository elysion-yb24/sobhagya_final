import { NextResponse, NextRequest } from 'next/server';

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

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const backendUrl = `${BACKEND_BASE}/calling/api/call/call-token-livekit?${backendQueryParams.toString()}`;

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) forwardHeaders['Authorization'] = authHeader;

    // Construct proper Cookie header for backend auth middleware
    // Backend expects: req.cookies.token (refresh token) via cookie-parser
    // Fallback: req.headers['cookies'] (bare JWT value)
    if (bearerToken) {
      forwardHeaders['Cookie'] = `token=${bearerToken}`;
      forwardHeaders['cookies'] = bearerToken;
    }

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

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const backendQueryParams = new URLSearchParams(url.searchParams);

    const backendUrl = `${BACKEND_BASE}/calling/api/call/call-token-livekit?${backendQueryParams.toString()}`;

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'https://sobhagya.in',
    };

    if (authHeader) forwardHeaders['Authorization'] = authHeader;

    // Construct proper Cookie header for backend auth middleware
    // Backend expects: req.cookies.token (refresh token) via cookie-parser
    // Fallback: req.h
    // eaders['cookies'] (bare JWT value)
    if (bearerToken) {
      forwardHeaders['Cookie'] = `token=${bearerToken}`;
      forwardHeaders['cookies'] = bearerToken;
    }

    console.log('[call-token-livekit] POST Proxying to:', backendUrl);
    console.log('[call-token-livekit] receiverUserId:', body.receiverUserId);
    console.log('[call-token-livekit] Auth present:', !!authHeader);

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
    console.log('[call-token-livekit] backend HTTP status:', res.status);
    console.log('[call-token-livekit] backend response headers:', Object.fromEntries(res.headers));
    console.log('[call-token-livekit] backend raw response (first 500 chars):', text.substring(0, 500));
    
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('[call-token-livekit] Failed to parse backend response as JSON');
      parsed = { success: false, message: text };
    }

    // If backend returned an error, inject diagnostic info so browser console shows it
    if (parsed && parsed.success === false) {
      parsed._debug = {
        backendStatus: res.status,
        backendHeaders: Object.fromEntries(res.headers),
        proxyTimestamp: new Date().toISOString(),
        requestedUrl: backendUrl,
      };
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
