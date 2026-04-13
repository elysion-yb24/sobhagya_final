"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { fetchWalletBalance as simpleFetchWalletBalance } from '../utils/production-api';
import CallPage from '../components/calling/CallPage';
import CallError from '../components/calling/ui/CallError';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';
import ConnectingCallModal from '../components/ui/ConnectingCallModal';

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get('token');
  const roomName = searchParams?.get('room');
  const astrologerName = searchParams?.get('astrologer');
  const astrologerId = searchParams?.get('astrologerId') || (typeof window !== 'undefined' ? localStorage.getItem('lastAstrologerId') : null);
  const wsURL = searchParams?.get('wsURL');
  const avatar = searchParams?.get('avatar');
  const rpm = searchParams?.get('rpm') || '0';
  const balance = searchParams?.get('balance') || '0';

  console.log('📞 VideoCallPage mounted with:', { 
    room: roomName, 
    astrologer: astrologerName,
    hasToken: !!token,
    wsURL,
    avatar
  });

  // Wallet balance states
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(true);

  // Connecting state
  const [isConnecting, setIsConnecting] = useState(true);

  const serverUrl = wsURL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://sobhagya-gpfn4cyx.livekit.cloud';

  // Check wallet balance and initialize call
  useEffect(() => {
    if (token && roomName) {
      fetchWalletPageData();
    } else {
      const missingParams = [];
      if (!token) missingParams.push('token');
      if (!roomName) missingParams.push('room');
      setError(`Missing video call parameters: ${missingParams.join(', ')}`);
      setIsCheckingBalance(false);
      setIsConnecting(false);
    }
  }, [token, roomName]);

  const fetchWalletPageData = async () => {
    try {
      setIsCheckingBalance(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setError("Authentication required");
        setIsConnecting(false);
        return;
      }

      console.log('Checking wallet balance for video call...');
      const balance = await simpleFetchWalletBalance();
      setWalletBalance(balance);

      // Check if user has sufficient balance
      const estimatedCost = getEstimatedCallCost();

      if (balance < estimatedCost) {
        setShowInsufficientBalanceModal(true);
        setIsConnecting(false);
        return;
      }

      // Balance is sufficient, proceed
      setIsConnecting(false);
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      setError("Failed to check wallet balance");
      setIsConnecting(false);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const getEstimatedCallCost = () => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const videoRpm = urlParams?.get('videoRpm') || urlParams?.get('rpm') || '25';
    return parseInt(videoRpm) * 2;
  };

  const getAstrologerName = () => {
    return astrologerName ? decodeURIComponent(astrologerName) : 'Astrologer';
  };

  const handleDisconnect = () => {
    console.log('📞 Video call page: handleDisconnect called');

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

      if (typeof window !== 'undefined') {
        localStorage.removeItem('callSource');
      }
    }, 100);
  };

  if (error) {
    return <CallError error={error} />;
  }

  if (isCheckingBalance) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            <span className="text-xl font-semibold">Checking balance...</span>
          </div>

          <p className="text-gray-300 text-sm">
            Verifying wallet balance for video call
          </p>
        </div>
      </div>
    );
  }

  if (!token || !roomName) {
    return <CallError error="Missing video call parameters. Please initiate the call from the astrologers page." />;
  }

  return (
    <>
      {/* Connecting Call Modal */}
      <ConnectingCallModal
        isOpen={isConnecting}
        callType="video"
        astrologerName={getAstrologerName()}
      />

      {/* Main Call UI — powered by Baatein's proven architecture */}
      <CallPage
        token={token}
        serverUrl={serverUrl}
        receiverName={getAstrologerName()}
        channelId={roomName}
        receiverId={astrologerId || ''}
        callType="video"
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