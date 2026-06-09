import { NextRequest } from 'next/server';
import { proxyPooja } from '../../_shared';

// GET /api/pooja/products/[productId] (public)
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ productId: string }> }
) {
  const { productId } = await ctx.params;
  return proxyPooja(req, 'GET', `/catalog/products/${encodeURIComponent(productId)}`);
}
