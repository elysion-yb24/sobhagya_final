import { getApiBaseUrl } from '../config/api';

interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

export function createApiRequestOptions(options: ApiRequestOptions): RequestInit {
  const { method = 'GET', headers = {}, body, token } = options;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // In production, don't send Authorization header to avoid CORS issues
  // The backend should handle authentication via cookies or other means
  if (process.env.NODE_ENV === 'development' && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
    requestOptions.credentials = 'include';
  } else if (process.env.NODE_ENV === 'production') {
    // For production, use credentials to send cookies
    requestOptions.credentials = 'include';
  }

  if (body) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return requestOptions;
}

export async function apiRequest(url: string, options: ApiRequestOptions = {}) {
  const requestOptions = createApiRequestOptions(options);
  
  console.log(`API Request to: ${url}`);
  console.log('Request options:', requestOptions);
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

export async function apiRequestJson<T = any>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await apiRequest(url, options);
  return response.json();
} 