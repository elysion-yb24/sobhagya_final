'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Utility functions
import { getAuthToken, isAuthenticated, clearAuthData } from '../../utils/auth-utils';
import { fetchWalletBalance as simpleFetchWalletBalance } from '../../utils/production-api';

interface WalletBalanceContextType {
  walletBalance: number;
  isFetching: boolean;
  refreshWalletBalance: () => Promise<void>;
  authError: string | null;
}

const WalletBalanceContext = createContext<WalletBalanceContextType | undefined>(undefined);

export const WalletBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    setAuthError(null);
    
    console.log('🔄 Fetching wallet balance...');
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('❌ User not authenticated, setting balance to 0');
        setWalletBalance(0);
        setAuthError(null); // Don't show error for logout
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.log('❌ No auth token found, setting balance to 0');
        setWalletBalance(0);
        setAuthError(null); // Don't show error for logout
        return;
      }

      console.log('✅ User authenticated, fetching wallet balance');
      
      // Use simple API function (works same in dev and production)
      const balance = await simpleFetchWalletBalance();
      console.log('💰 Wallet balance fetched:', balance);
      setWalletBalance(balance);
      setAuthError(null);
      
    } catch (error: any) {
      console.error('❌ Error fetching wallet balance:', error);
      
      // Check if user is still authenticated after error
      if (!isAuthenticated()) {
        console.log('❌ User no longer authenticated after error, clearing data');
        setWalletBalance(0);
        setAuthError(null); // Don't show error for logout
        return;
      }
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('🔐 401 error detected');
        
        // Check if it's the specific payment service auth error
        if (error.message?.includes('PAYMENT_SERVICE_AUTH_REQUIRED')) {
          setAuthError('Payment service authentication issue. Please contact support.');
        } else {
          console.log('Clearing auth data due to 401 error');
          setAuthError('Authentication failed. Please login again.');
          clearAuthData();
        }
      } else if (error.message?.includes('PAYMENT_SERVICE_AUTH_REQUIRED')) {
        setAuthError('Payment service authentication issue. Please contact support.');
      } else {
        setAuthError('Failed to fetch wallet balance');
      }
      setWalletBalance(0);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  // Listen for logout events and clear wallet data
  useEffect(() => {
    const handleLogout = () => {
      console.log('🚪 Logout detected, clearing wallet data');
      setWalletBalance(0);
      setAuthError(null);
    };

    // Listen for custom logout event
    window.addEventListener('user-logout', handleLogout);
    
    // Also check periodically if user is still authenticated
    const checkAuthInterval = setInterval(() => {
      if (!isAuthenticated()) {
        handleLogout();
      }
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('user-logout', handleLogout);
      clearInterval(checkAuthInterval);
    };
  }, []);

  useEffect(() => {
    fetchWalletBalance();
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletBalanceContext.Provider value={{ 
      walletBalance, 
      isFetching, 
      refreshWalletBalance: fetchWalletBalance,
      authError 
    }}>
      {children}
    </WalletBalanceContext.Provider>
  );
};

export const useWalletBalance = () => {
  const context = useContext(WalletBalanceContext);
  if (context === undefined) {
    throw new Error('useWalletBalance must be used within a WalletBalanceProvider');
  }
  return context;
};