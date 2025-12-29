"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { fetchWalletBalance as simpleFetchWalletBalance } from '../utils/production-api';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';
import ConnectingCallModal from '../components/ui/ConnectingCallModal';
import VideoCallRoom from '../components/video/VideoCallRoom';

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get('token');
  const roomName = searchParams?.get('room');
  const astrologerName = searchParams?.get('astrologer');
  const astrologerId = searchParams?.get('astrologerId') || localStorage.getItem('lastAstrologerId');
  const wsURL = searchParams?.get('wsURL');



  const [error, setError] = useState<string | null>(null);
  const [broadcasterStatus, setBroadcasterStatus] = useState<'waiting' | 'joined' | 'not_allowed' | 'access_denied' | 'error'>('waiting');

  const socketRef = useRef<any>(null);

  // Wallet balance states
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(true);
  const [isInitializingCall, setIsInitializingCall] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  // Connecting state
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectingCallType, setConnectingCallType] = useState<'video'>('video');

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

  const initializeSocket = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails?.id || userDetails?._id;

      if (!userId) {
        return;
      }

      // Dynamic import of socket.io-client
      const { io } = await import('socket.io-client');

      // Connect to socket server
      const socket = io('https://micro.sobhagya.in', {
        path: '/call-socket/socket.io',
        query: {
          userId,
          role: 'user'
        },
        transports: ['websocket']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // Register with the channel (already done in astrologer profile page, but good to ensure)
        socket.emit('register', {
          userId,
          channelId: roomName
        });
      });

      socket.on('disconnect', () => {
      });

      socket.on('broadcaster_joined', (data: any) => {
        // Support both {resp: ...} and direct object
        const resp = data?.resp || data;
        // Handle different response statuses
        if (resp && resp.status) {
          switch (resp.status) {
            case 'NOT_ALLOWED':
              setBroadcasterStatus('not_allowed');
              // Show user-friendly error message based on the reason
              let errorMessage = 'Astrologer is not available for video calls right now';
              if (resp.reason === 'INSUFFICIENT_BALANCE') {
                errorMessage = 'Astrologer has insufficient balance to join the call';
              } else if (resp.reason === 'ALREADY_IN_CALL') {
                errorMessage = 'Astrologer is currently in another call';
              } else if (resp.reason === 'OFFLINE') {
                errorMessage = 'Astrologer is currently offline';
              } else if (resp.reason === 'VIDEO_NOT_ALLOWED') {
                errorMessage = 'Video calls are not enabled for this astrologer';
              } else if (resp.message) {
                errorMessage = resp.message;
              }
              setError(`Call connection failed: ${errorMessage}`);
              // End the call after showing error
              setTimeout(() => {
                cleanup();
                window.close();
              }, 5000);
              break;
            case 'SUCCESS':
            case 'ALLOWED':
              setBroadcasterStatus('joined');
              break;
            default:
              setBroadcasterStatus('error');
              break;
          }
        } else {
          // Legacy format - assume success if no status field
          setBroadcasterStatus('joined');
        }
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
        alert('Astrologer has disconnected from the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('partner_left', (data: any) => {
        alert('Astrologer has left the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('call_terminated', (data: any) => {
        alert('Call has been terminated.');
        cleanup();
        handleDisconnect();
      });

      socket.on('broadcaster_disconnect', (data: any) => {
        alert('Astrologer has disconnected from the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('broadcaster_left', (data: any) => {
        alert('Astrologer has left the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('connect_error', (error: any) => {
      });

    } catch (error) {
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
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails?.id || userDetails?._id;

      try {
        socketRef.current.emit('end_call', {
          channelId: roomName,
          userId,
          reason: 'USER_ENDED_CALL'
        });
      } catch (error) {
      }
    }

    // Add a small delay to ensure socket events are sent
    setTimeout(() => {
      cleanup();

      // Navigate back based on where the user came from
      setTimeout(() => {
        const callSource = localStorage.getItem('callSource');

        if (callSource === 'astrologerCard') {
          // If user came from astrologer card, go back to astrologers list
          window.history.replaceState(null, '', '/astrologers');
          window.location.href = '/astrologers';
        } else if (callSource === 'astrologerProfile' && astrologerId) {
          // If user came from astrologer profile, go back to that profile
          window.history.replaceState(null, '', `/astrologers/${astrologerId}`);
          window.location.href = `/astrologers/${astrologerId}`;
        } else {
          // Fallback to astrologers list
          window.history.replaceState(null, '', '/astrologers');
          window.location.href = '/astrologers';
        }

        // Clean up localStorage
        localStorage.removeItem('callSource');
      }, 50);
    }, 100);
  };

  const fetchWalletPageData = async () => {
    try {
      setIsCheckingBalance(true);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setIsConnecting(false);
        return 0;
      }

      // Use simple API function (works same in dev and production)
      const balance = await simpleFetchWalletBalance();

      setWalletBalance(balance);

      // Check if user has sufficient balance for video call
      const estimatedCost = getEstimatedCallCost();

      if (balance < estimatedCost) {
        setShowInsufficientBalanceModal(true);
        setIsConnecting(false);
        return balance;
      }

      // If balance is sufficient, proceed with call initialization
      initializeCall();
      return balance;
    } catch (error) {
      setError("Failed to check wallet balance");
      setIsConnecting(false);
      return 0;
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const getEstimatedCallCost = () => {
    // Get astrologer details from URL params or localStorage
    const searchParams = new URLSearchParams(window.location.search);
    const videoRpm = searchParams.get('videoRpm') || searchParams.get('rpm') || '25'; // Default video RPM

    // Estimate minimum 2 minutes cost
    return parseInt(videoRpm) * 2;
  };

  const getAstrologerName = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('astrologerName') || 'Astrologer';
  };

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://micro.sobhagya.in';
  };

  const initializeCall = async () => {
    try {
      setIsInitializingCall(true);

      // Initialize socket connection
      await initializeSocket();

      // Hide connecting overlay when call is ready
      setIsConnecting(false);

    } catch (error) {
      setError('Failed to initialize call');
      setIsConnecting(false);
    } finally {
      setIsInitializingCall(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Call Error</h2>
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Call</h2>
          <p className="text-gray-600 mb-6">Missing video call parameters</p>
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
      {/* Connecting Call Modal */}
      <ConnectingCallModal
        isOpen={isConnecting}
        callType={connectingCallType}
        astrologerName={astrologerName ? decodeURIComponent(astrologerName) : 'Astrologer'}
      />

      <VideoCallRoom
        token={token}
        wsURL={wsURL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://sobhagya-gpfn4cyx.livekit.cloud'}
        roomName={roomName}
        participantName={getUserDetails()?.name || 'User'}
        astrologerName={astrologerName ? decodeURIComponent(astrologerName) : undefined}
        onDisconnect={handleDisconnect}
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