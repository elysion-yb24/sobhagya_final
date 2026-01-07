"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ConnectionStateToast,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  TrackToggle,
  useTracks,
  useRemoteParticipants
} from '@livekit/components-react';
import { Room, RoomEvent, Track } from 'livekit-client';
import {
  Users,
  Clock,
  X,
  Settings,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Gift,
  ChevronDown,
  Wifi
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socketManager } from "../../utils/socket";
import { getUserDetails, getAuthToken, markUserAsCalled } from "../../utils/auth-utils";
import { buildApiUrl, getApiBaseUrl } from "../../config/api";
import GiftConfirmationDialog from '../ui/GiftConfirmationDialog';

// Import LiveKit styles
import '@livekit/components-styles';

interface AudioCallRoomProps {
  token: string;
  wsURL: string;
  roomName: string;
  participantName: string;
  remoteParticipantName?: string;
  astrologerName?: string;
  partner?: {
    _id: string;
    name: string;
  };
  onDisconnect?: () => void;
}

interface CallStats {
  duration: number;
  isConnected: boolean;
}

// Audio Display Component - Completely redesigned for mobile
function AudioDisplay({ astrologerName, partner }: { astrologerName?: string; partner?: { _id: string; name: string } }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [isConnecting, setIsConnecting] = useState(true);

  // Get the astrologer name from either astrologerName prop or partner object
  const displayName = astrologerName || partner?.name || 'Astrologer';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Check if astrologer has joined
  useEffect(() => {
    const remoteParticipants = participants.filter(p => p.identity !== localParticipant?.identity);
    setIsConnecting(remoteParticipants.length === 0);
  }, [participants, localParticipant]);

  const renderAvatar = () => {
    const astrologerImage = localStorage.getItem(`astrologer_image_${partner?._id}`) || null;

    if (astrologerImage) {
      return (
        <img
          src={astrologerImage}
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }

    if (displayName && displayName !== 'Astrologer') {
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-xl">
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            {avatarInitial}
          </span>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden min-h-screen">
      {/* Enhanced background with better mobile optimization */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20"></div>
      </div>

      <div className="text-center text-white w-full max-w-sm relative z-10 flex-1 flex flex-col justify-center">
        {isConnecting ? (
          // Connecting State - Better mobile design
          <div className="space-y-6">
            <div className="relative">
              {/* Main avatar with improved sizing */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto relative">
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-2xl flex items-center justify-center">
                  {renderAvatar()}
                </div>

                {/* Pulsing connection indicator */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>

                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-2 border-yellow-400/20 animate-ping animation-delay-1000"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Connecting...
              </h2>
              <p className="text-gray-300 text-lg">Waiting for {displayName} to join</p>

              {/* Loading animation */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce animation-delay-400"></div>
              </div>

              {/* Connection tip */}
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Establishing secure connection...
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Connected State - Enhanced design
          <div className="space-y-6">
            <div className="relative">
              {/* Main avatar with success state */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto relative">
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm border-2 border-green-400/50 shadow-2xl flex items-center justify-center">
                  {renderAvatar()}
                </div>

                {/* Success indicator */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Connected!
              </h2>
              <p className="text-gray-300 text-lg">Audio call with {displayName}</p>

              {/* Enhanced call status */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/20 shadow-xl">
                <h3 className="font-bold mb-3 text-white flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Call
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <span className="text-gray-300 font-medium">You</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium text-sm">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <span className="text-gray-300 font-medium truncate">{displayName}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium text-sm">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Control Bar - Better mobile UX
const CustomControlBar = ({ onEndCall, onGift }: { onEndCall: () => void, onGift: () => void }) => {
  const { localParticipant } = useLocalParticipant();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const toggleAudio = useCallback(async () => {
    try {
      if (isAudioEnabled) {
        await localParticipant.setMicrophoneEnabled(false);
      } else {
        await localParticipant.setMicrophoneEnabled(true);
      }
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  }, [localParticipant, isAudioEnabled]);

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-full px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 border border-white/20 shadow-2xl">
        {/* Microphone Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all duration-200 ${isAudioEnabled
              ? 'bg-gray-700/80 hover:bg-gray-600 text-white shadow-lg'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
            }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Gift Button */}
        <button
          onClick={onGift}
          className="p-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transition-all duration-200 shadow-lg shadow-yellow-500/25"
          title="Send Gift"
        >
          <Gift className="w-6 h-6" />
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg shadow-red-500/25"
          title="End call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Enhanced Settings Panel - Better mobile interface
function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose}></div>

      {/* Panel */}
      <div className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-xl text-white rounded-2xl border border-white/20 shadow-2xl w-80 max-w-[calc(100vw-2rem)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Audio Settings</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Microphone</label>
              <TrackToggle
                source={Track.Source.Microphone}
                className="w-full p-3 bg-white/20 rounded-xl hover:bg-white/25 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Audio Output</label>
              <select className="w-full p-3 bg-white/20 rounded-xl text-white border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none">
                <option value="default">Default Speaker</option>
                <option value="headphones">Headphones</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/20">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AudioCallRoom({
  token,
  wsURL,
  roomName,
  participantName,
  astrologerName,
  partner,
  onDisconnect,
}: AudioCallRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [callStats, setCallStats] = useState<CallStats>({ duration: 0, isConnected: false });
  const isDisconnectingRef = useRef(false);
  // Lock body scroll on mount, restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const router = useRouter();

  // Gift state
  const [gifts, setGifts] = useState<any[]>([]);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftNotification, setGiftNotification] = useState<any>(null);
  const [giftRequest, setGiftRequest] = useState<any>(null);
  const [pendingGift, setPendingGift] = useState<any | null>(null);
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState<string | null>(null);

  // Enhanced Call Header Component
  const CallHeader = React.memo(() => {
    const [callDuration, setCallDuration] = useState(0);
    const [participantCount, setParticipantCount] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();

    useEffect(() => {
      setParticipantCount(participants.length);

      // Check if both user and broadcaster are in the room
      const remoteParticipants = participants.filter(p => p.identity !== localParticipant?.identity);
      const hasBroadcaster = remoteParticipants.length > 0;
      const hasUser = localParticipant && localParticipant.identity;

      // Start timer only when both user and broadcaster are present
      if (hasBroadcaster && hasUser && !isTimerRunning) {
        setIsTimerRunning(true);
        console.log('🎵 Timer started - both user and broadcaster joined');
        console.log('🎵 Participants:', {
          user: localParticipant?.identity,
          broadcaster: remoteParticipants.map(p => p.identity),
          total: participants.length
        });
      } else if ((!hasBroadcaster || !hasUser) && isTimerRunning) {
        setIsTimerRunning(false);
        console.log('🎵 Timer stopped - missing participant');
        console.log('🎵 Current participants:', {
          user: localParticipant?.identity,
          broadcaster: remoteParticipants.map(p => p.identity),
          total: participants.length
        });
      }
    }, [participants, localParticipant, isTimerRunning]);

    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;

      if (isTimerRunning) {
        interval = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [isTimerRunning]);

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="fixed top-0 left-0 right-0 z-40 p-2 sm:p-4">
        <div className="flex justify-between items-center">
          {/* Left side - Call info */}
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-4 py-3 text-white border border-white/20 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-sm">
                  {astrologerName ? `${astrologerName}` : 'Audio Call'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className={`w-4 h-4 ${isTimerRunning ? 'text-green-400' : 'text-gray-400'}`} />
                <span className={isTimerRunning ? 'text-white' : 'text-gray-400'}>
                  {formatDuration(callDuration)}
                </span>
                {!isTimerRunning && (
                  <span className="text-xs text-gray-500">(paused)</span>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-300">
                <Users className="w-4 h-4" />
                <span>{participantCount}</span>
              </div>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-black/80 backdrop-blur-xl rounded-2xl p-3 text-white hover:bg-black/90 transition-all border border-white/20 shadow-xl"
              title="Settings"
              disabled={isDisconnectingRef.current}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  });

  const handleRoomConnected = useCallback(() => {
    console.log('🎵 Audio call room connected');
  }, []);

  // Fetch gifts from API
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const token = getAuthToken();
        console.log('🎁 Fetching gifts with token:', token ? 'Token exists' : 'No token');

        if (!token) {
          console.warn('🎁 No auth token available for gift fetch');
          setGifts([]);
          return;
        }

        // Try multiple API endpoints in case one fails
        const apiEndpoints = [
          `${getApiBaseUrl()}/calling/api/gift/get-gifts`,
          `${getApiBaseUrl()}/api/gift/get-gifts`,
          `${getApiBaseUrl()}/gift/get-gifts`
        ];

        let gifts = [];
        let lastError = null;

        for (const endpoint of apiEndpoints) {
          try {
            console.log('🎁 Trying gift API endpoint:', endpoint);

            const res = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
            });

            console.log('🎁 Gift API response status:', res.status);

            if (res.ok) {
              const data = await res.json();
              console.log('🎁 Gifts fetched successfully from:', endpoint, data);
              gifts = data.data || data.gifts || data || [];
              break; // Success, exit the loop
            } else {
              const errorText = await res.text();
              console.warn('🎁 Gift API error response from:', endpoint, errorText);
              lastError = new Error(`Gift API error: ${res.status} ${res.statusText}`);
            }
          } catch (error) {
            console.warn('🎁 Failed to fetch gifts from:', endpoint, error);
            lastError = error;
          }
        }

        if (gifts.length > 0) {
          // Process gifts to ensure proper icon display
          const processedGifts = gifts.map((gift: any) => ({
            ...gift,
            icon: gift.icon || '🎁',
            name: gift.name || 'Gift',
            price: gift.price || 10
          }));
          setGifts(processedGifts);
        } else {
          console.error('🎁 All gift API endpoints failed. Last error:', lastError);
          // Set some default gifts as fallback
          setGifts([
            { _id: '1', name: 'Rose', icon: '🌹', price: 10 },
            { _id: '2', name: 'Heart', icon: '❤️', price: 20 },
            { _id: '3', name: 'Star', icon: '⭐', price: 30 },
            { _id: '4', name: 'Gift', icon: '🎁', price: 50 },
            { _id: '5', name: 'Crown', icon: '👑', price: 100 }
          ]);
        }
      } catch (error) {
        console.error('🎁 Failed to fetch gifts:', error);
        // Set default gifts as fallback
        setGifts([
          { _id: '1', name: 'Rose', icon: '🌹', price: 10 },
          { _id: '2', name: 'Heart', icon: '❤️', price: 20 },
          { _id: '3', name: 'Star', icon: '⭐', price: 30 },
          { _id: '4', name: 'Gift', icon: '🎁', price: 50 },
          { _id: '5', name: 'Crown', icon: '👑', price: 100 }
        ]);
      }
    };

    fetchGifts();
  }, []);

  const handleRoomDisconnected = useCallback(() => {
    console.log('🎵 Audio call room disconnected');
    setRoom(null);

    // Call onDisconnect when room is disconnected
    if (onDisconnect) {
      onDisconnect();
    }
  }, [onDisconnect]);

  const handleError = useCallback((error: Error) => {
    console.error('🎵 Audio call room error:', error);

    // Handle DataChannel errors gracefully (they're usually harmless)
    if (error.message.includes('DataChannel') || error.message.includes('lossy')) {
      console.warn('🎵 DataChannel error (usually harmless):', error.message);
      return; // Don't show alert for DataChannel errors
    }

    // For other errors, show alert
    alert(`Audio call error: ${error.message}`);
  }, []);

  const handleLeaveCall = useCallback(async () => {
    console.log('🎵 Leaving audio call - START');
    console.log('🎵 Current state:', {
      roomName,
      roomState: room?.state,
      socketConnected: socketManager.isSocketConnected(),
      shouldConnect,
      isDisconnecting: isDisconnectingRef.current
    });

    // Prevent multiple calls to handleLeaveCall
    if (isDisconnectingRef.current) {
      console.log('🎵 Already disconnecting, ignoring duplicate call');
      return;
    }
    isDisconnectingRef.current = true;

    // Set shouldConnect to false immediately to prevent reconnection
    setShouldConnect(false);
    console.log('🎵 Set shouldConnect to false');

    try {
      // Step 1: Emit end_call event via socket if available
      if (roomName && roomName.trim() !== '') {
        try {
          console.log('🎵 Step 1: Emitting end_call event for room:', roomName);

          // Check if socket is connected before trying to emit
          if (socketManager.isSocketConnected()) {
            console.log('🎵 Socket is connected, using endCall method');
            await socketManager.endCall(roomName, 'USER_ENDED_CALL');
            console.log('🎵 endCall method completed successfully');
          } else {
            console.log('🎵 Socket not connected, using emitCallEnd method');
            socketManager.emitCallEnd(roomName, 'USER_ENDED_CALL');
            console.log('🎵 emitCallEnd method completed');
          }
          console.log('🎵 End call event emitted successfully');
        } catch (error: any) {
          console.error('❌ Error ending call via socket:', error);
          console.error('❌ Error details:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            roomName,
            socketConnected: socketManager.isSocketConnected()
          });

          // Fallback to emitCallEnd if endCall fails
          try {
            console.log('🎵 Trying fallback emitCallEnd...');
            socketManager.emitCallEnd(roomName, 'USER_ENDED_CALL');
            console.log('🎵 Fallback emitCallEnd completed');
          } catch (fallbackError: any) {
            console.warn('🎵 Fallback emitCallEnd also failed:', fallbackError);
            console.warn('🎵 Fallback error details:', {
              message: fallbackError?.message || 'Unknown fallback error',
              stack: fallbackError?.stack || 'No stack trace'
            });
          }
        }
      } else {
        console.warn('🎵 No roomName available for end call event');
      }

      // Step 2: Add a small delay to ensure socket events are sent
      console.log('🎵 Step 2: Waiting for socket events to be sent...');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Step 3: Force disconnect socket manager
      try {
        console.log('🎵 Step 3: Disconnecting socket manager...');
        socketManager.disconnect();
        console.log('🎵 Socket manager disconnected successfully');
      } catch (socketError: any) {
        console.warn('🎵 Socket manager disconnect error:', socketError);
        console.warn('🎵 Socket error details:', {
          message: socketError?.message || 'Unknown socket error',
          stack: socketError?.stack || 'No stack trace'
        });
      }

      // Step 4: Disconnect from LiveKit room with error handling
      if (room) {
        try {
          console.log('🎵 Step 4: Disconnecting LiveKit room...');
          console.log('🎵 Room state before disconnect:', room.state);

          // Use a more graceful disconnect approach
          if (room.state === 'connected') {
            console.log('🎵 Room is connected, performing graceful disconnect...');
            await room.disconnect();
            console.log('🎵 Room graceful disconnect completed');
          } else {
            console.log('🎵 Room is not connected, cleaning up listeners...');
            // If room is not connected, just clean up
            room.removeAllListeners();
            console.log('🎵 Room listeners cleaned up');
          }
          console.log('🎵 Room disconnected successfully');
        } catch (roomError: any) {
          console.warn('🎵 Room disconnect error:', roomError);
          console.warn('🎵 Room error details:', {
            message: roomError?.message || 'Unknown room error',
            stack: roomError?.stack || 'No stack trace',
            roomState: room.state
          });

          // Even if disconnect fails, clean up listeners
          try {
            console.log('🎵 Cleaning up room listeners after error...');
            room.removeAllListeners();
            console.log('🎵 Room listeners cleaned up after error');
          } catch (listenerError: any) {
            console.warn('🎵 Error removing room listeners:', listenerError);
          }
        }
      } else {
        console.log('🎵 No room instance to disconnect');
      }

      // Step 5: Force cleanup by setting room to null
      console.log('🎵 Step 5: Setting room to null...');
      setRoom(null);
      console.log('🎵 Room state set to null');

      // Mark user as having called (hide offer after first call)
      try {
        markUserAsCalled();
        console.log('🎵 User marked as having called');
      } catch (markError) {
        console.warn('🎵 Error marking user as called:', markError);
      }

      // Step 6: Add a small delay before calling onDisconnect to ensure cleanup is complete
      console.log('🎵 Step 6: Waiting before calling onDisconnect...');
      setTimeout(() => {
        // Finally call the onDisconnect callback
        if (onDisconnect) {
          console.log('🎵 Calling onDisconnect callback');
          try {
            onDisconnect();
            console.log('🎵 onDisconnect callback completed successfully');
          } catch (callbackError: any) {
            console.error('❌ Error in onDisconnect callback:', callbackError);
            console.error('❌ Callback error details:', {
              message: callbackError?.message || 'Unknown callback error',
              stack: callbackError?.stack || 'No stack trace'
            });
          }
        } else {
          console.log('🎵 No onDisconnect callback provided');
        }
      }, 500); // Increased delay to ensure all cleanup is complete

    } catch (error: any) {
      console.error('❌ Error during call disconnect:', error);
      console.error('❌ Main error details:', {
        message: error?.message || 'Unknown main error',
        stack: error?.stack || 'No stack trace',
        roomName,
        roomState: room?.state,
        socketConnected: socketManager.isSocketConnected()
      });

      // Force cleanup even on error
      try {
        console.log('🎵 Force disconnecting socket manager due to error...');
        socketManager.disconnect();
      } catch (socketError) {
        console.warn('🎵 Force socket disconnect error:', socketError);
      }

      setRoom(null);
      setShouldConnect(false);

      // Still call onDisconnect even if there's an error
      if (onDisconnect) {
        try {
          console.log('🎵 Calling onDisconnect callback after error...');
          onDisconnect();
        } catch (callbackError) {
          console.error('❌ Error in onDisconnect callback (error path):', callbackError);
        }
      }
    }
  }, [room, onDisconnect, roomName]);

  const handleGift = useCallback(() => {
    setShowGiftPanel(true);
  }, []);

  // Function to handle gift requests from astrologer
  const handleGiftRequestFromAstrologer = useCallback((data: any) => {
    console.log('🎁 Processing gift request from astrologer:', data);

    // Show gift request notification
    setGiftRequest({
      from: data.astrologerId || data.from || partner?._id,
      fromName: data.astrologerName || data.fromName || astrologerName || partner?.name || 'Astrologer',
      message: data.message || 'Would love to receive a gift from you!',
      giftType: data.giftType || 'any',
      timestamp: Date.now()
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setGiftRequest((prev: any) => {
        if (prev && prev.timestamp === data.timestamp) {
          return null;
        }
        return prev;
      });
    }, 10000);
  }, [astrologerName, partner]);

  // Send gift handler
  const handleSendGift = async (gift: any) => {
    setSendingGift(true);
    try {
      console.log('🎁 Sending gift:', gift);

      // Ensure socket is connected before sending gift
      if (!socketManager.isSocketConnected() || socketManager.getChannelId() !== roomName) {
        console.log('🎁 Connecting socket for gift sending...');
        await socketManager.connect(roomName);
      }

      const user = getUserDetails();
      await socketManager.sendGift({
        channelId: roomName,
        giftId: gift._id,
        from: user?.id || user?._id || '',
        fromName: user?.name || 'User',
        to: partner?._id || '',
        giftName: gift.name,
        giftIcon: gift.icon,
        toName: partner?.name || 'Astrologer'
      });

      // Don't close the gift panel automatically - let user choose when to close
      setShowGiftConfirm(false);
      setPendingGift(null);

      // Show success message in the panel
      setGiftSuccessMessage(`Gift "${gift.name}" sent successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setGiftSuccessMessage(null);
      }, 3000);

    } catch (err) {
      console.error("Gift send error:", err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to send gift';
      alert("Failed to send gift: " + errorMsg);
    } finally {
      setSendingGift(false);
    }
  };

  // Listen for call end events and partner disconnection from server
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (socket) {
      const handleCallEnd = (data: any) => {
        console.log('🎵 Call ended by server:', data);
        handleLeaveCall();
      };

      const handlePartnerDisconnect = (data: any) => {
        console.log('🎵 Partner disconnected:', data);
        // Show notification to user
        alert('Astrologer has disconnected from the call.');
        handleLeaveCall();
      };

      const handlePartnerLeft = (data: any) => {
        console.log('🎵 Partner left the call:', data);
        alert('Astrologer has left the call.');
        handleLeaveCall();
      };

      const handleCallTerminated = (data: any) => {
        console.log('🎵 Call terminated:', data);
        alert('Call has been terminated.');
        handleLeaveCall();
      };

      // Listen for various call end and partner disconnection events
      socket.on('end_call', handleCallEnd);
      socket.on('call_end', handleCallEnd);
      socket.on('partner_disconnect', handlePartnerDisconnect);
      socket.on('partner_left', handlePartnerLeft);
      socket.on('call_terminated', handleCallTerminated);
      socket.on('broadcaster_disconnect', handlePartnerDisconnect);
      socket.on('broadcaster_left', handlePartnerLeft);

      return () => {
        socket.off('end_call', handleCallEnd);
        socket.off('call_end', handleCallEnd);
        socket.off('partner_disconnect', handlePartnerDisconnect);
        socket.off('partner_left', handlePartnerLeft);
        socket.off('call_terminated', handleCallTerminated);
        socket.off('broadcaster_disconnect', handlePartnerDisconnect);
        socket.off('broadcaster_left', handlePartnerLeft);
      };
    }
  }, [handleLeaveCall]);

  // Listen for gift events and socket connections
  useEffect(() => {
    // Handle receiving gifts
    function handleReceiveGift(data: any) {
      console.log('🎁 Gift received:', data);
      setGiftNotification(data);
      setTimeout(() => setGiftNotification(null), 4000);
    }
    socketManager.onReceiveGift(handleReceiveGift);

    // Listen for gift requests from astrologer
    function handleGiftRequest(data: any) {
      console.log('🎁 Gift request received:', data);
      setGiftRequest(data);
      // Auto-hide gift request after 10 seconds
      setTimeout(() => setGiftRequest(null), 10000);
    }
    socketManager.onGiftRequest(handleGiftRequest);

    // Listen for socket connection status
    function handleSocketConnect() {
      console.log('🎵 Socket connected for gift events');
    }

    function handleSocketDisconnect() {
      console.log('🎵 Socket disconnected from gift events');
    }

    // Set up socket event listeners
    const socket = socketManager.getSocket();
    if (socket) {
      socket.on('connect', handleSocketConnect);
      socket.on('disconnect', handleSocketDisconnect);
      socket.on('gift_request', handleGiftRequest);
      socket.on('receive_gift', handleReceiveGift);

      // Listen for custom gift request events
      socket.on('astrologer_gift_request', handleGiftRequestFromAstrologer);

      // Listen for gift request notifications
      socket.on('gift_request_notification', handleGiftRequestFromAstrologer);
    }

    return () => {
      if (socket) {
        socket.off('connect', handleSocketConnect);
        socket.off('disconnect', handleSocketDisconnect);
        socket.off('gift_request', handleGiftRequest);
        socket.off('receive_gift', handleReceiveGift);
        socket.off('astrologer_gift_request');
        socket.off('gift_request_notification');
      }
    };
  }, [astrologerName]);

  // Ensure socket is connected for gifts
  useEffect(() => {
    let didCancel = false;
    (async () => {
      try {
        if (!roomName) return;
        // Only connect if not already connected to this channel
        if (!socketManager.isSocketConnected() || socketManager.getChannelId() !== roomName) {
          await socketManager.connect(roomName);
        }
      } catch (err) {
        if (!didCancel) {
          console.error('Failed to connect socket for gifts:', err);
        }
      }
    })();
    return () => { didCancel = true; };
  }, [roomName]);

  // Force disconnect when shouldConnect becomes false
  useEffect(() => {
    if (!shouldConnect && room) {
      console.log('🎵 shouldConnect is false, forcing room disconnect...');
      const forceDisconnect = async () => {
        try {
          await room.disconnect();
          console.log('🎵 Room force disconnected');
        } catch (error) {
          console.warn('🎵 Force room disconnect error:', error);
        }
        setRoom(null);
      };
      forceDisconnect();
    }
  }, [shouldConnect, room]);

  // Cleanup on unmount and page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🎵 AudioCallRoom: Page unloading, forcing cleanup...');

      // Force disconnect socket manager
      try {
        socketManager.disconnect();
      } catch (error) {
        console.warn('🎵 Force socket disconnect on page unload error:', error);
      }

      // Force disconnect room
      if (room) {
        try {
          room.disconnect();
        } catch (error) {
          console.warn('🎵 Force room disconnect on page unload error:', error);
        }
      }
    };

    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('🎵 AudioCallRoom: Component unmounting, forcing cleanup...');

      // Remove beforeunload event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Force disconnect socket manager
      try {
        socketManager.disconnect();
      } catch (error) {
        console.warn('🎵 Force socket disconnect on unmount error:', error);
      }

      // Force disconnect room
      if (room) {
        try {
          room.disconnect();
        } catch (error) {
          console.warn('🎵 Force room disconnect on unmount error:', error);
        }
      }

      setRoom(null);
    };
  }, [room]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 z-50 overflow-hidden">
      {shouldConnect ? (
        <LiveKitRoom
          video={false}
          audio={true}
          token={token}
          serverUrl={wsURL}

          style={{ height: '100vh', width: '100vw', position: 'relative' }}
          onConnected={handleRoomConnected}
          onDisconnected={handleRoomDisconnected}
          onError={handleError}
          connect={true}
          key={`${roomName}-${shouldConnect}`}
          options={{
            adaptiveStream: true,
            dynacast: true,
            // Audio settings
            audioCaptureDefaults: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }}
        >
          {/* Enhanced Call Header */}
          <CallHeader />

          {/* Enhanced Audio Display */}
          <AudioDisplay astrologerName={astrologerName} partner={partner} />

          {/* Enhanced Control Bar */}
          <CustomControlBar onEndCall={handleLeaveCall} onGift={handleGift} />

          {/* Audio Renderer */}
          <RoomAudioRenderer />

          {/* Connection Status Toast */}
          <ConnectionStateToast />

          {/* Enhanced Settings Panel */}
          <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

          {/* Enhanced Gift Panel - Fixed Layout */}
          {showGiftPanel && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                {/* Gift Panel */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-md mx-auto shadow-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Send a Gift</h3>
                    <button
                      onClick={() => setShowGiftPanel(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Success Message */}
                  {giftSuccessMessage && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-xl text-green-700 text-sm text-center">
                      {giftSuccessMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {gifts.map(gift => (
                      <button
                        key={gift._id}
                        onClick={() => {
                          setPendingGift(gift);
                          setShowGiftConfirm(true);
                        }}
                        disabled={sendingGift}
                        className="flex flex-col items-center p-3 sm:p-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
                      >
                        {/* Handle both emoji and image URLs */}
                        {gift.icon && typeof gift.icon === 'string' && gift.icon.startsWith('http') ? (
                          <img
                            src={gift.icon}
                            alt={gift.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2 object-contain"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-2xl sm:text-3xl mb-1 sm:mb-2 ${gift.icon && typeof gift.icon === 'string' && gift.icon.startsWith('http') ? 'hidden' : ''}`}>
                          {typeof gift.icon === 'string' ? gift.icon : '🎁'}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">{gift.name}</span>
                        <span className="text-xs text-gray-500 mt-1">₹{gift.price}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowGiftPanel(false)}
                    className="w-full py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl sm:rounded-2xl text-gray-700 font-medium transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Enhanced Gift Notification */}
          {giftNotification && (
            <div className="fixed top-20 right-4 z-60">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{giftNotification.giftIcon}</div>
                  <div>
                    <p className="font-semibold">Gift Received!</p>
                    <p className="text-sm opacity-90">
                      {giftNotification.fromName} sent {giftNotification.giftName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Gift Request Notification */}
          {giftRequest && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-60 max-w-sm mx-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🎁</div>
                    <p className="font-bold text-lg">
                      Gift Request!
                    </p>
                    <p className="text-sm opacity-90">
                      {astrologerName || 'Astrologer'} would love to receive a gift
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowGiftPanel(true);
                        setGiftRequest(null);
                      }}
                      className="flex-1 bg-white text-orange-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Send Gift
                    </button>
                    <button
                      onClick={() => setGiftRequest(null)}
                      className="flex-1 bg-orange-600/20 text-white py-3 rounded-xl font-semibold hover:bg-orange-600/30 transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gift Confirmation Dialog */}
          {showGiftConfirm && pendingGift && (
            <GiftConfirmationDialog
              isOpen={showGiftConfirm}
              onClose={() => setShowGiftConfirm(false)}
              onConfirm={async () => {
                setShowGiftConfirm(false);
                await handleSendGift(pendingGift);
              }}
              giftName={pendingGift.name}
              giftIcon={pendingGift.icon}
              isLoading={sendingGift}
              giftPrice={pendingGift.price}
            />
          )}
        </LiveKitRoom>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneOff className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
            <p className="text-lg text-gray-300">Disconnecting from audio room...</p>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}