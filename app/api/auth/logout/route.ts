import { NextResponse } from 'next/server';
import { apiFetch, clearAuthCookies } from '../../../lib/server-auth';

export async function POST() {
  try {
    await apiFetch('/auth/api/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Backend logout call failed, clearing cookies anyway:', err);
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
