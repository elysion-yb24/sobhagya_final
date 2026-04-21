import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the origin from the request for CORS
 * Cannot use '*' with credentials: true, so we need to return the actual origin
 */
export function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  // Allow specific origins or return the request origin
  if (origin) {
    return origin;
  }
  // Fallback - in production this should be your Vercel domain
  return '*';
}

/**
 * Get all set-cookie headers from a Response
 * Headers can have multiple set-cookie values
 */
export function getAllSetCookieHeaders(response: Response): string[] {
  const setCookieHeaders: string[] = [];
  const setCookieHeader = response.headers.get('set-cookie');
  
  if (setCookieHeader) {
    // If there are multiple set-cookie headers, they might be comma-separated
    // or in an array. Let's handle both cases.
    setCookieHeaders.push(setCookieHeader);
  }
  
  // Check for multiple set-cookie headers (some servers send them separately)
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie' && !setCookieHeaders.includes(value)) {
      setCookieHeaders.push(value);
    }
  });
  
  return setCookieHeaders;
}

/**
 * Create CORS headers for responses
 */
export function createCorsHeaders(request: NextRequest, includeCredentials: boolean = true): HeadersInit {
  const origin = getCorsOrigin(request);
  
  const headers: HeadersInit = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
    'Access-Control-Expose-Headers': 'auth-token',
  };
  
  if (includeCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

/**
 * Forward all response headers from backend to client
 */
export function forwardResponseHeaders(
  backendResponse: Response,
  corsHeaders: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = { ...corsHeaders };
  
  // Forward auth-token header
  const authToken = backendResponse.headers.get('auth-token');
  if (authToken) {
    headers['auth-token'] = authToken;
  }
  
  // Forward all set-cookie headers
  const setCookieHeaders = getAllSetCookieHeaders(backendResponse);
  if (setCookieHeaders.length > 0) {
    // Next.js handles set-cookie differently - we need to set each one
    headers['set-cookie'] = setCookieHeaders.join(', ');
  }
  
  return headers;
}

/**
 * Validate backend URL is configured
 */
export function getBackendUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
  }
  return backendUrl;
}

