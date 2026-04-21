import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://micro.sobhagya.in';

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  return origin || '*';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward cookies from incoming request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_URL}/auth/api/signup-login/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend request failed' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to verify OTP' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract auth-token and cookies from backend response headers
    const authToken = response.headers.get('auth-token');
    const setCookieHeader = response.headers.get('set-cookie');
    
    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'auth-token',
    };
    
    // Forward the auth-token header if present
    if (authToken) {
      headers['auth-token'] = authToken;
    }
    
    // Forward set-cookie header if present
    if (setCookieHeader) {
      headers['set-cookie'] = setCookieHeader;
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers,
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

