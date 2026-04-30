import { NextResponse } from 'next/server';
import { getAuthCookies } from '../../../lib/server-auth';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const channel = url.searchParams.get('channel') || '';
    const body = await req.json();

    const backendBase = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';
    const backendUrl = `${backendBase}/calling/api/call/call-token-livekit?channel=${encodeURIComponent(channel)}`;

    const { accessToken, refreshToken } = await getAuthCookies();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: 'Authentication failed, Please log in.' }, { status: 401 });
    }

    // Forward incoming headers (Authorization, cookies, etc.) to backend
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `token=${refreshToken}`,
      'cookies': refreshToken,
    };

    console.log('[proxy-livekit-token] forwarding body:', JSON.stringify(body));
    console.log('[proxy-livekit-token] to backendUrl:', backendUrl);

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log('[proxy-livekit-token] backend raw response:', text);
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('[proxy-livekit-token] Failed to parse backend response as JSON');
    }

    if (!res.ok) {
      console.error('[proxy-livekit-token] backend responded with error', { status: res.status, body: parsed });
      // Ensure we return a string message to the client (avoid objects becoming [object Object])
      let messageStr = `Backend error ${res.status}`;
      if (parsed && typeof parsed === 'object') {
        messageStr = parsed.message || parsed.error || JSON.stringify(parsed);
      } else if (parsed) {
        messageStr = String(parsed);
      }
      return NextResponse.json({ success: false, message: messageStr }, { status: res.status });
    }

    return NextResponse.json(parsed, { status: res.status });
  } catch (err) {
    console.error('[proxy-livekit-token] error', err);
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 });
  }
}
