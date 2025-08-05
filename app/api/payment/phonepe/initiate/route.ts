import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../config/api';

export async function POST(request: NextRequest) {
  try {
    // Get authorization from headers
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    console.log('=== PHONEPE INITIATE API DEBUG ===');
    console.log('Authorization header:', authHeader);
    console.log('Request body:', body);
    
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
    console.log('🔧 API Base URL being used:', apiBaseUrl);
    
    const targetUrl = `${apiBaseUrl}/payment/api/transaction/phonepe/initiate`;
    
    console.log('Making request to:', targetUrl);
    console.log('Request headers being sent:', headers);
    console.log('Request body being sent:', body);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    console.log('PhonePe Initiate API response status:', response.status);
    console.log('PhonePe Initiate API response data:', data);
    console.log('=== END PHONEPE INITIATE API DEBUG ===');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Proxy error in PhonePe initiate API:', error);
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