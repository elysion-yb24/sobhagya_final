import { NextResponse, NextRequest } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

/**
 * Proxy for POST /user/api/ensure-profile
 * Ensures the logged-in user has a profile in the user-service.
 * Creates one if missing (fixes failed RabbitMQ registration).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'No auth token' }, { status: 401 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'Origin': 'https://sobhagya.in',
    };
    if (bearerToken) {
      headers['Cookie'] = `token=${bearerToken}`;
      headers['cookies'] = bearerToken;
    }

    const backendUrl = `${BACKEND_BASE}/user/api/ensure-profile`;
    console.log('[ensure-profile] Calling:', backendUrl);

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log('[ensure-profile] Response:', res.status, text.substring(0, 300));

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, message: text };
    }

    return NextResponse.json(parsed, { status: res.status });
  } catch (err: any) {
    console.error('[ensure-profile] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
