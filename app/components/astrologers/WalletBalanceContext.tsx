'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Utility functions (import from your utils if needed)
import { getAuthToken } from '../../utils/auth-utils';
import { getApiBaseUrl } from '../../config/api';
import { apiRequestJson } from '../../utils/api-config';
import { customHeaderApiRequestJson } from '../../utils/secure-production-api';

interface WalletBalanceContextType {
  walletBalance: number;
  isFetching: boolean;
  refreshWalletBalance: () => Promise<void>;
}

const WalletBalanceContext = createContext<WalletBalanceContextType | undefined>(undefined);

export const WalletBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const fetchWalletBalance = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token found, setting wallet balance to 0');
        setWalletBalance(0);
        return;
      }
      
      const apiUrl = `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`;
      console.log('Fetching wallet balance from:', apiUrl);
      
      try {
        let data;
        if (process.env.NODE_ENV === 'production') {
          data = await customHeaderApiRequestJson(apiUrl);
        } else {
          data = await apiRequestJson(apiUrl, { token });
        }
        
        console.log('Wallet balance response data:', data);
        if (data.success && data.data) {
          setWalletBalance(data.data.balance || 0);
        } else {
          console.warn('Wallet balance response not successful:', data);
        }
      } catch (error) {
        console.error('Wallet balance API failed:', error);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
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
    <WalletBalanceContext.Provider value={{ walletBalance, isFetching, refreshWalletBalance: fetchWalletBalance }}>
      {children}
    </WalletBalanceContext.Provider>
  );
};

export const useWalletBalance = () => {
  const context = useContext(WalletBalanceContext);
  if (!context) {
    throw new Error('useWalletBalance must be used within a WalletBalanceProvider');
  }
  return context;
}; 