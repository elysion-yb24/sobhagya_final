import { NextRequest } from 'next/server';
import { proxyPayment } from '../../_shared';

// POST /api/pooja/payments/wallet (auth) — settle a pooja order from the user's
// Sobhagya wallet. Owned by payment-service; it debits the wallet and reports
// the order PAID back to user-service.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyPayment(req, 'POST', '/pooja/wallet', { body, requireAuth: true });
}
