import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** GET /api/chat/check-credits → backend GET /chat/api/check-credits */
export async function GET(req: NextRequest) {
  return proxyChatRequest(req, 'GET', '/check-credits');
}
