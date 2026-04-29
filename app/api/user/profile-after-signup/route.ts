import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '../../../lib/server-auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = await apiFetch('/user/api/profile-after-sign-up', { method: 'POST', body });
  return NextResponse.json(result.data, { status: result.status });
}
