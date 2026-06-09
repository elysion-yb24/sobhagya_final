import { NextRequest } from 'next/server';
import { pickQuery, proxyPooja } from '../_shared';

// GET /api/pooja/products → user-service GET /api/pooja/catalog/products (public)
// Flat shop listing with optional categoryId / search / sort / pagination.
export async function GET(req: NextRequest) {
  const sp = pickQuery(req, ['categoryId', 'search', 'sort', 'page', 'limit']);
  return proxyPooja(req, 'GET', '/catalog/products', { searchParams: sp });
}
