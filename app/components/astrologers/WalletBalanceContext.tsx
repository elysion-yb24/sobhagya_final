'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Utility functions (import from your utils if needed)
import { getAuthToken, isAuthenticated, clearAuthData } from '../../utils/auth-utils';
import { getApiBaseUrl } from '../../config/api';
import { fetchWalletBalance as productionFetchWalletBalance } from '../../utils/production-api';
import { isProduction } from '../../utils/environment-check';

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

  const fetchWalletBalance = useCallback(async (retryCount = 0) => {
    if (isFetching) return;
    setIsFetching(true);
    setAuthError(null);
    
    console.log(`🔄 Fetching wallet balance (attempt ${retryCount + 1})`);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('❌ User not authenticated, setting wallet balance to 0');
        setWalletBalance(0);
        setAuthError('User not authenticated');
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.log('❌ No auth token found, setting wallet balance to 0');
        setWalletBalance(0);
        setAuthError('No authentication token found');
        return;
      }

      console.log('✅ User authenticated, token available');
      
      // Use production-safe API wrapper
      if (isProduction()) {
        console.log('🌐 Using production-safe wallet balance API');
        try {
          const balance = await productionFetchWalletBalance();
          console.log(`💰 Wallet balance fetched successfully: ${balance}`);
          setWalletBalance(balance);
          setAuthError(null);
        } catch (error: any) {
          console.error('❌ Production wallet balance fetch failed:', error);
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.log('🔐 401 error detected, clearing auth data');
            setAuthError('Authentication failed. Please login again.');
            // Clear auth data on 401
            clearAuthData();
          } else {
            setAuthError('Failed to fetch wallet balance');
          }
          setWalletBalance(0);
        }
      } else {
        // Development: Use direct API call
        const apiUrl = `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`;
        console.log('🔧 Development mode - Fetching wallet balance from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        console.log(`📡 Development response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Wallet balance response data:', data);
          if (data.success && data.data) {
            setWalletBalance(data.data.balance || 0);
            setAuthError(null);
          } else {
            console.warn('⚠️ Wallet balance response not successful:', data);
            setAuthError('Invalid response format');
            setWalletBalance(0);
          }
        } else if (response.status === 401) {
          console.error('🔐 401 Unauthorized - Token may be expired');
          setAuthError('Authentication failed. Please login again.');
          setWalletBalance(0);
          // Clear auth data on 401
          clearAuthData();
          
          // Retry once after clearing auth data
          if (retryCount === 0) {
            console.log('🔄 Retrying wallet balance fetch after clearing auth data...');
            setTimeout(() => {
              fetchWalletBalance(1);
            }, 1000);
          }
        } else {
          console.error(`❌ HTTP ${response.status} error`);
          setAuthError(`Server error: ${response.status}`);
          setWalletBalance(0);
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching wallet balance:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('🔐 401 error in catch block, clearing auth data');
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