import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../../config/api';

export async function GET(request: NextRequest) {
  try {
    // Get authorization from headers
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');

    // Build the target URL using config - use backend endpoint
    let targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.BLOG.GET_BLOGS_BACKEND);
    const queryParams = new URLSearchParams();

    // Add query parameters from request if any
    const skip = request.nextUrl.searchParams.get('skip') || '0';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    queryParams.set('skip', skip);
    queryParams.set('limit', limit);

    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }

    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Backend returned an error
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blogs from backend',
        message: errorMessage
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
