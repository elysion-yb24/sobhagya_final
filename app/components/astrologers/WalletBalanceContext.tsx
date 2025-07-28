'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Utility functions (import from your utils if needed)
import { getAuthToken } from '../../utils/auth-utils';
import { getApiBaseUrl } from '../../config/api';

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
        setWalletBalance(0);
        return;
      }
      const response = await fetch(
        `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setWalletBalance(data.data.balance || 0);
        }
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