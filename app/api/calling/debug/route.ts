import { NextResponse, NextRequest } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

/**
 * Diagnostic endpoint: Tests multiple backend services to identify what's failing.
 * Usage: GET /api/calling/debug?receiverUserId=XXX  (with Authorization header)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const receiverUserId = url.searchParams.get('receiverUserId') || '';
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    receiverUserId,
    authPresent: !!authHeader,
    tests: {},
  };

  // Build common headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Origin': 'https://sobhagya.in',
  };
  if (authHeader) headers['Authorization'] = authHeader;
  if (bearerToken) {
    headers['Cookie'] = `token=${bearerToken}`;
    headers['cookies'] = bearerToken;
  }

  // Test 1: Can we reach the backend at all?
  try {
    const res = await fetch(`${BACKEND_BASE}/calling/api/call/call-token-livekit`, {
      method: 'GET',
      headers,
    });
    results.tests.backendReachable = {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
    };
  } catch (e: any) {
    results.tests.backendReachable = { error: e.message };
  }

  // Test 2: Check user profile via external endpoint (sender - from auth token)
  if (bearerToken) {
    try {
      // Decode JWT payload to get userId (no verification needed, just reading)
      const payload = JSON.parse(Buffer.from(bearerToken.split('.')[1], 'base64').toString());
      results.senderUserId = payload.userId;

      const res = await fetch(`${BACKEND_BASE}/user/api/profile/${payload.userId}`, { headers });
      const text = await res.text();
      results.tests.senderProfile = {
        status: res.status,
        body: text.substring(0, 300),
      };
    } catch (e: any) {
      results.tests.senderProfile = { error: e.message };
    }
  }

  // Test 3: Check receiver profile via external endpoint
  if (receiverUserId) {
    try {
      const res = await fetch(`${BACKEND_BASE}/user/api/profile/${receiverUserId}`, { headers });
      const text = await res.text();
      results.tests.receiverProfile = {
        status: res.status,
        body: text.substring(0, 300),
      };
    } catch (e: any) {
      results.tests.receiverProfile = { error: e.message };
    }
  }

  // Test 4: Check user via users endpoint (the one that returns 404)
  if (receiverUserId) {
    try {
      const res = await fetch(`${BACKEND_BASE}/user/api/users/${receiverUserId}`, { headers });
      const text = await res.text();
      results.tests.receiverUsersEndpoint = {
        status: res.status,
        body: text.substring(0, 300),
      };
    } catch (e: any) {
      results.tests.receiverUsersEndpoint = { error: e.message };
    }
  }

  // Test 5: Wallet balance (known working endpoint)
  if (bearerToken) {
    try {
      const payload = JSON.parse(Buffer.from(bearerToken.split('.')[1], 'base64').toString());
      const res = await fetch(`${BACKEND_BASE}/payment/api/transaction/wallet?userId=${payload.userId}`, { headers });
      const text = await res.text();
      results.tests.walletBalance = {
        status: res.status,
        body: text.substring(0, 300),
      };
    } catch (e: any) {
      results.tests.walletBalance = { error: e.message };
    }
  }

  // Test 6: Try the actual call endpoint with minimal POST
  if (receiverUserId) {
    try {
      const channel = `debug_${Date.now()}`;
      const res = await fetch(`${BACKEND_BASE}/calling/api/call/call-token-livekit?channel=${channel}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          receiverUserId,
          type: 'call',
          appVersion: '1.0.0',
          isScreenShareCall: false,
        }),
      });
      const text = await res.text();
      results.tests.actualCallEndpoint = {
        status: res.status,
        headers: Object.fromEntries(res.headers),
        body: text.substring(0, 500),
      };
    } catch (e: any) {
      results.tests.actualCallEndpoint = { error: e.message };
    }
  }

  console.log('[debug] Diagnostic results:', JSON.stringify(results, null, 2));

  return NextResponse.json(results, { status: 200 });
}
