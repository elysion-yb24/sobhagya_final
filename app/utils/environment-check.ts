export function logEnvironmentInfo() {
  console.log('=== Environment Check ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('Is Production:', process.env.NODE_ENV === 'production');
  console.log('Is Development:', process.env.NODE_ENV === 'development');
  console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server side');
  console.log('Current Origin:', typeof window !== 'undefined' ? window.location.origin : 'Server side');
  console.log('========================');
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
} 