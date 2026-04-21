import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** GET /api/chat/get-plans → backend GET /chat/api/get-plans */
export async function GET(req: NextRequest) {
  return proxyChatRequest(req, 'GET', '/get-plans');
}
