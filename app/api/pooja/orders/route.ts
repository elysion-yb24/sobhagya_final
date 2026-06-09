import { NextRequest } from 'next/server';
import { pickQuery, proxyPooja } from '../_shared';

// POST /api/pooja/orders (auth) — create order (idempotent)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyPooja(req, 'POST', '/orders', { body, requireAuth: true });
}

// GET /api/pooja/orders (auth) — order history / purchased
export async function GET(req: NextRequest) {
  const sp = pickQuery(req, ['status']);
  return proxyPooja(req, 'GET', '/orders', { searchParams: sp, requireAuth: true });
}
