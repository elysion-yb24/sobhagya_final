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

     ;
      
      // Use simple API function (works same in dev and production)
      const balance = await simpleFetchWalletBalance();
     
      setWalletBalance(balance);
      setAuthError(null);
      
    } catch (error: any) {
      const isAuthError =
        error?.message?.includes('401') ||
        error?.message?.includes('403') ||
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('PAYMENT_SERVICE_AUTH_REQUIRED');
      // Auth errors are expected (token expired) — log quietly so we don't trip the dev overlay.
      if (isAuthError) {
        console.warn('Wallet balance: auth required');
      } else {
        console.error('❌ Error fetching wallet balance:', error);
      }

      // Check if user is still authenticated after error
      if (!isAuthenticated()) {
       
        setWalletBalance(0);
        setAuthError(null); 
        return;
      }
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        // A 401 from the wallet endpoint usually means the server-side auth
        // cookies aren't reaching payment-service (e.g. transient backend hiccup,
        // proxy race after fresh login). DO NOT call clearAuthData() here —
        // it wipes localStorage and dispatches user-logout, which then makes
        // every other component think the user logged out and triggers a
        // login-redirect loop. Just record the error; the user can retry.
        if (error.message?.includes('PAYMENT_SERVICE_AUTH_REQUIRED')) {
          setAuthError('Payment service authentication issue. Please contact support.');
        } else {
          setAuthError('Could not load wallet balance. Please try again.');
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

    const handleAuthChange = () => {
      console.log('🔐 Auth change detected, refreshing wallet balance');
      // Add a small delay to ensure auth data is properly set
      setTimeout(() => {
        fetchWalletBalance();
      }, 100);
    };

    // Manual/external refresh trigger — any component can call
    // window.dispatchEvent(new Event('wallet-balance-refresh')) to force a refetch.
    // We also bump a localStorage version key so other open tabs (which don't
    // see this event) pick the change up via the `storage` handler below.
    const handleManualRefresh = () => {
      if (!isAuthenticated()) return;
      try {
        localStorage.setItem('wallet-balance-version', String(Date.now()));
      } catch {
        // localStorage may be disabled in private mode — ignore.
      }
      fetchWalletBalance();
    };

    // Listen for custom logout event
    window.addEventListener('user-logout', handleLogout);

    // Listen for auth change events (login/logout)
    window.addEventListener('user-auth-changed', handleAuthChange);

    // Listen for explicit wallet refresh requests (after calls, chat msgs, etc.)
    window.addEventListener('wallet-balance-refresh', handleManualRefresh);

    // Cross-tab sync: a recharge or chat-spend in another tab bumps the
    // `wallet-balance-version` key in localStorage; we react by re-fetching.
    // Same-tab updates don't fire `storage`, which is exactly what we want
    // (the originating tab already refreshes via the manual event above).
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'wallet-balance-version' && isAuthenticated()) {
        fetchWalletBalance();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Also check periodically if user is still authenticated
    const checkAuthInterval = setInterval(() => {
      if (!isAuthenticated()) {
        handleLogout();
      }
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('user-auth-changed', handleAuthChange);
      window.removeEventListener('wallet-balance-refresh', handleManualRefresh);
      window.removeEventListener('storage', handleStorage);
      clearInterval(checkAuthInterval);
    };
  }, [fetchWalletBalance]);

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