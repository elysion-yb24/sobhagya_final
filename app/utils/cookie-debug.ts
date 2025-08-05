// Debug utility for cookie issues in production
export function debugCookies() {
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
  console.log('Auth token in cookies:', cookies.auth_token || 'Not found');
  console.log('Access token in cookies:', cookies.access_token || 'Not found');
  console.log('AuthToken in cookies:', cookies.AuthToken || 'Not found');
  
  // Check localStorage
  console.log('=== LocalStorage Debug ===');
  console.log('authToken in localStorage:', localStorage.getItem('authToken'));
  console.log('token in localStorage:', localStorage.getItem('token'));
  console.log('access_token in localStorage:', localStorage.getItem('access_token'));
  
  // Check if we can set cookies
  try {
    document.cookie = 'debug_test=test_value; path=/; max-age=60';
    console.log('✅ Successfully set test cookie');
  } catch (error) {
    console.error('❌ Failed to set test cookie:', error);
  }
  
  console.log('=== End Cookie Debug ===');
}

export function checkCookieSupport() {
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

export function setSecureCookie(name: string, value: string, options: {
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
} = {}) {
  if (typeof document === 'undefined') {
    console.warn('Cannot set cookie on server side');
    return false;
  }

  try {
    const { maxAge = 3600, secure = true, sameSite = 'strict' } = options;
    
    let cookieString = `${name}=${value}; path=/; max-age=${maxAge}`;
    
    if (secure) {
      cookieString += '; secure';
    }
    
    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }
    
    document.cookie = cookieString;
    console.log(`✅ Set secure cookie: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to set cookie ${name}:`, error);
    return false;
  }
} 