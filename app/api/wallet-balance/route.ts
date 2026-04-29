import { NextResponse } from 'next/server';
import { apiFetch } from '../../lib/server-auth';

export async function GET() {
  const result = await apiFetch('/payment/api/transaction/wallet-balance', { method: 'GET' });
  return NextResponse.json(result.data, { status: result.status });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
