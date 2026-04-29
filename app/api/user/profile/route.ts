import { NextResponse } from 'next/server';
import { apiFetch } from '../../../lib/server-auth';

export async function GET() {
  const result = await apiFetch('/user/api/data', { method: 'GET' });
  return NextResponse.json(result.data, { status: result.status });
}
