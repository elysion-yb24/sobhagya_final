import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '../../lib/server-auth';

export async function GET(request: NextRequest) {
  const skip = request.nextUrl.searchParams.get('skip') || '0';
  const limit = request.nextUrl.searchParams.get('limit') || '10';
  const isTransactions = request.nextUrl.searchParams.get('isTransactions');

  const query: Record<string, string> = { skip, limit };
  if (isTransactions !== null) query.isTransactions = isTransactions;

  const result = await apiFetch('/payment/api/transaction/transactions', {
    method: 'GET',
    query,
  });
  return NextResponse.json(result.data, { status: result.status });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
