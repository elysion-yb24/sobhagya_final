import { NextRequest, NextResponse } from 'next/server';
import { buildChatBackendHeaders } from '../_shared';
import { getChatBackendUrl } from '../../../config/api';

/**
 * POST /api/chat/upload-file → backend POST /chat/api/upload-file
 * Streams the incoming multipart/form-data body to the backend.
 */
export async function POST(req: NextRequest) {
  try {
    const { headers, accessToken } = buildChatBackendHeaders(req);
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'No auth token', data: null },
        { status: 401 }
      );
    }

    // Rebuild multipart body so undici sets a fresh boundary.
    const incoming = await req.formData();
    const fd = new FormData();
    incoming.forEach((value, key) => fd.append(key, value as any));

    // Do NOT set Content-Type manually — fetch will set the correct boundary.
    delete (headers as any)['Content-Type'];

    const res = await fetch(`${getChatBackendUrl()}/chat/upload-file`, {
      method: 'POST',
      headers,
      body: fd,
    });

    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, message: text, data: null };
    }
    return NextResponse.json(parsed, { status: res.status });
  } catch (err: any) {
    console.error('[chat-upload-file] Error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Error', data: null },
      { status: 500 }
    );
  }
}
