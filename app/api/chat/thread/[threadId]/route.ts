import { NextRequest, NextResponse } from 'next/server';
import { proxyChatRequest } from '../../_shared';

/** GET /api/chat/thread/[threadId] → backend GET /chat/api/thread/:threadId */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ threadId: string }> } | { params: { threadId: string } }
) {
  const params = await Promise.resolve((ctx as any).params);
  const { threadId } = params as { threadId: string };
  if (!threadId) {
    return NextResponse.json(
      { success: false, message: 'threadId required', data: null },
      { status: 400 }
    );
  }
  return proxyChatRequest(req, 'GET', `/thread/${encodeURIComponent(threadId)}`);
}
