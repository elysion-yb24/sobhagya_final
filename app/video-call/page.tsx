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

    const callSource = typeof window !== 'undefined' ? localStorage.getItem('callSource') : null;
    if (typeof window !== 'undefined') localStorage.removeItem('callSource');

    setTimeout(() => {
      if (callSource === 'astrologerProfile' && astrologerId) {
        router.replace(`/astrologers/${astrologerId}`);
      } else {
        router.replace('/astrologers');
      }
    }, 100);
  };

  if (error) {
    return <CallError error={error} />;
  }

  if (isCheckingBalance) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f0c29] z-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-56 h-56 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[25%] right-[10%] w-64 h-64 bg-indigo-400/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Setting up Video Call</h2>
          <p className="text-white/50 text-sm mb-6">Verifying wallet balance...</p>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-blue-500 to-indigo-300"
                style={{
                  animation: 'wave-load 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                  height: '6px',
                }}
              />
            ))}
          </div>
          <style jsx global>{`
            @keyframes wave-load {
              0%, 100% { height: 6px; opacity: 0.4; }
              50% { height: 18px; opacity: 1; }
            }
          `}</style>
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