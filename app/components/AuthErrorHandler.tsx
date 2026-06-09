'use client';

import React, { useEffect, useState } from 'react';
import { useWalletBalance } from './astrologers/WalletBalanceContext';
import AuthErrorNotification from './ui/AuthErrorNotification';
import SessionExpiredModal from './ui/SessionExpiredModal';

const AuthErrorHandler: React.FC = () => {
  const { authError } = useWalletBalance();
  const [chatAuthError, setChatAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; status?: number }>).detail;
      const msg = detail?.message || 'Your chat session needs to be re-authenticated. Please sign in again if this persists.';
      setChatAuthError(msg);
    };
    window.addEventListener('chat-api-auth-error', handler as EventListener);
    return () => window.removeEventListener('chat-api-auth-error', handler as EventListener);
  }, []);

  // Wallet errors take precedence (they're the more visible failure); fall back
  // to chat-api errors so the user knows when chat is throwing 401s. The
  // SessionExpiredModal handles the hard-expiry case (refresh failed) globally.
  return (
    <>
      <AuthErrorNotification
        error={authError || chatAuthError}
        onDismiss={() => setChatAuthError(null)}
        autoHide={true}
        autoHideDelay={8000}
      />
      <SessionExpiredModal />
    </>
  );
};

export default AuthErrorHandler;