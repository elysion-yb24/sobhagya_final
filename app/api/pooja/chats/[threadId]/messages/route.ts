import { NextRequest } from 'next/server';
import { pickQuery, proxyPooja } from '../../../_shared';

// GET /api/pooja/chats/[threadId]/messages (auth) — remedy chat history
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await ctx.params;
  const sp = pickQuery(req, ['cursor', 'limit']);
  return proxyPooja(
    req,
    'GET',
    `/chats/${encodeURIComponent(threadId)}/messages`,
    { searchParams: sp, requireAuth: true }
  );
}

// POST /api/pooja/chats/[threadId]/messages (auth) — send message
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return proxyPooja(
    req,
    'POST',
    `/chats/${encodeURIComponent(threadId)}/messages`,
    { body, requireAuth: true }
  );
}
