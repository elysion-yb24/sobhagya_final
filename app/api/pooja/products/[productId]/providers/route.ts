import { NextRequest } from 'next/server';
import { pickQuery, proxyPooja } from '../../../_shared';

// GET /api/pooja/products/[productId]/providers (public) — pandit selection
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ productId: string }> }
) {
  const { productId } = await ctx.params;
  const sp = pickQuery(req, ['sort', 'language']);
  return proxyPooja(
    req,
    'GET',
    `/catalog/products/${encodeURIComponent(productId)}/providers`,
    { searchParams: sp }
  );
}
