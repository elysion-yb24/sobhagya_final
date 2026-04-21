import { NextRequest, NextResponse } from 'next/server';
import { pickQuery, proxyChatRequest } from '../../_shared';

/**
 * GET /api/chat/messages/[threadId] → backend GET /chat/api/thread/messages/:threadId
 */
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

  const sp = pickQuery(req, ['lastTimeStamp', 'limit']);
  return proxyChatRequest(
    req,
    'GET',
    `/thread/messages/${encodeURIComponent(threadId)}`,
    { searchParams: sp }
  );
}
