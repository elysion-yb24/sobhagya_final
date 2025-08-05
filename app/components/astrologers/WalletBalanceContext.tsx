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
        console.log('❌ User not authenticated');
        setWalletBalance(0);
        setAuthError('User not authenticated');
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.log('❌ No auth token found');
        setWalletBalance(0);
        setAuthError('No authentication token found');
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
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('🔐 401 error detected, clearing auth data');
        setAuthError('Authentication failed. Please login again.');
        clearAuthData();
      } else {
        setAuthError('Failed to fetch wallet balance');
      }
      setWalletBalance(0);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

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