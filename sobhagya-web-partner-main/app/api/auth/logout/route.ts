import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://micro.sobhagya.in';

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  return origin || '*';
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') || 
                     request.headers.get('auth-token') || '';
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_URL}/auth/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend request failed' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Logout failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Forward cookies and auth-token from backend response
    const responseAuthToken = response.headers.get('auth-token');
    const setCookieHeader = response.headers.get('set-cookie');
    
    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'auth-token',
    };
    
    if (responseAuthToken) {
      headers['auth-token'] = responseAuthToken;
    }
    if (setCookieHeader) {
      headers['set-cookie'] = setCookieHeader;
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers,
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to logout' },
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

