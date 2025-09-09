import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../../config/api';

export async function GET(request: NextRequest) {
  try {
    console.log('=== BLOG API DEBUG ===');
    
    // Get authorization from headers
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('Authorization header:', authHeader);
    console.log('Token from query:', token);
    
    // Build the target URL using config
    let targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.BLOG.GET_BLOGS);
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
    
    const data = await response.json();
    console.log('Blog API response status:', response.status);
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
    console.error('Blog API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to fetch blogs'
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
