import { NextRequest } from 'next/server';
import { proxyPooja } from '../../_shared';

// POST /api/pooja/orders/quote (auth) — server-authoritative price breakdown
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyPooja(req, 'POST', '/orders/quote', { body, requireAuth: true });
}
