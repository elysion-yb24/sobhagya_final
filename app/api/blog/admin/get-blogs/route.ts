import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, getApiBaseUrl } from '../../../../config/api';

export async function GET(request: NextRequest) {
  try {
    console.log('=== BLOG API DEBUG ===');
    
    // Get authorization from headers
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('Authorization header:', authHeader);
    console.log('Token from query:', token);
    
    // Build the target URL using resilient helper and microservice prefix
    const apiBaseUrl = getApiBaseUrl();
    let targetUrl = `${apiBaseUrl}/user/api/blog/admin/get-blogs`;
    const queryParams = new URLSearchParams();
    
    // Add query parameters from request if any
    const skip = request.nextUrl.searchParams.get('skip') || '0';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    queryParams.set('skip', skip);
    queryParams.set('limit', limit);
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }
    
    console.log('Making request to:', targetUrl);
    
    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Added Authorization header to backend request');
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Added token from query params to backend request');
    }
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    console.log('Blog API response status:', response.status);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Blog API returned non-JSON response:', text.substring(0, 500));
      return NextResponse.json(
        { success: false, error: 'Backend returned non-JSON response', data: [] },
        {
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    console.log('Blog API response data:', data);

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Blog API error:', message, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: `Failed to fetch blogs: ${message}`,
        data: []
      },
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
