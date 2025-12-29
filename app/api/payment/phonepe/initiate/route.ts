import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../config/api';

export async function POST(request: NextRequest) {
  try {
    // Get authorization from headers
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Authorization header required'
      }, { status: 401 });
    }

    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    };

    // Build the target URL
    const apiBaseUrl = getApiBaseUrl();

    const targetUrl = `${apiBaseUrl}/payment/api/transaction/phonepe/initiate`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to initiate PhonePe payment' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 