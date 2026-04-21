import { NextRequest, NextResponse } from 'next/server';
import { proxyChatRequest } from '../_shared';

/**
 * POST /api/chat/create-session → backend POST /chat/api/create-session
 * Body: { userId, providerId }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyChatRequest(req, 'POST', '/create-session', { body });
}
