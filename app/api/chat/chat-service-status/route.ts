import { NextRequest } from 'next/server';
import { proxyChatRequest } from '../_shared';

/** GET /api/chat/chat-service-status → backend GET /chat/api/chat-service-status */
export async function GET(req: NextRequest) {
  return proxyChatRequest(req, 'GET', '/chat/chat-service-status');
}
