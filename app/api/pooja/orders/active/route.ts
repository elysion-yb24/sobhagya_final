import { NextRequest } from 'next/server';
import { proxyPooja, pickQuery } from '../../_shared';

// GET /api/pooja/orders/active?productId=&providerId= (auth) — returns the user's
// existing LIVE order for this remedy+astrologer (or null) so checkout can detect
// "already booked & paid" without creating a stray PENDING order. Declared as a
// static segment so it wins over the dynamic /orders/[orderId] route.
export async function GET(req: NextRequest) {
  return proxyPooja(req, 'GET', '/orders/active', {
    requireAuth: true,
    searchParams: pickQuery(req, ['productId', 'providerId']),
  });
}
