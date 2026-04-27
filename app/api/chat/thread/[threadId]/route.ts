import { NextRequest, NextResponse } from 'next/server';
import { proxyChatRequest } from '../../_shared';

/** GET /api/chat/thread/[threadId] → backend GET /chat/api/thread/:threadId */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await ctx.params;
  if (!threadId) {
    return NextResponse.json(
      { success: false, message: 'threadId required', data: null },
      { status: 400 }
    );
  }
  return proxyChatRequest(req, 'GET', `/chat/thread/${encodeURIComponent(threadId)}`);
}
