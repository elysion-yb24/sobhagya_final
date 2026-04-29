import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'https://sobhagya.in',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    if (bearer) {
      headers['Cookie'] = `token=${bearer}`;
      headers['cookies'] = bearer;
    }

    const res = await fetch(`${BACKEND_BASE}/calling/api/call/accept-call`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({ success: false, message: 'Invalid response' }));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Proxy error', details: String(err) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
