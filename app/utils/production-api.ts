import { getAuthToken } from './auth-utils';
import { getApiBaseUrl } from '../config/api';
import { isProduction } from './environment-check';

// Simple API request function that works like the users API
export async function simpleApiRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  console.log(`🌐 API Request to: ${url}`);
  console.log('Request headers:', requestOptions.headers);
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

export async function simpleApiRequestJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await simpleApiRequest(url, options);
  return response.json();
}

// Simple wallet balance function
export async function fetchWalletBalance(): Promise<number> {
  const apiUrl = `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`;
  
  console.log('💰 Fetching wallet balance from:', apiUrl);
  
  try {
    const data = await simpleApiRequestJson(apiUrl, {
      method: 'GET',
    });
    
    console.log('📊 Wallet balance response:', data);
    
    if (data.success && data.data) {
      const balance = data.data.balance || 0;
      console.log('✅ Wallet balance:', balance);
      return balance;
    } else {
      console.warn('⚠️ Wallet balance response not successful:', data);
      return 0;
    }
  } catch (error: any) {
    console.error('❌ Error fetching wallet balance:', error);
    
    // Re-throw 401 errors for proper handling
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw error;
    }
    
    return 0;
  }
}

// Simple transaction history function
export async function fetchTransactionHistory(): Promise<any> {
  const apiUrl = `${getApiBaseUrl()}/payment/api/transaction/wallet-page-data`;
  
  console.log('📋 Fetching transaction history from:', apiUrl);
  
  try {
    const data = await simpleApiRequestJson(apiUrl, {
      method: 'GET',
    });
    
    console.log('📊 Transaction history response:', data);
    
    if (data.success && data.data) {
      return data.data;
    } else {
      console.warn('⚠️ Transaction history response not successful:', data);
      return [];
    }
  } catch (error: any) {
    console.error('❌ Error fetching transaction history:', error);
    
    // Re-throw 401 errors for proper handling
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw error;
    }
    
    return [];
  }
} 