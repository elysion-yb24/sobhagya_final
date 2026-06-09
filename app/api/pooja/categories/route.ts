import { NextRequest } from 'next/server';
import { proxyPooja } from '../_shared';

// GET /api/pooja/categories → user-service GET /api/pooja/catalog/categories (public)
export async function GET(req: NextRequest) {
  return proxyPooja(req, 'GET', '/catalog/categories');
}
