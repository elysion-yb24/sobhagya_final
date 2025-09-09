// API Configuration
export const API_CONFIG = {
  // Use environment variable for API URL
  // Development: NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
  // Production: NEXT_PUBLIC_API_BASE_URL=https://micro.sobhagya.in
  // For Guftagu API: NEXT_PUBLIC_API_URL=https://api.guftagu.app
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001',
  BASE_URL_G: process.env.NEXT_PUBLIC_API_BASE_URL_G || 'https://micro.sobhagya.in',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      SEND_OTP: '/auth/api/signup-login/send-otp',
      VERIFY_OTP: '/auth/api/signup-login/verify-otp',
      REFRESH_TOKEN: '/auth/api/refresh-token'
    },
    USER: {
      USERS: 'user/api/users',
      ASTROLOGERS: 'user/api/astrologers',
      WALLET_BALANCE: 'payment/api/transaction/wallet-balance',
      SEARCH: 'user/api/search',
    },
    BLOG: {
      GET_BLOGS: '/api/blog/admin/get-blogs',
      GET_BLOG: '/api/blog/admin/get-blog'
    }
  }
};

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}


export function getApiBaseUrl(): string {
  // If environment variable is explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // If running on localhost, use local backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8001';
    }
    // If running on production domain, use production backend
    if (window.location.hostname.includes('sobhagya.in')) {
      return 'https://micro.sobhagya.in';
    }
  }
  
  // Fallback based on NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'https://micro.sobhagya.in';
  }
  
  // Default to localhost for development
  return 'http://localhost:8001';
} 