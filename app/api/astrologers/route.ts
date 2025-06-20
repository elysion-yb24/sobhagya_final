import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../config/api';

export async function GET(request: NextRequest) {
  try {
    // Get authorization from headers or query params
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('=== ASTROLOGERS API DEBUG ===');
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
    let targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.USER.ASTROLOGERS);
    const queryParams = new URLSearchParams();
    
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
    console.log('Astrologers API response status:', response.status);
    console.log('Astrologers API response data:', data);
    console.log('=== END ASTROLOGERS API DEBUG ===');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Proxy error in astrologers API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch astrologers' },
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