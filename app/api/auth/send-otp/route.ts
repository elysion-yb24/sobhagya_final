import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../config/api';
import { isValidMobileNumber, getPhoneValidationError } from '../../../utils/phone-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Proxying send-otp request:', body);
    
    const { phone, notifyToken, name, gender, dob, placeOfBirth, timeOfBirth, languages, interests } = body;

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

    const requestBody: any = {
      phone,
      notifyToken: notifyToken || 'placeholder_token',
    };

    // Add user details if provided
    if (name) requestBody.name = name;
    if (gender) requestBody.gender = gender;
    if (dob) requestBody.dob = dob;
    if (placeOfBirth) requestBody.placeOfBirth = placeOfBirth;
    if (timeOfBirth) requestBody.timeOfBirth = timeOfBirth;
    if (languages) requestBody.languages = languages;
    if (interests) requestBody.interests = interests;

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