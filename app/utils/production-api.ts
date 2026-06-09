import { getAuthToken, refreshAccessToken, handleSessionExpired } from './auth-utils';

async function doRequest(url: string, options: RequestInit, bearer: string | null) {
  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (bearer) {
    headers.set('Authorization', `Bearer ${bearer}`);
  }

  return fetch(url, {
    ...options,
    method: options.method || 'GET',
    headers,
    credentials: 'include',
  });
}

export async function simpleApiRequest(url: string, options: RequestInit = {}) {
  let response = await doRequest(url, options, getAuthToken());

  // Transparently refresh the access token once on a 401 and retry. Cookie
  // auth on the BFF means the retry succeeds purely from the rotated cookie;
  // we also pass the new bearer for routes that still read it.
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doRequest(url, options, newToken);
    } else {
      // The refresh itself failed → the session is genuinely dead. Surface the
      // global "session expired" popup and force a clean re-login.
      await handleSessionExpired();
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    // 401/403 are expected when a token is expired — caller handles them.
    // Logging here triggers Next.js's dev-overlay error popup unnecessarily.
    if (response.status !== 401 && response.status !== 403) {
      console.warn(`API ${response.status} ${url}:`, errorText);
    }
    // A BFF that already exhausted its server-side refresh tags the body with
    // SESSION_EXPIRED — react even if the client-side refresh appeared to work.
    if (response.status === 401 && /SESSION_EXPIRED/.test(errorText)) {
      await handleSessionExpired();
    }
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
}

export async function simpleApiRequestJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await simpleApiRequest(url, options);
  return response.json();
}

export async function fetchWalletBalance(): Promise<number> {
  try {
    const data = await simpleApiRequestJson<any>('/api/wallet-balance', { method: 'GET' });
    if (data?.success && data?.data) {
      return data.data.balance || 0;
    }
    if (data?.error === 'PAYMENT_SERVICE_AUTH_REQUIRED') {
      throw new Error('PAYMENT_SERVICE_AUTH_REQUIRED: ' + data.message);
    }
    return 0;
  } catch (error: any) {
    if (
      error?.message?.includes('401') ||
      error?.message?.includes('Unauthorized') ||
      error?.message?.includes('PAYMENT_SERVICE_AUTH_REQUIRED')
    ) {
      throw error;
    }
    return 0;
  }
}

export async function fetchTransactionHistory(): Promise<any> {
  try {
    const data = await simpleApiRequestJson<any>('/api/transaction-history', { method: 'GET' });
    if (data?.success && data?.data) {
      return data.data;
    }
    return [];
  } catch (error: any) {
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      throw error;
    }
    return [];
  }
}
