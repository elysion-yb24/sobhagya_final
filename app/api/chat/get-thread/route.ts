import { NextRequest } from 'next/server';
import { pickQuery, proxyChatRequest } from '../_shared';

/** GET /api/chat/get-thread → backend GET /chat/api/get-thread */
export async function GET(req: NextRequest) {
  const sp = pickQuery(req, ['providerId', 'userId']);
  return proxyChatRequest(req, 'GET', '/get-thread', { searchParams: sp });
}
