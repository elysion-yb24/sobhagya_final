import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../config/api';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Get user ID from the request body
    const userId = body.userId || body.id || body._id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Remove userId from body before sending to backend (it's in the URL)
    const { userId: _, id: __, _id: ___, ...profileUpdateData } = body;

    const baseUrl = getApiBaseUrl();
    const targetUrl = `${baseUrl}/user/api/users/${userId}`;

    // Forward the request to backend
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(profileUpdateData),
    });

    let responseText: string;
    let responseData: any;

    try {
      responseText = await response.text();

      // Try to parse as JSON
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
    } catch (error) {
      responseText = '';
      responseData = { error: 'Failed to read response' };
    }

    // Create NextResponse with status
    const proxyResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward ALL response headers from backend to client
    response.headers.forEach((value, key) => {
      proxyResponse.headers.set(key, value);
    });

    // Set CORS headers
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    proxyResponse.headers.set('Access-Control-Allow-Methods', 'PUT, PATCH, OPTIONS');
    proxyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return proxyResponse;

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update profile' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PUT, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Same as PUT
  return PUT(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

