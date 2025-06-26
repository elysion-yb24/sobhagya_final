"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VideoCallRoom from '../components/video/VideoCallRoom';
import { generateRoomName, generateParticipantIdentity } from '../config/livekit';
import { getAuthToken, getUserDetails } from '../utils/auth-utils';
import { Loader2, AlertCircle, Phone, Video, UserCheck } from 'lucide-react';

interface TokenData {
  token: string;
  wsURL: string;
  roomName: string;
  participantIdentity: string;
}

export default function AstrologerVideoCallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  // Get parameters from URL
  const userId = searchParams?.get('userId') ?? null;
  const userName = searchParams?.get('userName') ?? null;
  const roomName = searchParams?.get('roomName') ?? null;
  const callType = searchParams?.get('callType') ?? 'video';

  useEffect(() => {
    const initializeCall = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const token = getAuthToken();
        const astrologerDetails = getUserDetails();

        if (!token || !astrologerDetails?.id) {
          throw new Error('Authentication required. Please log in.');
        }

        if (!userId || !roomName) {
          throw new Error('Invalid call parameters. User ID and room name are required.');
        }

        // Generate participant details for astrologer
        const participantIdentity = generateParticipantIdentity(astrologerDetails.id, 'astrologer');
        const participantName = astrologerDetails.name || 'Astrologer';

        console.log('Initializing astrologer video call:', {
          roomName,
          participantIdentity,
          participantName,
          userId,
          userName,
        });

        // Get LiveKit token from our API
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomName,
            participantName,
            participantIdentity,
            metadata: JSON.stringify({
              role: 'astrologer',
              astrologerId: astrologerDetails.id,
              userId: userId,
              callType,
            }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get access token');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate token');
        }

        setTokenData({
          token: data.token,
          wsURL: data.wsURL,
          roomName: data.roomName,
          participantIdentity: data.participantIdentity,
        });

      } catch (err) {
        console.error('Error initializing astrologer video call:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize video call');
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [userId, userName, roomName, callType]);

  const handleAcceptCall = () => {
    setCallAccepted(true);
  };

  const handleRejectCall = () => {
    console.log('Call rejected by astrologer');
    router.push('/astrologer-dashboard');
  };

  const handleDisconnect = () => {
    console.log('Astrologer video call disconnected');
    router.push('/astrologer-dashboard');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Video className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xl font-semibold">Preparing video call...</span>
          </div>
          
          <p className="text-gray-300 text-sm">
            {userName ? `Setting up call with ${userName}` : 'Initializing video consultation'}
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
              onClick={() => router.push('/astrologer-dashboard')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!callAccepted && tokenData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Phone className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Incoming Video Call</h2>
          <p className="text-gray-300 mb-2">
            {userName ? `${userName} is requesting a video consultation` : 'User requesting video consultation'}
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Room: {roomName}
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAcceptCall}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              Accept Call
            </button>
            
            <button
              onClick={handleRejectCall}
              className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Decline
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
      participantName={getUserDetails()?.name || 'Astrologer'}
      astrologerName={userName || undefined}
      onDisconnect={handleDisconnect}
    />
  );
} 