import { getAuthToken } from './auth-utils';
import { getApiBaseUrl } from '../config/api';
import { isProduction } from './environment-check';
import { debugCookies, setSecureCookie } from './cookie-debug';

// For production, we'll use a different approach since Authorization headers are blocked
export async function productionApiRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  // Debug cookies in production
  if (isProduction()) {
    console.log('🔍 Debugging cookies in production...');
    debugCookies();
  }
  
  // In production, use cookies instead of Authorization header
  if (isProduction()) {
    // Set token in cookie for server-side access
    if (token && typeof document !== 'undefined') {
      const cookieSet = setSecureCookie('auth_token', token, {
        maxAge: 3600,
        secure: true,
        sameSite: 'strict'
      });
      
      if (!cookieSet) {
        console.warn('⚠️ Failed to set auth_token cookie, trying alternative approach');
        // Fallback: try without secure flag
        setSecureCookie('auth_token', token, {
          maxAge: 3600,
          secure: false,
          sameSite: 'lax'
        });
      }
    }
    
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Send cookies
      ...options,
    };

    console.log(`Production API Request to: ${url}`);
    console.log('Request options:', {
      method: requestOptions.method,
      credentials: requestOptions.credentials,
      headers: requestOptions.headers
    });
    
    try {
      const response = await fetch(url, requestOptions);
      
      console.log(`Production Response status: ${response.status}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Production API Error (${response.status}):`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error('Production API Request failed:', error);
      throw error;
    }
  } else {
    // Development: Use Authorization header
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

    console.log(`Development API Request to: ${url}`);
    
    try {
      const response = await fetch(url, requestOptions);
      
      console.log(`Development Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Development API Error (${response.status}):`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error('Development API Request failed:', error);
      throw error;
    }
  }
}

export async function productionApiRequestJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await productionApiRequest(url, options);
  return response.json();
}

// Specialized function for wallet balance API
export async function fetchWalletBalance(): Promise<number> {
  const apiUrl = `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`;
  
  try {
    const response = await productionApiRequest(apiUrl, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.balance || 0;
    } else {
      console.warn('Wallet balance response not successful:', data);
      return 0;
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

// Specialized function for transaction API
export async function fetchTransactionHistory(): Promise<any> {
  const apiUrl = `${getApiBaseUrl()}/payment/api/transaction/wallet-page-data`;
  
  try {
    const response = await productionApiRequest(apiUrl, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      console.warn('Transaction history response not successful:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
} 