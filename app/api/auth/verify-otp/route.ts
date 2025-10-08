import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../config/api';
import { isValidMobileNumber, getPhoneValidationError } from '../../../utils/phone-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxying verify-otp request body:', body);

    const { phone, otp, notifyToken, session_id } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json({ 
        name: "ExpressValidatorErr", 
        errors: { phone: "Phone number is required" } 
      }, { status: 400 });
    }

    // Validate phone number format
    const phoneValidationError = getPhoneValidationError(phone);
    if (phoneValidationError) {
      return NextResponse.json({ 
        name: "ExpressValidatorErr", 
        errors: { phone: phoneValidationError } 
      }, { status: 400 });
    }

    if (!otp) {
      return NextResponse.json({ 
        name: "ExpressValidatorErr", 
        errors: { otp: "OTP is required" } 
      }, { status: 400 });
    }

    // Check if OTP is an object (which would be wrong)
    if (typeof otp === 'object') {
      console.error('❌ OTP received as object, not string:', otp);
      return NextResponse.json({ 
        name: "ExpressValidatorErr", 
        errors: { otp: "Invalid OTP format" } 
      }, { status: 400 });
    }

    const requestBody: any = {
      phone,
      otp,
      notifyToken: notifyToken || 'placeholder_token',
    };

    // Add session_id if provided
    if (session_id) {
      requestBody.session_id = session_id;
    }

    // Prepare request headers
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    headers.delete('host');
    headers.delete('content-length');

    // Use configured API URL
    const targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP);
    console.log('Making request to:', targetUrl);

    // Forward the request to backend
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      credentials: 'include', // if backend uses cookies
    });

    const responseBody = await response.text(); // read as text to avoid stream locking
    console.log('Verify-OTP response status:', response.status);
    console.log('Verify-OTP response body:', responseBody);

    // Create NextResponse with status
    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward ALL response headers from backend to client
    response.headers.forEach((value, key) => {
      proxyResponse.headers.set(key, value);
    });

    // Set CORS headers manually if needed (optional)
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    proxyResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    proxyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return proxyResponse;

  } catch (error) {
    console.error('Proxy error in verify-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to verify OTP' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
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
