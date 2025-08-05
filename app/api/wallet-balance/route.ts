import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../config/api';

export async function GET(request: NextRequest) {
  try {
    // Get authorization from headers or query params
    const authHeader = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('=== WALLET BALANCE API DEBUG ===');
    console.log('Authorization header:', authHeader);
    console.log('Token from query:', token);
    console.log('All request headers:', Object.fromEntries(request.headers.entries()));
    
    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Build the target URL
    const apiBaseUrl = getApiBaseUrl();
    console.log('🔧 API Base URL being used:', apiBaseUrl);
    
    let targetUrl = `${apiBaseUrl}/payment/api/transaction/wallet-balance`;
    const queryParams = new URLSearchParams();
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Added Authorization header to backend request');
      
      // Also try adding token as query parameter
      const tokenMatch = authHeader.match(/Bearer (.+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        queryParams.set('token', token);
        console.log('Added token as query parameter as well');
      }
    } else {
      console.log('WARNING: No Authorization header found in request');
    }
    
    // Also try adding cookies if available
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('Added Cookie header to backend request');
    }
    
    // Add token if present
    if (token) {
      queryParams.set('token', token);
    }
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }
    
    console.log('Making request to:', targetUrl);
    console.log('Request headers being sent:', headers);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });
    
    const data = await response.json();
    console.log('Wallet Balance API response status:', response.status);
    console.log('Wallet Balance API response data:', data);
    
    // If we get a 401, try to provide more detailed error information
    if (response.status === 401) {
      console.log('❌ 401 Authentication failed for payment service');
      console.log('🔍 This might be due to:');
      console.log('   - Payment service requiring different authentication');
      console.log('   - Token format not accepted by payment service');
      console.log('   - Payment service not configured to accept user service tokens');
      
      // Return the actual backend error response
      return NextResponse.json(data, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log('=== END WALLET BALANCE API DEBUG ===');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Proxy error in wallet balance API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch wallet balance' },
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