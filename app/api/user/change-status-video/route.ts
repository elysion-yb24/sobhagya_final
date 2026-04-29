import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '../../../lib/server-auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = await apiFetch('/user/api/change-status-video', {
    method: 'POST',
    body,
  });
  return NextResponse.json(result.data, { status: result.status });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
