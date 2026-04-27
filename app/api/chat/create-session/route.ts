import { NextRequest, NextResponse } from 'next/server';
import { proxyChatRequest } from '../_shared';

/**
 * POST /api/chat/create-session → backend POST /chat/api/chat/create-session.
 * Gateway strips the leading `/chat/`, so the chat-service receives
 * `/api/chat/create-session` (mounted at `/api/chat` in chat-service/src/app.js).
 * Body: { userId, providerId }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyChatRequest(req, 'POST', '/chat/create-session', { body });
}
