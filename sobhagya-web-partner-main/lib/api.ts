import axios from 'axios';

// Base URLs - Update these to match your backend setup
// Option 1: If using nginx reverse proxy (recommended for production)
const NGINX_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
// Option 2: Direct service URLs (for development without nginx)
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api';
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4001/api';
const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:6001/api';

// Check if using nginx or direct services
const USE_NGINX = process.env.NEXT_PUBLIC_USE_NGINX !== 'false';

// Helper to create axios instance
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true, // Important for cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');
        if (token && token !== 'null') {
          // Backend authMiddleware expects Authorization Bearer token (see user-service/authMiddleware.js)
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token updates
  instance.interceptors.response.use(
    (response) => {
      // Backend sets token in 'auth-token' header (see authController.js)
      // Axios normalizes header names to lowercase
      const token = response.headers['auth-token'];
      
      if (token && typeof window !== 'undefined' && token !== 'null' && token !== 'undefined') {
        localStorage.setItem('auth-token', token);
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          // Clear cookies by setting empty cookie
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create API instances based on routing
let authApi, userApi, paymentApi;

if (USE_NGINX) {
  // Using nginx reverse proxy
  authApi = createApiInstance(`${NGINX_BASE_URL}/auth/api`);
  userApi = createApiInstance(`${NGINX_BASE_URL}/user/api`);
  paymentApi = createApiInstance(`${NGINX_BASE_URL}/payment/api`);
} else {
  // Direct service URLs
  authApi = createApiInstance(AUTH_SERVICE_URL);
  userApi = createApiInstance(USER_SERVICE_URL);
  paymentApi = createApiInstance(PAYMENT_SERVICE_URL);
}

// Check if we should use proxy routes (ONLY for production/Vercel to avoid CORS)
// NEVER use proxy on localhost - always use direct backend connection locally
const USE_PROXY = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname.includes('vercel.com') ||
   process.env.NEXT_PUBLIC_USE_PROXY === 'true');

// Create a simple fetch-based API instance for proxy routes
const createProxyInstance = () => {
  return {
    get: async (url: string, options?: { params?: any }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      let fullUrl = url;
      if (options?.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        fullUrl += `?${searchParams.toString()}`;
      }
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for same-origin requests
        headers: {
          'Content-Type': 'application/json',
          ...(token && token !== 'null' && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Extract auth-token from response headers
      const authToken = response.headers.get('auth-token');
      if (authToken && typeof window !== 'undefined') {
        localStorage.setItem('auth-token', authToken);
      }
      
      return { data: responseData, headers: response.headers };
    },
    post: async (url: string, data: any) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Include cookies for same-origin requests
        headers: {
          'Content-Type': 'application/json',
          ...(token && token !== 'null' && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Extract auth-token from response headers
      const authToken = response.headers.get('auth-token');
      if (authToken && typeof window !== 'undefined') {
        localStorage.setItem('auth-token', authToken);
      }
      
      return { data: responseData, headers: response.headers };
    },
  };
};

const proxyApi = createProxyInstance();

// Auth APIs
export const authAPI = {
  sendOtp: async (phone: string) => {
    if (USE_PROXY) {
      const response = await proxyApi.post('/api/auth/send-otp', { phone });
      return response.data;
    }
    const response = await authApi.post('/signup-login/send-otp', { phone });
    return response.data;
  },
  verifyOtp: async (phone: string, otp: string, notifyToken: string = 'web-portal') => {
    // Backend validation requirements:
    // - phone: string, 9-11 characters
    // - otp: string, 3-5 characters  
    // - notifyToken: required, non-empty string
    if (USE_PROXY) {
      const response = await proxyApi.post('/api/auth/verify-otp', { 
        phone: phone.trim(), 
        otp: otp.trim(), 
        notifyToken: notifyToken || 'web-portal'
      });
      
      // Extract auth-token from response headers
      const authToken = response.headers.get('auth-token');
      if (authToken && typeof window !== 'undefined') {
        localStorage.setItem('auth-token', authToken);
      }
      
      return response.data;
    }
    
    const response = await authApi.post('/signup-login/verify-otp', { 
      phone: phone.trim(), 
      otp: otp.trim(), 
      notifyToken: notifyToken || 'web-portal'
    });
    
    // Backend sets token in 'auth-token' header (see authController.js line 197)
    // Axios normalizes header names to lowercase
    if (typeof window !== 'undefined') {
      const token = response.headers['auth-token'] || 
                    (response.headers as any)['auth-token'];
      
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        localStorage.setItem('auth-token', token);
      }
    }
    
    return response.data;
  },
  logout: async () => {
    if (USE_PROXY) {
      const response = await proxyApi.post('/api/auth/logout', {});
      return response.data;
    }
    const response = await authApi.post('/logout');
    return response.data;
  },
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    if (USE_PROXY) {
      const response = await proxyApi.get('/api/user/profile-v2');
      return response.data;
    }
    const response = await userApi.get('/profile-v2');
    return response.data;
  },
  getUserData: async () => {
    if (USE_PROXY) {
      const response = await proxyApi.get('/api/user/data');
      return response.data;
    }
    const response = await userApi.get('/data');
    return response.data;
  },
  changeStatus: async (status: 'online' | 'offline') => {
    if (USE_PROXY) {
      const response = await proxyApi.post('/api/user/change-status', { status });
      return response.data;
    }
    const response = await userApi.post('/change-status', { status });
    return response.data;
  },
  changeVideoStatus: async (status: boolean) => {
    if (USE_PROXY) {
      const response = await proxyApi.post('/api/user/change-status-video', { status });
      return response.data;
    }
    const response = await userApi.post('/change-status-video', { status });
    return response.data;
  },
};

// Transaction APIs
export const transactionAPI = {
  getTransactions: async (skip: number = 0, limit: number = 20, isTransactions?: boolean) => {
    const params: any = { 
      skip: skip.toString(), 
      limit: limit.toString() 
    };
    // Only pass isTransactions if it's true (backend checks for truthy value)
    if (isTransactions === true) {
      params.isTransactions = 'true';
    }
    console.log('Fetching transactions with params:', params);
    
    if (USE_PROXY) {
      const response = await proxyApi.get('/api/payment/transaction/transactions', { params });
      console.log('Transactions API response:', response.data);
      return response.data;
    }
    
    const response = await paymentApi.get('/transaction/transactions', {
      params,
    });
    console.log('Transactions API response:', response.data);
    return response.data;
  },
  getWalletBalance: async () => {
    if (USE_PROXY) {
      const response = await proxyApi.get('/api/payment/transaction/wallet-balance');
      return response.data;
    }
    const response = await paymentApi.get('/transaction/wallet-balance');
    return response.data;
  },
  getDailyEarnings: async (days: number = 7) => {
    if (USE_PROXY) {
      const response = await proxyApi.get('/api/payment/transaction/stats', {
        params: { days: days.toString() }
      });
      return response.data;
    }
    const response = await paymentApi.get('/transaction/stats', {
      params: { days: days.toString() }
    });
    return response.data;
  },
  getWalletPageData: async () => {
    if (USE_PROXY) {
      const response = await proxyApi.get('/api/payment/transaction/wallet-page-data');
      return response.data;
    }
    const response = await paymentApi.get('/transaction/wallet-page-data');
    return response.data;
  },
};

export default { authApi, userApi, paymentApi };
