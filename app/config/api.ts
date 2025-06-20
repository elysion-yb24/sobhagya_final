// API Configuration
export const API_CONFIG = {
  // Use environment variable for API URL
  // Development: NEXT_PUBLIC_API_URL=http://localhost:8001
  // Production: NEXT_PUBLIC_API_URL=https://micro.sobhagya.in
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  
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
      WALLET_BALANCE: 'user/api/wallet/balance'
    }
  }
};

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper function to get API base URL
export function getApiBaseUrl(): string {
  return API_CONFIG.BASE_URL;
} 