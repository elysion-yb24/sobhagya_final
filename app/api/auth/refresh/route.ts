import { NextResponse } from 'next/server';
import { refreshTokensServerSide } from '../../../lib/server-auth';

/**
 * Mint a fresh access token from the HttpOnly refresh cookie.
 *
 * Called by the client-side 401 interceptor (see production-api.ts /
 * auth-utils.ts). Delegates to refreshTokensServerSide(), which re-sets the
 * auth-token + token cookies and returns the new token so the localStorage
 * mirror (used by realtime consumers) can update.
 */
export async function POST() {
  try {
    const token = await refreshTokensServerSide();
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session to refresh' },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('[auth/refresh] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
