import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** GET /api/chat/redeem-credits → backend GET /chat/api/redeem-credits */
export async function GET(req: NextRequest) {
  return proxyChatRequest(req, 'GET', '/redeem-credits');
}
