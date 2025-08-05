import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../config/api';

export async function GET(request: NextRequest) {
  try {
    // Get authorization from headers or query params
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('=== CALL LOG API DEBUG ===');
    console.log('Authorization header:', authHeader);
    console.log('Token from query:', token);
    
    // If no authentication is provided, return empty response instead of error
    if (!authHeader && !token) {
      console.log('No authentication provided, returning empty response');
      return NextResponse.json({
        success: true,
        data: {
          list: [],
          total: 0,
          skip: 0,
          limit: 10
        }
      }, { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log('All request headers:', Object.fromEntries(request.headers.entries()));
    
    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Build the target URL
    const apiBaseUrl = getApiBaseUrl();
    console.log('🔧 API Base URL being used:', apiBaseUrl);
    
    let targetUrl = `${apiBaseUrl}/calling/api/call/call-log`;
    const queryParams = new URLSearchParams();
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Added Authorization header to backend request');
      
      // Also try adding token as query parameter
      const tokenMatch = authHeader.match(/Bearer (.+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        queryParams.set('token', token);
        console.log('Added token as query parameter as well');
      }
    } else {
      console.log('WARNING: No Authorization header found in request');
    }
    
    // Also try adding cookies if available
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('Added Cookie header to backend request');
    }
    
    // Add query parameters from request
    const skip = request.nextUrl.searchParams.get('skip') || '0';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const role = request.nextUrl.searchParams.get('role') || 'user';
    queryParams.set('skip', skip);
    queryParams.set('limit', limit);
    queryParams.set('role', role);
    
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
    console.log('Call Log API response status:', response.status);
    console.log('Call Log API response data:', data);
    
    // If we get a 401, return the actual backend error response
    if (response.status === 401) {
      console.log('❌ 401 Authentication failed for calling service');
      
      // Return the actual backend error response
      return NextResponse.json(data, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log('=== END CALL LOG API DEBUG ===');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Proxy error in call log API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch call logs' },
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