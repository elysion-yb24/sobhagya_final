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
  console.log('Token in cookies:', cookies.token || 'Not found');
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

// Test function to manually test cookie setting
export function testCookieSetting() {
  if (typeof document === 'undefined') {
    console.log('Cannot test cookies on server side');
    return;
  }

  console.log('🧪 Testing cookie setting...');
  
  // Test 1: Basic cookie
  try {
    document.cookie = 'test_basic=basic_value; path=/; max-age=60';
    console.log('✅ Basic cookie set');
  } catch (error) {
    console.error('❌ Basic cookie failed:', error);
  }
  
  // Test 2: Secure cookie
  try {
    document.cookie = 'test_secure=secure_value; path=/; max-age=60; secure; samesite=lax';
    console.log('✅ Secure cookie set');
  } catch (error) {
    console.error('❌ Secure cookie failed:', error);
  }
  
  // Test 3: Cross-domain cookie
  try {
    document.cookie = 'test_domain=domain_value; path=/; max-age=60; domain=.sobhagya.in; secure; samesite=lax';
    console.log('✅ Cross-domain cookie set');
  } catch (error) {
    console.error('❌ Cross-domain cookie failed:', error);
  }
  
  // Check all cookies after setting
  console.log('📋 All cookies after test:', document.cookie);
  
  // Parse and show specific test cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  console.log('🔍 Test cookies found:', {
    test_basic: cookies.test_basic || 'Not found',
    test_secure: cookies.test_secure || 'Not found',
    test_domain: cookies.test_domain || 'Not found'
  });
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
  domain?: string;
} = {}) {
  if (typeof document === 'undefined') {
    console.warn('Cannot set cookie on server side');
    return false;
  }

  try {
    const { maxAge = 3600, secure = true, sameSite = 'lax', domain } = options;
    
    let cookieString = `${name}=${value}; path=/; max-age=${maxAge}`;
    
    // Set domain for cross-subdomain cookies
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    if (secure) {
      cookieString += '; secure';
    }
    
    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }
    
    console.log(`🔧 Setting cookie: ${cookieString}`);
    document.cookie = cookieString;
    
    // Verify the cookie was set
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    if (cookies[name]) {
      console.log(`✅ Successfully set cookie: ${name}`);
      return true;
    } else {
      console.warn(`⚠️ Cookie ${name} not found after setting`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to set cookie ${name}:`, error);
    return false;
  }
} 