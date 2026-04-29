import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../config/api';
import { setAuthCookies, parseRefreshTokenFromSetCookie } from '../../../lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, notifyToken, session_id, name, gender, dob, placeOfBirth, timeOfBirth, languages, interests } = body;

    if (!phone) {
      return NextResponse.json(
        { name: 'ExpressValidatorErr', errors: { phone: 'Phone number is required' } },
        { status: 400 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { name: 'ExpressValidatorErr', errors: { otp: 'OTP is required' } },
        { status: 400 }
      );
    }

    if (typeof otp === 'object') {
      return NextResponse.json(
        { name: 'ExpressValidatorErr', errors: { otp: 'Invalid OTP format' } },
        { status: 400 }
      );
    }

    const requestBody: Record<string, any> = {
      phone,
      otp,
      notifyToken: notifyToken || 'placeholder_token',
    };
    if (session_id) requestBody.session_id = session_id;
    if (name) requestBody.name = name;
    if (gender) requestBody.gender = gender;
    if (dob) requestBody.dob = dob;
    if (placeOfBirth) requestBody.placeOfBirth = placeOfBirth;
    if (timeOfBirth) requestBody.timeOfBirth = timeOfBirth;
    if (languages) requestBody.languages = languages;
    if (interests) requestBody.interests = interests;

    const targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://sobhagya.in',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let parsed: any;
    try {
      parsed = responseText ? JSON.parse(responseText) : {};
    } catch {
      parsed = { success: false, message: responseText };
    }

    if (response.ok) {
      const headerAccess = response.headers.get('auth-token');
      const accessToken =
        (headerAccess && headerAccess !== 'null' ? headerAccess : null) ||
        parsed?.accessToken ||
        parsed?.data?.access_token ||
        parsed?.token ||
        null;

      const refreshToken =
        parseRefreshTokenFromSetCookie(response.headers) ||
        parsed?.refreshToken ||
        parsed?.data?.refresh_token ||
        null;

      if (accessToken || refreshToken) {
        await setAuthCookies({ accessToken, refreshToken });
      }

      if (accessToken && parsed && typeof parsed === 'object') {
        parsed.accessToken = accessToken;
        parsed.token = accessToken;
      }
    }

    return NextResponse.json(parsed, { status: response.status });
  } catch (error) {
    console.error('Proxy error in verify-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
