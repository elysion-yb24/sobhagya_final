"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import CallPage from '../components/calling/CallPage';
import CallError from '../components/calling/ui/CallError';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';
import ConnectingCallModal from '../components/ui/ConnectingCallModal';

export default function AudioCallPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const roomName = searchParams?.get('room');
  const astrologerName = searchParams?.get('astrologer');
  const astrologerId = searchParams?.get('astrologerId') || (typeof window !== 'undefined' ? localStorage.getItem('lastAstrologerId') : null);
  const wsURL = searchParams?.get('wsURL');
  const avatar = searchParams?.get('avatar');
  const rpm = searchParams?.get('rpm') || '0';
  const balance = searchParams?.get('balance') || '0';

  console.log('🎵 AudioCallPage mounted with:', { 
    room: roomName, 
    astrologer: astrologerName,
    hasToken: !!token,
    wsURL,
    avatar
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);

  const serverUrl = wsURL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://sobhagya-gpfn4cyx.livekit.cloud';

  // Check wallet balance
  useEffect(() => {
    if (token && roomName) {
      fetchWalletPageData();
    } else {
      const missingParams = [];
      if (!token) missingParams.push('token');
      if (!roomName) missingParams.push('room');
      setError(`Missing audio call parameters: ${missingParams.join(', ')}`);
      setIsCheckingBalance(false);
      setIsConnecting(false);
    }
  }, [token, roomName]);

  const fetchWalletPageData = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        setError('Authentication required');
        setIsCheckingBalance(false);
        setIsConnecting(false);
        return;
      }

      const response = await fetch('/api/wallet-balance', {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const balance = data.data?.balance || 0;
        setWalletBalance(balance);
      } else {
        console.warn('Failed to fetch wallet balance, proceeding anyway');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsCheckingBalance(false);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    console.log('🎵 Audio call page: handleDisconnect called');

    // Navigate back based on where the user came from
    setTimeout(() => {
      const callSource = typeof window !== 'undefined' ? localStorage.getItem('callSource') : null;

      if (callSource === 'astrologerCard') {
        window.history.replaceState(null, '', '/astrologers');
        window.location.href = '/astrologers';
      } else if (callSource === 'astrologerProfile' && astrologerId) {
        window.history.replaceState(null, '', `/astrologers/${astrologerId}`);
        window.location.href = `/astrologers/${astrologerId}`;
      } else {
        window.history.replaceState(null, '', '/astrologers');
        window.location.href = '/astrologers';
      }

      // Clean up localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('callSource');
      }
    }, 100);
  };

  const getEstimatedCallCost = () => {
    const estimatedRpm = 15;
    const estimatedMinutes = 2;
    return estimatedRpm * estimatedMinutes;
  };

  const getAstrologerName = () => {
    return astrologerName ? decodeURIComponent(astrologerName) : 'Astrologer';
  };

  if (isCheckingBalance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to Audio Call</h2>
          <p className="text-gray-600">Please wait while we set up your call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <CallError error={error} />;
  }

  if (!token || !roomName) {
    return <CallError error="Missing audio call parameters. Please initiate the call from the astrologers page." />;
  }

  return (
    <>
      {/* Connecting Call Modal */}
      <ConnectingCallModal
        isOpen={isConnecting}
        callType="audio"
        astrologerName={getAstrologerName()}
      />

      {/* Main Call UI — powered by Baatein's proven architecture */}
      <CallPage
        token={token}
        serverUrl={serverUrl}
        receiverName={getAstrologerName()}
        channelId={roomName}
        receiverId={astrologerId || ''}
        callType="call"
        receiverAvatar={avatar || ''}
        onDisconnect={handleDisconnect}
        initialRpm={rpm}
        initialBalance={balance}
      />

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        requiredAmount={getEstimatedCallCost()}
        currentBalance={walletBalance}
        serviceType="call"
        astrologerName={getAstrologerName()}
      />
    </>
  );
}