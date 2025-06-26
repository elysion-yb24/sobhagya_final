import { getAuthToken } from './auth-utils';
import { getApiBaseUrl } from '../config/api';

export async function debugApiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  
  console.log('🔍 Debug API Call:', {
    endpoint,
    fullUrl,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
    headers: options.headers,
  });
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
    
    console.log('📡 Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
    }
    
    return response;
  } catch (error) {
    console.error('🚨 Network Error:', error);
    throw error;
  }
}

export async function testAuthentication() {
  console.log('🔐 Testing Authentication...');
  const token = getAuthToken();
  
  if (!token) {
    console.error('❌ No authentication token found!');
    return false;
  }
  
  console.log('✅ Token found:', token.substring(0, 20) + '...');
  
  // Test a simple authenticated endpoint
  try {
    const response = await debugApiCall('/user/api/users?skip=0&limit=1');
    return response.ok;
  } catch (error) {
    return false;
  }
} 