import { NextRequest } from 'next/server';
import { proxyPooja } from '../../_shared';

// POST /api/pooja/payments/wallet (auth) — settle an order from the user's
// Sobhagya wallet balance. Proxies to user-service which debits the wallet and
// marks the order PAID.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyPooja(req, 'POST', '/payments/wallet', { body, requireAuth: true });
}
