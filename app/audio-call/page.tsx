"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import CallPage from '../components/calling/CallPage';
import CallError from '../components/calling/ui/CallError';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';
import ConnectingCallModal from '../components/ui/ConnectingCallModal';

export default function AudioCallPage() {
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
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f0c29] z-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-56 h-56 bg-orange-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[25%] right-[10%] w-64 h-64 bg-amber-400/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Setting up Audio Call</h2>
          <p className="text-white/50 text-sm mb-6">Verifying wallet balance...</p>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-orange-500 to-amber-300"
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