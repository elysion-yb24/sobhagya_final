'use client';

import React from 'react';
import { useWalletBalance } from './astrologers/WalletBalanceContext';
import AuthErrorNotification from './ui/AuthErrorNotification';

const AuthErrorHandler: React.FC = () => {
  const { authError } = useWalletBalance();

  return (
    <AuthErrorNotification 
      error={authError} 
      autoHide={true}
      autoHideDelay={8000}
    />
  );
};

export default AuthErrorHandler; 