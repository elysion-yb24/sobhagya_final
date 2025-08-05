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
  
  // In production, use both Authorization header and cookies (like the working users API)
  if (isProduction()) {
    // Set token in cookie for server-side access (using the same name as working APIs)
    if (token && typeof document !== 'undefined') {
      const cookieSet = setSecureCookie('token', token, {
        maxAge: 3600,
        secure: true,
        sameSite: 'lax'
      });
      
      if (!cookieSet) {
        console.warn('⚠️ Failed to set token cookie, trying alternative approach');
        // Fallback: try without secure flag
        setSecureCookie('token', token, {
          maxAge: 3600,
          secure: false,
          sameSite: 'lax'
        });
      }
    }
    
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Include Authorization header like working APIs
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Send cookies
      ...options,
    };

    console.log(`Production API Request to: ${url}`);
    console.log('Token being used:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Request options:', {
      method: requestOptions.method,
      credentials: requestOptions.credentials,
      headers: requestOptions.headers
    });
    console.log('All cookies:', document.cookie);
    
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
  
  console.log('🔍 fetchWalletBalance called with URL:', apiUrl);
  console.log('🔍 Environment check - isProduction():', isProduction());
  
  try {
    const response = await productionApiRequest(apiUrl, {
      method: 'GET',
    });
    
    console.log('✅ Wallet balance API response received:', response.status);
    
    const data = await response.json();
    console.log('📊 Wallet balance data:', data);
    
    if (data.success && data.data) {
      const balance = data.data.balance || 0;
      console.log('💰 Wallet balance extracted:', balance);
      return balance;
    } else {
      console.warn('⚠️ Wallet balance response not successful:', data);
      return 0;
    }
  } catch (error: any) {
    console.error('❌ Error fetching wallet balance:', error);
    
    // If production API fails, try fallback approach
    if (isProduction()) {
      console.log('🔄 Trying fallback approach for wallet balance...');
      try {
        const token = getAuthToken();
        if (!token) {
          console.log('❌ No token available for fallback');
          throw error;
        }
        
        // Try direct fetch with Authorization header only
        const fallbackResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        console.log('🔄 Fallback response status:', fallbackResponse.status);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('📊 Fallback wallet balance data:', fallbackData);
          
          if (fallbackData.success && fallbackData.data) {
            const balance = fallbackData.data.balance || 0;
            console.log('💰 Fallback wallet balance extracted:', balance);
            return balance;
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback approach also failed:', fallbackError);
      }
    }
    
    // Re-throw 401 errors so they can be handled by the calling component
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.error('🔐 Authentication error in fetchWalletBalance, re-throwing for proper handling');
      throw error;
    }
    
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