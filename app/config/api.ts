// config/api.ts

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7002',
  BASE_URL_G: process.env.NEXT_PUBLIC_API_BASE_URL_G || 'https://micro.sobhagya.in',
  ENDPOINTS: {
    AUTH: {
      SEND_OTP: '/auth/api/signup-login/send-otp',
      VERIFY_OTP: '/auth/api/signup-login/verify-otp',
      REFRESH_TOKEN: '/auth/api/refresh-token'
    },
    USER: {
      USERS: '/user/api/users',
      ASTROLOGERS: '/user/api/astrologers',
      WALLET_BALANCE: '/payment/api/transaction/wallet-balance',
      SEARCH: '/user/api/search',
    },
    BLOG: {
      GET_BLOGS: '/api/blog/admin/get-blogs',
      GET_BLOG: '/api/blog/admin/get-blog'
    }
  }
};

// Build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Get API Base URL reliably
export function getApiBaseUrl(): string {
  // 1️⃣ Use explicit env variable if set
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;

  // 2️⃣ Fallbacks based on environment
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:7002'; // always use 9001 for dev
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://micro.sobhagya.in';
  }

  // Default fallback
  return 'http://localhost:7002';
}
