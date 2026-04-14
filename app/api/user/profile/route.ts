import { NextResponse, NextRequest } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

/**
 * GET /api/user/profile
 * Proxy to backend GET /user/api/data (authenticated, returns user profile)
 */
export async function GET(req: NextRequest) {
  try {
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

    const backendUrl = `${BACKEND_BASE}/user/api/data`;
    console.log('[user-profile] GET:', backendUrl);

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    const text = await res.text();
    console.log('[user-profile] Response:', res.status, text.substring(0, 300));

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, message: text };
    }

    return NextResponse.json(parsed, { status: res.status });
  } catch (err: any) {
    console.error('[user-profile] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
