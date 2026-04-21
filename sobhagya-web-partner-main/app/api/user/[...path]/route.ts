import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://micro.sobhagya.in';

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  return origin || '*';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/user/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') || 
                     request.headers.get('auth-token') || '';
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend request failed' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Forward auth-token and cookies from backend response
    const responseAuthToken = response.headers.get('auth-token');
    const setCookieHeader = response.headers.get('set-cookie');
    
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'auth-token',
    };
    
    if (responseAuthToken) {
      responseHeaders['auth-token'] = responseAuthToken;
    }
    if (setCookieHeader) {
      responseHeaders['set-cookie'] = setCookieHeader;
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('User API GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Request failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const body = await request.json();
    
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') || 
                     request.headers.get('auth-token') || '';
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_URL}/user/api/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend request failed' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Forward auth-token and cookies from backend response
    const responseAuthToken = response.headers.get('auth-token');
    const setCookieHeader = response.headers.get('set-cookie');
    
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'auth-token',
    };
    
    if (responseAuthToken) {
      responseHeaders['auth-token'] = responseAuthToken;
    }
    if (setCookieHeader) {
      responseHeaders['set-cookie'] = setCookieHeader;
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('User API POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Request failed' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
