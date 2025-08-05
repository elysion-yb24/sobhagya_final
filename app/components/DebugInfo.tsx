'use client';

import { useState, useEffect } from 'react';
import { fetchWalletBalance } from '../utils/production-api';
import { isProduction } from '../utils/environment-check';

// Simple cookie support check function
function checkCookieSupport() {
  if (typeof document === 'undefined') {
    return { supported: false, reason: 'Server side' };
  }

  try {
    // Test if we can set and read cookies
    const testKey = 'cookie_test_' + Date.now();
    const testValue = 'test_value_' + Date.now();
    
    document.cookie = `${testKey}=${testValue}; path=/; max-age=60`;
    
    // Check if cookie was set
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const wasSet = cookies[testKey] === testValue;
    
    // Clean up test cookie
    document.cookie = `${testKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    return {
      supported: wasSet,
      reason: wasSet ? 'Cookies working normally' : 'Cookie not found after setting',
      domain: window.location.hostname,
      protocol: window.location.protocol,
      secure: window.location.protocol === 'https:'
    };
  } catch (error) {
    return {
      supported: false,
      reason: `Error testing cookies: ${error}`,
      domain: window.location.hostname,
      protocol: window.location.protocol
    };
  }
}

// Simple cookie debug function
function debugCookies() {
  if (typeof document === 'undefined') {
    console.log('Running on server side, no cookies available');
    return;
  }

  console.log('=== Cookie Debug Information ===');
  console.log('Current domain:', window.location.hostname);
  console.log('Current protocol:', window.location.protocol);
  console.log('All cookies:', document.cookie);
  
  // Check for specific auth cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  console.log('Parsed cookies:', cookies);
  console.log('Token in cookies:', cookies.token || 'Not found');
  console.log('Auth token in cookies:', cookies.auth_token || 'Not found');
  
  // Check localStorage
  console.log('=== LocalStorage Debug ===');
  console.log('authToken in localStorage:', localStorage.getItem('authToken'));
  console.log('token in localStorage:', localStorage.getItem('token'));
  
  console.log('=== End Cookie Debug ===');
}

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = () => {
    console.log('🔍 Running debug...');
    debugCookies();
    
    const cookieSupport = checkCookieSupport();
    console.log('🍪 Cookie support check:', cookieSupport);
    
    setDebugInfo({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isProduction: isProduction(),
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      cookieSupport,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'Server side',
      currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'Server side',
    });
  };

  const testWalletBalance = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing wallet balance API...');
      const balance = await fetchWalletBalance();
      setWalletBalance(balance);
      console.log('✅ Wallet balance test completed:', balance);
    } catch (error) {
      console.error('❌ Wallet balance test failed:', error);
      setWalletBalance(-1); // Error indicator
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run debug on mount
    runDebug();
  }, []);

  if (!debugInfo) {
    return <div className="p-4 bg-gray-100 rounded">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <h3 className="text-lg font-bold">🔍 Debug Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold mb-2">Environment</h4>
          <div className="text-sm space-y-1">
            <div><strong>NODE_ENV:</strong> {debugInfo.environment}</div>
            <div><strong>Is Production:</strong> {debugInfo.isProduction ? '✅ Yes' : '❌ No'}</div>
            <div><strong>API Base URL:</strong> {debugInfo.apiBaseUrl}</div>
            <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
            <div><strong>Domain:</strong> {debugInfo.currentDomain}</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold mb-2">Cookie Support</h4>
          <div className="text-sm space-y-1">
            <div><strong>Supported:</strong> {debugInfo.cookieSupport.supported ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Reason:</strong> {debugInfo.cookieSupport.reason}</div>
            <div><strong>Protocol:</strong> {debugInfo.cookieSupport.protocol}</div>
            <div><strong>Secure:</strong> {debugInfo.cookieSupport.secure ? '✅ Yes' : '❌ No'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold mb-2">API Tests</h4>
        <div className="space-y-2">
          <button
            onClick={testWalletBalance}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Wallet Balance API'}
          </button>
          
          {walletBalance !== null && (
            <div className="text-sm">
              <strong>Wallet Balance Result:</strong> {
                walletBalance === -1 
                  ? '❌ Error occurred' 
                  : `💰 ${walletBalance}`
              }
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold mb-2">Actions</h4>
        <button
          onClick={runDebug}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh Debug Info
        </button>
      </div>

      <div className="text-xs text-gray-600">
        <strong>Timestamp:</strong> {debugInfo.timestamp}
      </div>
    </div>
  );
} 