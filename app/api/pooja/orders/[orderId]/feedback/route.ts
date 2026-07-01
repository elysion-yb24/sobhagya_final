import { NextRequest } from 'next/server';
import { proxyPooja } from '../../../_shared';

// POST /api/pooja/orders/[orderId]/feedback (auth)
// Devotee ★ + text feedback after a completed live puja. Idempotent (one per order).
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  return proxyPooja(req, 'POST', `/orders/${encodeURIComponent(orderId)}/feedback`, { body, requireAuth: true });
}
