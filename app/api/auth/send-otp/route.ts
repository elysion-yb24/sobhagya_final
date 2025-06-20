import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Proxying send-otp request:', body);
    
    const { phone, notifyToken } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json({ 
        name: "ExpressValidatorErr", 
        errors: { phone: "Phone number is required" } 
      }, { status: 400 });
    }

    const requestBody = {
      phone,
      notifyToken: notifyToken || 'placeholder_token',
    };

    // Use configured API URL
    const targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP);
    console.log('Making request to:', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    console.log('Send-OTP response status:', response.status);
    console.log('Send-OTP response data:', data);
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
    
  } catch (error) {
    console.error('Proxy error in send-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to send OTP' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 