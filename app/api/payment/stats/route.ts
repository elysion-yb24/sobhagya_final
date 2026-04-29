import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '../../../lib/server-auth';

export async function GET(request: NextRequest) {
  const days = request.nextUrl.searchParams.get('days') || '7';
  const result = await apiFetch('/payment/api/transaction/stats', {
    method: 'GET',
    query: { days },
  });
  return NextResponse.json(result.data, { status: result.status });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
