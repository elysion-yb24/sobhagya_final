import { NextRequest } from 'next/server';
import { pickQuery, proxyChatRequest } from '../_shared';

/**
 * GET /api/chat/threads → backend GET /chat/api/threads
 * Query params forwarded: lastTimeStamp, limit
 */
export async function GET(req: NextRequest) {
  const sp = pickQuery(req, ['lastTimeStamp', 'limit']);
  return proxyChatRequest(req, 'GET', '/chat/threads', { searchParams: sp });
}
