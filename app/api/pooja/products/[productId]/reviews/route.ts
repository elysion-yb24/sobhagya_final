import { NextRequest } from 'next/server';
import { proxyPooja, pickQuery } from '../../../_shared';

// GET /api/pooja/products/[productId]/reviews (public)
// Testimonials derived from real completed-order feedback for this product.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ productId: string }> }
) {
  const { productId } = await ctx.params;
  return proxyPooja(req, 'GET', `/catalog/products/${encodeURIComponent(productId)}/reviews`, {
    searchParams: pickQuery(req, ['page', 'limit']),
  });
}
