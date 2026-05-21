import { NextResponse } from 'next/server';
import { apiFetch, clearAuthCookies } from '../../../lib/server-auth';

export async function POST() {
  try {
    const result = await apiFetch('/auth/api/logout', { method: 'POST' });
    if (!result.ok) {
      console.warn(`[auth/logout] backend returned ${result.status}`,
        typeof result.data === 'object' ? (result.data as any)?.message : undefined);
    }
  } catch (err) {
    console.warn('Backend logout call failed, clearing cookies anyway:', err);
  }

  // Always clear local cookies — user intent is to log out, and a backend
  // failure must not leave them stuck logged in client-side.
  await clearAuthCookies();
  return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
