import { NextRequest } from 'next/server';
import { proxyPooja } from '../../_shared';

// POST /api/pooja/payments/initiate (auth) — returns PhonePe redirect URL
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyPooja(req, 'POST', '/payments/initiate', { body, requireAuth: true });
}
