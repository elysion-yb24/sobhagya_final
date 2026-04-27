import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** POST /api/chat/partner-details → backend POST /chat/api/partner-details */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyChatRequest(req, 'POST', '/chat/partner-details', { body });
}
