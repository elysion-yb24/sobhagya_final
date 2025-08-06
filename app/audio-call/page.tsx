"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { getApiBaseUrl } from '../config/api';
import AudioCallRoom from '../components/audio/AudioCallRoom';
import InsufficientBalanceModal from '../components/ui/InsufficientBalanceModal';
import ConnectingCallModal from '../components/ui/ConnectingCallModal';

export default function AudioCallPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const roomName = searchParams?.get('room');
  const astrologerName = searchParams?.get('astrologer');
  const astrologerId = searchParams?.get('astrologerId') || localStorage.getItem('lastAstrologerId');
  const wsURL = searchParams?.get('wsURL');

  const [isCheckingBalance, setIsCheckingBalance] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [broadcasterStatus, setBroadcasterStatus] = useState<'waiting' | 'joined' | 'not_allowed' | 'error'>('waiting');
  const socketRef = useRef<any>(null);

  // Connecting state
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectingCallType, setConnectingCallType] = useState<'audio'>('audio');

  // Check wallet balance and initialize call
  useEffect(() => {
    console.log('🎵 Audio call page useEffect triggered:', { token, roomName });
    if (token && roomName) {
      console.log('✅ Parameters found, fetching wallet data...');
      fetchWalletPageData();
    } else {
      console.error('❌ Missing parameters:', { token: !!token, roomName: !!roomName });
      const missingParams = [];
      if (!token) missingParams.push('token');
      if (!roomName) missingParams.push('room');
      setError(`Missing audio call parameters: ${missingParams.join(', ')}`);
      setIsCheckingBalance(false);
      setIsConnecting(false);
    }
  }, [token, roomName]);

  const initializeSocket = async () => {
    try {
      console.log('🔌 Initializing socket connection for audio call page...');
      
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
        console.log('✅ Socket connected for audio call page:', socket.id);
        
        // Register with the channel
        socket.emit('register', {
          userId,
          channelId: roomName
        });

        console.log('✅ Registered with channel:', roomName);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected from audio call page');
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
              let errorMessage = 'Astrologer is not available for audio calls right now';
              if (resp.reason === 'INSUFFICIENT_BALANCE') {
                errorMessage = 'Astrologer has insufficient balance to join the call';
              } else if (resp.reason === 'ALREADY_IN_CALL') {
                errorMessage = 'Astrologer is currently in another call';
              } else if (resp.reason === 'OFFLINE') {
                errorMessage = 'Astrologer is currently offline';
              } else if (resp.reason === 'AUDIO_NOT_ALLOWED') {
                errorMessage = 'Audio calls are not enabled for this astrologer';
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

      socket.on('end_call', (data: any) => {
        console.log('📞 Call ended:', data);
        cleanup();
        handleDisconnect();
      });

      // Also listen for call_end events from server (for backward compatibility)
      socket.on('call_end', (data: any) => {
        console.log('📞 Call ended (server event):', data);
        cleanup();
        handleDisconnect();
      });

      // Listen for partner disconnection events
      socket.on('partner_disconnect', (data: any) => {
        console.log('📞 Partner disconnected:', data);
        alert('Astrologer has disconnected from the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('partner_left', (data: any) => {
        console.log('📞 Partner left:', data);
        alert('Astrologer has left the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('call_terminated', (data: any) => {
        console.log('📞 Call terminated:', data);
        alert('Call has been terminated.');
        cleanup();
        handleDisconnect();
      });

      socket.on('broadcaster_disconnect', (data: any) => {
        console.log('📞 Broadcaster disconnected:', data);
        alert('Astrologer has disconnected from the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('broadcaster_left', (data: any) => {
        console.log('📞 Broadcaster left:', data);
        alert('Astrologer has left the call.');
        cleanup();
        handleDisconnect();
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ Socket connection error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
    }
  };

  const cleanup = () => {
    console.log('🎵 Audio call page: cleanup called');
    if (socketRef.current) {
      try {
        console.log('🎵 Disconnecting socket...');
        socketRef.current.disconnect();
        
        // Force close the socket connection
        if (socketRef.current.connected) {
          socketRef.current.close();
        }
        
        socketRef.current = null;
        console.log('🎵 Socket disconnected successfully');
      } catch (error) {
        console.warn('🎵 Error during socket cleanup:', error);
        socketRef.current = null;
      }
    } else {
      console.log('🎵 No socket to cleanup');
    }
  };

  const handleDisconnect = () => {
    console.log('🎵 Audio call page: handleDisconnect called');
    
    // Emit end call event via socket
    if (socketRef.current && roomName) {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails?.id || userDetails?._id;
      
      console.log('🎵 Emitting end_call event:', { channelId: roomName, userId, reason: 'USER_ENDED_CALL' });
      
      try {
        socketRef.current.emit('end_call', {
          channelId: roomName,
          userId,
          reason: 'USER_ENDED_CALL'
        });
      } catch (error) {
        console.warn('🎵 Failed to emit end_call event:', error);
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
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setIsCheckingBalance(false);
        setIsConnecting(false);
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
        setIsCheckingBalance(false);
        
        // Initialize socket after wallet check
        initializeSocket();
        
        // Hide connecting overlay when socket is initialized
        setIsConnecting(false);
        
        return balance;
      } else {
        setError('Failed to fetch wallet balance');
        setIsCheckingBalance(false);
        setIsConnecting(false);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet balance');
      setIsCheckingBalance(false);
      setIsConnecting(false);
      return 0;
    }
  };

  const getEstimatedCallCost = () => {
    // Estimate cost based on astrologer's RPM (default 15)
    const estimatedRpm = 15;
    const estimatedMinutes = 2; // Minimum 2 minutes
    return estimatedRpm * estimatedMinutes;
  };

  const getAstrologerName = () => {
    return astrologerName ? decodeURIComponent(astrologerName) : 'Astrologer';
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to Audio Call</h2>
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

  if (!token || !roomName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Call</h2>
          <p className="text-gray-600 mb-6">Missing audio call parameters</p>
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

      <AudioCallRoom
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