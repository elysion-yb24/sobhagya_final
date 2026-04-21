import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** GET /api/chat/get-current-plan → backend GET /chat/api/get-current-plan */
export async function GET(req: NextRequest) {
  return proxyChatRequest(req, 'GET', '/get-current-plan');
}
