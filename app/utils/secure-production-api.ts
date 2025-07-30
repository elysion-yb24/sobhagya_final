import { getAuthToken } from './auth-utils';
import { getApiBaseUrl } from '../config/api';
import { logEnvironmentInfo, isProduction } from './environment-check';

// More secure approach for production - use cookies instead of query parameters
export async function secureProductionApiRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  // Store token in a secure cookie for this session
  if (token && typeof document !== 'undefined') {
    // Set a secure, httpOnly-like cookie (as much as possible on client side)
    document.cookie = `auth_token=${token}; path=/; secure; samesite=strict; max-age=3600`;
  }
  
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // This will send the cookie
    ...options,
  };

  console.log(`Secure Production API Request to: ${url}`);
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log(`Secure Production Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Secure Production API Error (${response.status}):`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Secure Production API Request failed:', error);
    throw error;
  }
}

export async function secureProductionApiRequestJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await secureProductionApiRequest(url, options);
  return response.json();
}

// Alternative: Use a custom header that might be allowed
export async function customHeaderApiRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  // Log environment info for debugging
  logEnvironmentInfo();
  
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token || '', // Custom header instead of Authorization
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  console.log(`Custom Header API Request to: ${url}`);
  console.log('Request headers:', requestOptions.headers);
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log(`Custom Header Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Custom Header API Error (${response.status}):`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Custom Header API Request failed:', error);
    throw error;
  }
}

export async function customHeaderApiRequestJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await customHeaderApiRequest(url, options);
  return response.json();
} 