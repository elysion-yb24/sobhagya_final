import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../config/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiBaseUrl = getApiBaseUrl();
    
    console.log('=== AUTH TEST DEBUG ===');
    console.log('API Base URL:', apiBaseUrl);
    console.log('Authorization header:', authHeader);
    
    // Test user API (which works)
    console.log('Testing user API...');
    const userResponse = await fetch(`${apiBaseUrl}/user/api/users?skip=0&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('User API status:', userResponse.status);
    const userData = await userResponse.json();
    console.log('User API response:', userData);
    
    // Test wallet balance API (which fails)
    console.log('Testing wallet balance API...');
    const walletResponse = await fetch(`${apiBaseUrl}/payment/api/transaction/wallet-balance`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Wallet API status:', walletResponse.status);
    const walletData = await walletResponse.json();
    console.log('Wallet API response:', walletData);
    
    console.log('=== END AUTH TEST DEBUG ===');
    
    return NextResponse.json({
      success: true,
      data: {
        apiBaseUrl,
        userApi: {
          status: userResponse.status,
          data: userData
        },
        walletApi: {
          status: walletResponse.status,
          data: walletData
        }
      }
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 