import { NextRequest } from 'next/server';
import { proxyPooja } from '../../_shared';

// GET /api/pooja/orders/[orderId] (auth) — status polling (+ reconcile)
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  return proxyPooja(req, 'GET', `/orders/${encodeURIComponent(orderId)}`, { requireAuth: true });
}
