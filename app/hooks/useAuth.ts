import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuthToken, 
  isAuthenticated, 
  isAuthenticatedAsync, 
  initializeAuth, 
  clearAuthData,
  getUserDetails
} from '../utils/auth-utils';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  token: string | null;
  logout: () => void;
  refreshAuth: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    clearAuthData();
    setIsAuthenticatedState(false);
    setUser(null);
    setToken(null);
    router.push('/');
  }, [router]);

  const refreshAuth = useCallback((): boolean => {
    try {
      console.log('🔄 Refreshing authentication...');
      const isValid = initializeAuth();
      
      if (isValid) {
        const currentToken = getAuthToken();
        const userDetails = getUserDetails();
        setIsAuthenticatedState(true);
        setToken(currentToken);
        setUser(userDetails);
        console.log('✅ Authentication refresh successful');
        return true;
      } else {
        console.log('❌ Authentication refresh failed');
        logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Error during authentication refresh:', error);
      logout();
      return false;
    }
  }, [logout]);

  const checkAuth = useCallback(() => {
    console.log('🔍 Checking authentication status...');
    setIsLoading(true);
    
    try {
      const isValid = initializeAuth();
      
      if (isValid) {
        const currentToken = getAuthToken();
        const userDetails = getUserDetails();
        setIsAuthenticatedState(true);
        setToken(currentToken);
        setUser(userDetails);
        console.log('✅ User is authenticated');
      } else {
        console.log('❌ User is not authenticated');
        setIsAuthenticatedState(false);
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      setIsAuthenticatedState(false);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up periodic authentication checks
  useEffect(() => {
    if (!isAuthenticatedState) return;

    const interval = setInterval(() => {
      try {
        const isStillAuth = isAuthenticatedAsync();
        if (!isStillAuth) {
          console.log('❌ Authentication expired during periodic check');
          logout();
        }
      } catch (error) {
        console.error('❌ Error during periodic auth check:', error);
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticatedState, logout]);

  return {
    isAuthenticated: isAuthenticatedState,
    isLoading,
    user,
    token,
    logout,
    refreshAuth
  };
} 