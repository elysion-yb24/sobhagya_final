import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../../_shared';

/** POST /api/chat/session/decline → backend POST /chat/api/session/decline */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyChatRequest(req, 'POST', '/chat/session/decline', { body });
}
