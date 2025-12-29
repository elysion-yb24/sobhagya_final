"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { getApiBaseUrl } from '../config/api';
import VideoCallRoom from '../components/video/VideoCallRoom';
import AudioCallRoom from '../components/audio/AudioCallRoom';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';

export default function AstrologerCallPage() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId');
  const userName = searchParams?.get('userName');
  const roomName = searchParams?.get('roomName');
  const callType = searchParams?.get('callType');

  const [isCheckingBalance, setIsCheckingBalance] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [broadcasterStatus, setBroadcasterStatus] = useState<'waiting' | 'joined' | 'not_allowed' | 'error'>('waiting');
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [wsURL, setWsURL] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  // Check wallet balance and initialize call
  useEffect(() => {
    if (userId && userName && roomName && callType) {
      fetchWalletPageData();
    } else {
      setError('Missing call parameters');
      setIsCheckingBalance(false);
    }
  }, [userId, userName, roomName, callType]);

  const initializeSocket = async () => {
    try {
      // Get astrologer details from localStorage
      const astrologerDetails = JSON.parse(localStorage.getItem('astrologerDetails') || '{}');
      const astrologerId = astrologerDetails?.id || astrologerDetails?._id;

      if (!astrologerId) {
        return;
      }

      // Dynamic import of socket.io-client
      const { io } = await import('socket.io-client');

      // Connect to socket server as broadcaster
      const socket = io('https://micro.sobhagya.in', {
        path: '/call-socket/socket.io',
        query: {
          userId: astrologerId,
          role: 'broadcaster'
        },
        transports: ['websocket']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // Register with the channel
        socket.emit('register', {
          userId: astrologerId,
          channelId: roomName
        });
      });

      socket.on('disconnect', () => {
      });

      socket.on('user_joined', (data: any) => {
        setBroadcasterStatus('joined');
      });

      socket.on('end_call', (data: any) => {
        cleanup();
        handleDisconnect();
      });

      // Also listen for call_end events from server (for backward compatibility)
      socket.on('call_end', (data: any) => {
        cleanup();
        handleDisconnect();
      });

      // Listen for partner disconnection events
      socket.on('partner_disconnect', (data: any) => {
        alert('User has disconnected from the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('partner_left', (data: any) => {
        alert('User has left the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('call_terminated', (data: any) => {
        alert('Call has been terminated.');
        cleanup();
        handleDisconnect();
      });

      socket.on('user_disconnect', (data: any) => {
        alert('User has disconnected from the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('user_left', (data: any) => {
        alert('User has left the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ Astrologer socket connection error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize astrologer socket:', error);
    }
  };

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const handleDisconnect = () => {
    // Emit end call event via socket
    if (socketRef.current && roomName) {
      const astrologerDetails = JSON.parse(localStorage.getItem('astrologerDetails') || '{}');
      const astrologerId = astrologerDetails?.id || astrologerDetails?._id;

      socketRef.current.emit('end_call', {
        channelId: roomName,
        userId: astrologerId,
        reason: 'ASTROLOGER_ENDED_CALL'
      });
    }

    cleanup();
    window.close(); // Close the popup window
  };

  const fetchWalletPageData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setIsCheckingBalance(false);
        return 0;
      }

      // Use Next.js API route instead of calling backend directly to avoid CORS
      const response = await fetch('/api/wallet-balance', {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const balance = data.data?.balance || 0;
        setWalletBalance(balance);

        // After wallet check, get LiveKit token
        await fetchLiveKitToken();

        return balance;
      } else {
        setError('Failed to fetch wallet balance');
        setIsCheckingBalance(false);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet balance');
      setIsCheckingBalance(false);
      return 0;
    }
  };

  const fetchLiveKitToken = async () => {
    try {
      const token = getAuthToken();
      if (!token || !roomName) {
        setError('Missing authentication or room information');
        setIsCheckingBalance(false);
        return;
      }

      // Get astrologer details
      const astrologerDetails = JSON.parse(localStorage.getItem('astrologerDetails') || '{}');
      const astrologerId = astrologerDetails?.id || astrologerDetails?._id;

      if (!astrologerId) {
        setError('Astrologer information not found');
        setIsCheckingBalance(false);
        return;
      }

      // Request LiveKit token for astrologer
      const baseUrl = getApiBaseUrl() || 'https://micro.sobhagya.in';
      const livekitUrl = `${baseUrl}/calling/api/call/call-token-livekit?channel=${encodeURIComponent(roomName)}`;

      const response = await fetch(livekitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverUserId: userId,
          type: callType === 'call' ? 'call' : 'video',
          appVersion: '1.0.0',
          astrologerId: astrologerId
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get call token');
      }

      const data = await response.json();

      if (!data.success || !data.data?.token) {
        throw new Error(data.message || 'Failed to get call token');
      }

      setLivekitToken(data.data.token);
      setWsURL(data.data.livekitSocketURL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://sobhagya-gpfn4cyx.livekit.cloud');
      setIsCheckingBalance(false);

      // Initialize socket after getting token
      initializeSocket();

    } catch (error) {
      console.error('Error fetching LiveKit token:', error);
      setError(error instanceof Error ? error.message : 'Failed to get call token');
      setIsCheckingBalance(false);
    }
  };

  const getEstimatedCallCost = () => {
    // Estimate cost based on call type and default RPM
    const estimatedRpm = callType === 'video' ? 25 : 15;
    const estimatedMinutes = 2; // Minimum 2 minutes
    return estimatedRpm * estimatedMinutes;
  };

  const getCallTypeDisplay = () => {
    return callType === 'call' ? 'Audio Call' : 'Video Call';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  if (isCheckingBalance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to {getCallTypeDisplay()}</h2>
          <p className="text-gray-600">Please wait while we set up your call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!livekitToken || !roomName || !wsURL) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Call</h2>
          <p className="text-gray-600 mb-6">Missing call parameters</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {callType === 'call' ? (
        <AudioCallRoom
          token={livekitToken}
          wsURL={wsURL}
          roomName={roomName}
          participantName={getUserDetails()?.name || 'Astrologer'}
          astrologerName={userName ? decodeURIComponent(userName) : undefined}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <VideoCallRoom
          token={livekitToken}
          wsURL={wsURL}
          roomName={roomName}
          participantName={getUserDetails()?.name || 'Astrologer'}
          astrologerName={userName ? decodeURIComponent(userName) : undefined}
          onDisconnect={handleDisconnect}
        />
      )}

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        requiredAmount={getEstimatedCallCost()}
        currentBalance={walletBalance}
        serviceType="call"
        astrologerName={userName ? decodeURIComponent(userName) : 'User'}
      />
    </>
  );
} 