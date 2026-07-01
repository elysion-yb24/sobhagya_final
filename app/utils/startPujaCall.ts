'use client';
import { getAuthToken } from './auth-utils';

// The live puja VIDEO call is owned by the mobile (iOS/Android) apps. The web
// only asks calling-service (over HTTP) to ring the astrologer's device; the
// call then continues in the app. We build no video on the web.

/**
 * Ring the astrologer's device for the live puja via the calling BFF.
 * Resolves with the backend JSON ({ success, message, data? }); never rejects.
 */
export async function startPujaCall(payload: { sessionId: string; threadId?: string; orderId?: string }): Promise<any> {
  try {
    const token = getAuthToken();
    const res = await fetch('/api/calling/pooja-start-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return await res.json().catch(() => ({ success: false, message: 'Invalid response' }));
  } catch {
    return { success: false, message: 'Could not reach the call service.' };
  }
}
