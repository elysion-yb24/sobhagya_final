interface FetchOptions extends RequestInit {
  token?: string;
}

export async function corsSafeFetch(url: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove credentials to avoid CORS issues
  const safeOptions: RequestInit = {
    ...fetchOptions,
    headers,
    // Don't include credentials for cross-origin requests
    // credentials: 'include' causes CORS issues
  };

  try {
    const response = await fetch(url, safeOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function corsSafeFetchJson<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await corsSafeFetch(url, options);
  return response.json();
} 