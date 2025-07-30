import { getAuthToken } from './auth-utils';
import { getApiBaseUrl } from '../config/api';

// For production, we'll use a different approach since Authorization headers are blocked
export async function productionApiRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  // Create URL with token as query parameter for production
  const urlWithToken = token ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : url;
  
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Send cookies
    ...options,
  };

  console.log(`Production API Request to: ${urlWithToken}`);
  
  try {
    const response = await fetch(urlWithToken, requestOptions);
    
    console.log(`Production Response status: ${response.status}`);
    
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
}

export async function productionApiRequestJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await productionApiRequest(url, options);
  return response.json();
} 