"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { getApiBaseUrl } from '../config/api';
import { fetchWalletBalance as productionFetchWalletBalance } from '../utils/production-api';
import { isProduction } from '../utils/environment-check';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';
import VideoCallRoom from '../components/video/VideoCallRoom';

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams?.get('token');
  const roomName = searchParams?.get('room');
  const astrologerName = searchParams?.get('astrologer');
  const wsURL = searchParams?.get('wsURL');
  
  // Debug logging
  console.log('🎥 Video call page loaded with parameters:', {
    hasToken: !!token,
    hasRoomName: !!roomName,
    hasAstrologerName: !!astrologerName,
    hasWsURL: !!wsURL,
    tokenLength: token?.length,
    roomNameLength: roomName?.length,
    fullUrl: typeof window !== 'undefined' ? window.location.href : 'server-side'
  });
  
  const [error, setError] = useState<string | null>(null);
  const [broadcasterStatus, setBroadcasterStatus] = useState<'waiting' | 'joined' | 'not_allowed' | 'access_denied' | 'error'>('waiting');
  
  const socketRef = useRef<any>(null);

  // Wallet balance states
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(true);
  const [isInitializingCall, setIsInitializingCall] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  // Check wallet balance and initialize call
  useEffect(() => {
    console.log('🎥 Video call page useEffect triggered:', { token, roomName });
    if (token && roomName) {
      console.log('✅ Parameters found, fetching wallet data...');
      fetchWalletPageData();
    } else {
      console.error('❌ Missing parameters:', { token: !!token, roomName: !!roomName });
      setError('Missing video call parameters');
      setIsCheckingBalance(false);
    }
  }, [token, roomName]);

  const initializeSocket = async () => {
    try {
      console.log('🔌 Initializing socket connection for video call page...');
      
      // Get user details from localStorage
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails?.id || userDetails?._id;
      
      if (!userId) {
        console.error('❌ No user ID found for socket connection');
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
        console.log('✅ Socket connected for video call page:', socket.id);
        
        // Register with the channel (already done in astrologer profile page, but good to ensure)
        socket.emit('register', {
          userId,
          channelId: roomName
        });

        console.log('✅ Registered with channel:', roomName);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected from video call page');
      });

      socket.on('broadcaster_joined', (data: any) => {
        // Support both {resp: ...} and direct object
        const resp = data?.resp || data;
        console.log('👥 Broadcaster joined:', resp);
        // Handle different response statuses
        if (resp && resp.status) {
          switch (resp.status) {
            case 'NOT_ALLOWED':
              console.error('❌ Broadcaster NOT_ALLOWED:', {
                reason: resp.reason || 'Unknown reason',
                message: resp.message || 'Astrologer is not authorized to join this call',
                data: resp
              });
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
              console.log('✅ Broadcaster successfully joined the call');
              setBroadcasterStatus('joined');
              break;
            default:
              console.warn('⚠️ Unknown broadcaster status:', resp.status);
              setBroadcasterStatus('error');
              break;
          }
        } else {
          // Legacy format - assume success if no status field
          console.log('✅ Broadcaster joined (legacy format)');
          setBroadcasterStatus('joined');
        }
      });

      socket.on('call_end', (data: any) => {
        console.log('📞 Call ended:', data);
        cleanup();
        window.close();
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ Socket connection error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
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
      
      socketRef.current.emit('end_call', {
        channelId: roomName,
        userId,
        reason: 'USER_ENDED_CALL'
      });
    }
    
    cleanup();
    window.close(); // Close the popup window
  };

  const fetchWalletPageData = async () => {
    try {
      setIsCheckingBalance(true);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        return 0;
      }

      let balance = 0;

      // Use production-safe API wrapper
      if (isProduction()) {
        console.log('Using production-safe wallet balance API');
        balance = await productionFetchWalletBalance();
      } else {
        // Development: Use direct API call
        const response = await fetch(
          `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          balance = data.data?.balance || 0;
        } else {
          setError("Failed to check wallet balance");
          return 0;
        }
      }

      setWalletBalance(balance);

      // Check if user has sufficient balance for video call
      const estimatedCost = getEstimatedCallCost();
      
      if (balance < estimatedCost) {
        setShowInsufficientBalanceModal(true);
        return balance;
      }

      // If balance is sufficient, proceed with call initialization
      initializeCall();
      return balance;
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      setError("Failed to check wallet balance");
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
      
    } catch (error) {
      console.error('Error initializing call:', error);
      setError('Failed to initialize call');
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