import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** POST /api/chat/user-details → backend POST /chat/api/user-details */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyChatRequest(req, 'POST', '/chat/user-details', { body });
}
