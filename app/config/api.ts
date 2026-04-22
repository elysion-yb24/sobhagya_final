// config/api.ts

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://micro.sobhagya.in',
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
      CHANGE_STATUS: '/user/api/change-status',
      CHANGE_VIDEO_STATUS: '/user/api/change-status-video',
      DATA: '/user/api/data',
    },
    PAYMENT: {
      TRANSACTIONS: '/payment/api/transaction/transactions',
      STATS: '/payment/api/transaction/stats',
      WALLET_BALANCE: '/payment/api/transaction/wallet-balance',
    },
    BLOG: {
      GET_BLOGS: '/api/blog/admin/get-blogs',
      GET_BLOG: '/api/blog/admin/get-blog'
    }
  }
};

// Build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${getApiBaseUrl()}${endpoint}`;
}

/**
 * Gets the chat service backend URL. 
 * Per user instruction: production gateway base is /chat/api/
 * relative to micro.sobhagya.in.
 */
export function getChatBackendUrl(): string {
  const customChatUrl = process.env.BACKEND_BASE_URL;
  if (customChatUrl) return customChatUrl;

  // Production gateway mounts chat-service at /chat/api.
  const base = getApiBaseUrl();
  return `${base}/chat/api`;
}

/**
 * Gets the chat socket URL.
 */
export function getChatSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_CHAT_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_CHAT_SOCKET_URL;
  }

  const base = getApiBaseUrl();
  // If base is production gateway or local gateway, use it
  if (base.includes('sobhagya.in') || base.includes('localhost')) {
    return base;
  }
  
  return 'http://localhost:9001';
}

// Get API Base URL reliably
export function getApiBaseUrl(): string {
  // 1️⃣ Use explicit env variable if set
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;

  // 2️⃣ Fallbacks based on environment
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:9001'; // always use 9001 for dev
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://micro.sobhagya.in';
  }

  // Default fallback
  return 'https://micro.sobhagya.in';
}
