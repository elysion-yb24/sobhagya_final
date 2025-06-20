import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../config/api';

export async function GET(request: NextRequest) {
  try {
    // Get authorization from headers or query params
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('=== USERS API DEBUG ===');
    console.log('Authorization header:', authHeader);
    console.log('Token from query:', token);
    console.log('All request headers:', Object.fromEntries(request.headers.entries()));
    
    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Added Authorization header to backend request');
    } else {
      console.log('WARNING: No Authorization header found in request');
    }
    
    // Build the target URL using config
    let targetUrl = 'http://localhost:8001/user/api/users?skip=0&limit=10';
    const queryParams = new URLSearchParams();
    
    // Add skip and limit from original request
    const skip = request.nextUrl.searchParams.get('skip') || '0';
    const limit = request.nextUrl.searchParams.get('limit') || '50';
    queryParams.set('skip', skip);
    queryParams.set('limit', limit);
    
    // Add token if present
    if (token) {
      queryParams.set('token', token);
    }
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }
    
    console.log('Making request to:', targetUrl);
    console.log('Request headers being sent:', headers);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });
    
    const data = await response.json();
    console.log('Users API response status:', response.status);
    console.log('Users API response:', data);
    console.log('=== END USERS API DEBUG ===');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Proxy error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch users' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 