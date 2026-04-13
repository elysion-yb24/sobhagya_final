import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const channel = url.searchParams.get('channel') || '';
    const body = await req.json();

    const backendBase = process.env.BACKEND_BASE_URL || 'https://micro.sobhagya.in';
    const backendUrl = `${backendBase}/calling/api/call/call-token-livekit?channel=${encodeURIComponent(channel)}`;

    // Forward incoming headers (Authorization, cookies, etc.) to backend
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Explicitly forward Authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader) forwardHeaders['Authorization'] = authHeader;

    // Construct proper Cookie header for backend auth middleware
    // Backend expects: req.cookies.token (refresh token) via cookie-parser
    // Fallback: req.headers['cookies'] (bare JWT value)
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (bearerToken) {
      forwardHeaders['Cookie'] = `token=${bearerToken}`;
      forwardHeaders['cookies'] = bearerToken;
    }

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
