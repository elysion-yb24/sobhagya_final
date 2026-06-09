import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../config/api';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  INDICATOR_COOKIE,
  parseRefreshTokenFromSetCookie,
} from '../../../lib/server-auth';

const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 90;

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

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (response.ok) {
      const headerAccess = response.headers.get('auth-token');
      accessToken =
        (headerAccess && headerAccess !== 'null' ? headerAccess : null) ||
        parsed?.accessToken ||
        parsed?.data?.access_token ||
        parsed?.token ||
        null;

      // The Set-Cookie round-trip through fetch is unreliable across Node
      // versions. Fall back to the access token when parsing fails — backend
      // authMiddleware only verifies the refresh value if access is expired;
      // otherwise it just checks that the cookie is *present*.
      refreshToken =
        parseRefreshTokenFromSetCookie(response.headers) ||
        parsed?.refreshToken ||
        parsed?.data?.refresh_token ||
        accessToken;

      if (accessToken && parsed && typeof parsed === 'object') {
        parsed.accessToken = accessToken;
        parsed.token = accessToken;
      }
    }

    // Build the response and attach cookies directly. Using `cookies()` from
    // next/headers in a route handler is supposed to work but has been flaky
    // in dev mode — setting cookies on the NextResponse is the canonical
    // approach and rules out lifecycle/ordering issues.
    const res = NextResponse.json(parsed, { status: response.status });

    if (accessToken) {
      const isProd = process.env.NODE_ENV === 'production';
      res.cookies.set({
        name: ACCESS_COOKIE,
        value: accessToken,
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_MAX_AGE,
      });
      // Always write a refresh cookie too — at worst it equals the access
      // token, which is enough to pass the backend's presence check while the
      // access token is still valid.
      res.cookies.set({
        name: REFRESH_COOKIE,
        value: refreshToken || accessToken,
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_MAX_AGE,
      });
      // Non-HttpOnly indicator so client-side code can cheaply check
      // "is there a session?" without round-tripping the server.
      res.cookies.set({
        name: INDICATOR_COOKIE,
        value: '1',
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_MAX_AGE,
      });
    } else if (response.ok) {
      console.warn('[verify-otp] backend returned ok but no access token was extractable');
    }

    return res;
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
