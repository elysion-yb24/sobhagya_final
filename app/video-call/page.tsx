"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VideoCallRoom from '../components/video/VideoCallRoom';
import { generateRoomName, generateParticipantIdentity } from '../config/livekit';
import { getAuthToken, getUserDetails } from '../utils/auth-utils';
import { Loader2, AlertCircle, Phone } from 'lucide-react';
import { socketManager } from '../utils/socket';

interface TokenData {
  token: string;
  wsURL: string;
  roomName: string;
  participantIdentity: string;
}

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  const astrologerId = searchParams?.get('astrologerId') || null;
  const astrologerName = searchParams?.get('astrologerName') || null;
  const callType = searchParams?.get('callType') || 'video';
  const channelId = searchParams?.get('channelId') || null;
  const urlToken = searchParams?.get('token') || null;
  const livekitSocketURL = searchParams?.get('livekitSocketURL') || null;

  useEffect(() => {
    const initializeCall = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const token = getAuthToken();
        const userDetails = getUserDetails();

        if (!token || !userDetails?.id) {
          throw new Error('Authentication required. Please log in.');
        }

        if (!astrologerId) {
          throw new Error('Astrologer ID is required.');
        }

        // Check if we have token from URL or sessionStorage
        let callData = null;
        
        if (urlToken && livekitSocketURL && channelId) {
          // Use data from URL
          callData = {
            token: urlToken,
            livekitSocketURL: livekitSocketURL,
            channel: channelId,
          };
        } else if (typeof window !== 'undefined') {
          // Try to get data from sessionStorage
          const storedData = sessionStorage.getItem('videoCallData');
          if (storedData) {
            try {
              callData = JSON.parse(storedData);
            } catch (parseError) {
              console.warn('Failed to parse stored call data:', parseError);
              // Continue without stored data
            }
          }
        }

        if (!callData || !callData.token) {
          throw new Error('Call data not found. Please initiate the call from the astrologer profile page.');
        }

        console.log('Using call data:', {
          hasToken: !!callData.token,
          channelId: callData.channel || channelId,
          astrologerId,
          astrologerName,
        });

        const roomName = callData.channel || channelId || `channel_${astrologerId}_${userDetails.id}`;
        
        // Initialize socket connection for call management (optional)
        console.log('Setting up LiveKit video call...');
        
        try {
          // Connect to socket for call management (optional, will fallback if fails)
          await socketManager.connect(roomName);
          console.log('Socket connected for call management');
          
          // Initiate call through socket to trigger notifications (optional)
          await socketManager.initiateVideoCall(roomName, astrologerId);
          console.log('Call initiated through socket');
        } catch (socketError) {
          console.warn('Socket connection failed, continuing with LiveKit only:', socketError);
          // Continue without socket - LiveKit will still work
        }
        
        // Validate LiveKit connection URL
        const wsURL = callData.livekitSocketURL || 'wss://sobhagya-iothxaak.livekit.cloud';
        
        setTokenData({
          token: callData.token,
          wsURL: wsURL,
          roomName: roomName,
          participantIdentity: userDetails.id,
        });

        console.log('Video call initialized successfully');

      } catch (err) {
        console.error('Error initializing video call:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize video call';
        setError(errorMessage);
        
        // If it's an authentication error, redirect to login
        if (errorMessage.includes('Authentication required')) {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [astrologerId, astrologerName, callType, channelId, urlToken, livekitSocketURL, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // End call and disconnect socket when component unmounts
      if (channelId && socketManager.isSocketConnected()) {
        socketManager.endCall(channelId, 'PAGE_CLOSED').catch(console.error);
        socketManager.disconnect();
      }
      
      // Clean up any stored call data when component unmounts
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('videoCallData');
      }
    };
  }, [channelId]);

  const handleDisconnect = useCallback(() => {
    console.log('Video call disconnected, navigating back to astrologers page');
    // Clear any stored call data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('videoCallData');
    }
    // Navigate to astrologers page
    router.push('/astrologers');
  }, [router]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-initialization
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xl font-semibold">Connecting to video call...</span>
          </div>
          
          <p className="text-gray-300 text-sm">
            {astrologerName ? `Preparing call with ${astrologerName}` : 'Setting up your video call'}
          </p>
          
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Connection Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => router.push('/astrologers')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <p>Preparing video call...</p>
        </div>
      </div>
    );
  }

  return (
    <VideoCallRoom
      token={tokenData.token}
      wsURL={tokenData.wsURL}
      roomName={tokenData.roomName}
      participantName={`User ${tokenData.participantIdentity}`}
      astrologerName={astrologerName || undefined}
      onDisconnect={handleDisconnect}
    />
  );
} 