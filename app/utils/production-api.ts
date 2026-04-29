import { getAuthToken } from './auth-utils';

export async function simpleApiRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    method: options.method || 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
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
