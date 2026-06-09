import { NextRequest } from 'next/server';
import { pickQuery, proxyPooja } from '../../../_shared';

// GET /api/pooja/categories/[categoryId]/products (public, paginated)
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await ctx.params;
  const sp = pickQuery(req, ['page', 'limit']);
  return proxyPooja(
    req,
    'GET',
    `/catalog/categories/${encodeURIComponent(categoryId)}/products`,
    { searchParams: sp }
  );
}
