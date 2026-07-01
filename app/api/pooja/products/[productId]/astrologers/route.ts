import { NextRequest } from 'next/server';
import { proxyPooja } from '../../../_shared';

// GET /api/pooja/products/[productId]/astrologers (public)
// Survey-driven per-remedy roster (requirement #4/#5). Empty array → the UI
// shows "No Astrologers found for this pooja."
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ productId: string }> }
) {
  const { productId } = await ctx.params;
  return proxyPooja(req, 'GET', `/catalog/products/${encodeURIComponent(productId)}/astrologers`);
}
