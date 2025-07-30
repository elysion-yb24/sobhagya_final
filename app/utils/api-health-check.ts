import { getApiBaseUrl } from '../config/api';

export async function checkApiHealth() {
  const baseUrl = getApiBaseUrl();
  const endpoints = [
    '/payment/api/transaction/wallet-balance',
    '/payment/api/transaction/transactions?skip=0&limit=10',
    '/calling/api/call/call-log?skip=0&limit=10&role=user',
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`Testing endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      results.push({
        endpoint,
        status: response.status,
        ok: response.ok,
        url,
      });
      
      console.log(`Endpoint ${endpoint}: ${response.status} ${response.ok ? 'OK' : 'FAILED'}`);
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: `${baseUrl}${endpoint}`,
      });
      
      console.error(`Endpoint ${endpoint} failed:`, error);
    }
  }

  return results;
}

export function logApiConfiguration() {
  console.log('API Configuration:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('- getApiBaseUrl():', getApiBaseUrl());
} 