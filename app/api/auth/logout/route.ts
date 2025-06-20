import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_CONFIG } from '../../../config/api';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Processing logout request...');
    
    // Get authorization from headers
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      try {
        // Try to call backend logout API
        const targetUrl = 'http://localhost:8001/auth/api/logout';
        console.log('📡 Calling backend logout API:', targetUrl);
        
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          console.log('✅ Backend logout successful');
        } else {
          console.warn('⚠️ Backend logout failed, but continuing with cleanup');
        }
      } catch (backendError) {
        console.warn('⚠️ Backend logout API call failed:', backendError);
      }
    }
    
    // Create response with success message
    const responseData = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    };
    
    const response = NextResponse.json(responseData, { status: 200 });
    
    // Clear all authentication cookies on the server side
    const cookiesToClear = [
      'authToken',
      'token',
      'access_token',
      'refresh_token',
      'sessionId',
      'user',
      'auth-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    console.log('🎉 Logout process completed successfully');
    
    return response;
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
    
    // Even if there's an error, return success and clear cookies
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Logout completed with local cleanup',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
    
    // Clear cookies even on error
    const cookiesToClear = [
      'authToken',
      'token', 
      'access_token',
      'refresh_token',
      'sessionId',
      'user',
      'auth-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return response;
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