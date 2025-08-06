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
  VolumeX
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socketManager } from "../../utils/socket";
import { getUserDetails, getAuthToken } from "../../utils/auth-utils";
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

// Audio Display Component

// Audio Display Component
function AudioDisplay({ astrologerName, partner }: { astrologerName?: string; partner?: { _id: string; name: string } }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [isConnecting, setIsConnecting] = useState(true);

  // Get the astrologer name from either astrologerName prop or partner object
  const displayName = astrologerName || partner?.name || 'Astrologer';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Debug logging
  console.log('🎵 AudioDisplay props:', { astrologerName, partner, displayName, avatarInitial });

  // Add a fallback avatar with a default icon
  const renderAvatar = () => {
    console.log('🎵 Rendering avatar for:', displayName, 'initial:', avatarInitial);
    
    // Try to get astrologer image from localStorage or use a default
    const astrologerImage = localStorage.getItem(`astrologer_image_${partner?._id}`) || null;
    
    if (astrologerImage) {
      return (
        <img 
          src={astrologerImage} 
          alt={displayName}
          className="w-full h-full rounded-full object-cover border-2 sm:border-4 border-white/20"
          onError={(e) => {
            // If image fails to load, fall back to initial
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    // Fallback to initial with better styling
    if (displayName && displayName !== 'Astrologer') {
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center border-2 sm:border-4 border-white/20 shadow-2xl">
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            {avatarInitial}
          </span>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 sm:border-4 border-white/20 shadow-2xl">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
      );
    }
  };

  // Check if astrologer has joined
  useEffect(() => {
    const remoteParticipants = participants.filter(p => p.identity !== localParticipant?.identity);
    setIsConnecting(remoteParticipants.length === 0);
  }, [participants, localParticipant]);

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background elements - reduced for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-20 left-20 sm:top-40 sm:left-40 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        {/* Additional background elements to fill the bottom area */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>
      
      <div className="text-center text-white w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative z-10 px-2 sm:px-0">
        {isConnecting ? (
          // Connecting State
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 border border-white/30 backdrop-blur-sm shadow-2xl">
                {renderAvatar()}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 md:-top-4 md:-right-4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Connecting...
              </h2>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl">Waiting for {displayName} to join</p>
              
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        ) : (
          // Connected State
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 border border-green-400/50 backdrop-blur-sm shadow-2xl">
                {renderAvatar()}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 md:-top-4 md:-right-4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Connected!
              </h2>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl">Audio call with {displayName}</p>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 backdrop-blur-md border border-white/20 shadow-xl">
                <h3 className="font-bold mb-3 sm:mb-4 md:mb-6 text-base sm:text-lg md:text-xl text-white">Call Status</h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 font-medium text-xs sm:text-sm md:text-base">You</span>
                    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
                      <span className="text-xs sm:text-sm text-green-400 font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 font-medium text-xs sm:text-sm md:text-base truncate max-w-20 sm:max-w-none">{displayName}</span>
                    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
                      <span className="text-xs sm:text-sm text-green-400 font-medium">Connected</span>
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

// Custom Control Bar - Matching Video Call Room Design
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
    <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center gap-1 sm:gap-2 md:gap-4 z-[60]">
      <button
        onClick={toggleAudio}
        className={`p-2 sm:p-3 rounded-full transition-all ${
          isAudioEnabled 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      <button
        onClick={onGift}
        className="p-2 sm:p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white transition-all"
        title="Send Gift"
      >
        <span className="text-sm sm:text-base">🎁</span>
      </button>

      <button
        onClick={onEndCall}
        className="p-2 sm:p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
        title="End call"
      >
        <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

// Settings Panel Component
function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { localParticipant } = useLocalParticipant();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
      >
        <Settings size={20} className="text-white" />
      </button>
    );
  }

  return (
    <div className="absolute top-0 right-0 z-50 bg-black bg-opacity-90 text-white p-6 rounded-bl-lg min-w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Audio Settings</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Microphone</label>
          <TrackToggle
            source={Track.Source.Microphone}
            className="w-full p-2 bg-white bg-opacity-20 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Audio Output</label>
          <select className="w-full p-2 bg-white bg-opacity-20 rounded text-white">
            <option value="default">Default Speaker</option>
            <option value="headphones">Headphones</option>
          </select>
        </div>
      </div>
    </div>
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
  const router = useRouter();

  // Gift state
  const [gifts, setGifts] = useState<any[]>([]);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftNotification, setGiftNotification] = useState<any>(null);
  const [giftRequest, setGiftRequest] = useState<any>(null);
  const [pendingGift, setPendingGift] = useState<any | null>(null);
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);

  // Call Header Component - Matching Video Call Room Design
  const CallHeader = React.memo(() => {
    const [callDuration, setCallDuration] = useState(0);
    const [participantCount, setParticipantCount] = useState(0);
    const participants = useParticipants();

    useEffect(() => {
      setParticipantCount(participants.length);
    }, [participants]);

    useEffect(() => {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="absolute top-1 sm:top-2 md:top-4 left-1 sm:left-2 md:left-4 right-1 sm:right-2 md:right-4 flex justify-between items-center z-[60] pointer-events-none">
        <div className="bg-black bg-opacity-70 rounded-lg px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-white pointer-events-auto">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium truncate max-w-20 sm:max-w-none">
                {astrologerName ? `Call with ${astrologerName}` : 'Audio Call'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{formatDuration(callDuration)}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{participantCount} participants</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2 pointer-events-auto">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black bg-opacity-70 rounded-lg p-1.5 sm:p-2 text-white hover:bg-opacity-90 transition-all"
            title="Settings"
            disabled={isDisconnectingRef.current}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={handleLeaveCall}
            className="bg-red-500 bg-opacity-80 rounded-lg p-1.5 sm:p-2 text-white hover:bg-opacity-100 transition-all disabled:opacity-50"
            title="Leave call"
            disabled={isDisconnectingRef.current}
          >
            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
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
          setGifts(gifts);
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
      // First emit end_call event via socket if available
      if (roomName) {
        try {
          console.log('🎵 Emitting end_call event...');
          // Check if socket is connected before trying to emit
          if (socketManager.isSocketConnected()) {
            await socketManager.endCall(roomName, 'USER_ENDED_CALL');
          } else {
            // If socket is not connected, just emit the event directly
            socketManager.emitCallEnd(roomName, 'USER_ENDED_CALL');
          }
          console.log('🎵 End call event emitted successfully');
        } catch (error) {
          console.error('❌ Error ending call via socket:', error);
          // Fallback to emitCallEnd if endCall fails
          try {
            socketManager.emitCallEnd(roomName, 'USER_ENDED_CALL');
          } catch (fallbackError) {
            console.warn('🎵 Fallback emitCallEnd also failed:', fallbackError);
          }
        }
      }
      
      // Add a small delay to ensure socket events are sent
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force disconnect socket manager
      try {
        console.log('🎵 Disconnecting socket manager...');
        socketManager.disconnect();
        console.log('🎵 Socket manager disconnected');
      } catch (socketError) {
        console.warn('🎵 Socket manager disconnect error:', socketError);
      }
      
      // Then disconnect from LiveKit room with error handling
      if (room) {
        try {
          console.log('🎵 Disconnecting LiveKit room...');
          // Use a more graceful disconnect approach
          if (room.state === 'connected') {
            await room.disconnect();
          } else {
            // If room is not connected, just clean up
            room.removeAllListeners();
          }
          console.log('🎵 Room disconnected successfully');
        } catch (roomError) {
          console.warn('🎵 Room disconnect error (usually harmless):', roomError);
          // Even if disconnect fails, clean up listeners
          try {
            room.removeAllListeners();
          } catch (listenerError) {
            console.warn('🎵 Error removing room listeners:', listenerError);
          }
        }
      }
      
      // Force cleanup by setting room to null
      setRoom(null);
      console.log('🎵 Room state set to null');
      
      // Add a small delay before calling onDisconnect to ensure cleanup is complete
      setTimeout(() => {
        // Finally call the onDisconnect callback
        if (onDisconnect) {
          console.log('🎵 Calling onDisconnect callback');
          try {
            onDisconnect();
          } catch (callbackError) {
            console.error('❌ Error in onDisconnect callback:', callbackError);
          }
        }
      }, 300); // Reduced delay to minimize error modal flash
      
    } catch (error) {
      console.error('❌ Error during call disconnect:', error);
      
      // Force cleanup even on error
      try {
        socketManager.disconnect();
      } catch (socketError) {
        console.warn('🎵 Force socket disconnect error:', socketError);
      }
      
      setRoom(null);
      setShouldConnect(false);
      
      // Still call onDisconnect even if there's an error
      if (onDisconnect) {
        try {
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
      
      setShowGiftPanel(false);
      setShowGiftConfirm(false);
      setPendingGift(null);
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

  // Listen for gift events
  useEffect(() => {
    // Handle receiving gifts
    function handleReceiveGift(data: any) {
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

    return () => {
      socketManager.getSocket()?.off('receive_gift', handleReceiveGift);
      socketManager.getSocket()?.off('gift_request', handleGiftRequest);
    };
  }, []);

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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 z-50">
      {shouldConnect ? (
        <LiveKitRoom
          video={false}
          audio={true}
          token={token}
          serverUrl={wsURL}
          
          style={{ height: '100vh', width: '100vw' }}
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
          {/* Call Header */}
          <CallHeader />

                  {/* Audio Display */}
        <AudioDisplay astrologerName={astrologerName} partner={partner} />

          {/* Control Bar */}
          <CustomControlBar onEndCall={handleLeaveCall} onGift={handleGift} />

          {/* Audio Renderer */}
          <RoomAudioRenderer />

          {/* Connection Status Toast */}
          <ConnectionStateToast />

          {/* Settings Panel */}
          <SettingsPanel />

                    {/* Gift Panel */}
          {showGiftPanel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-4">Send a Gift</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {gifts.map(gift => (
                    <button
                      key={gift._id}
                      onClick={() => {
                        setPendingGift(gift);
                        setShowGiftConfirm(true);
                      }}
                      disabled={sendingGift}
                      className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <img src={gift.icon} alt={gift.name} className="w-12 h-12 mb-1" />
                      <span className="text-xs">{gift.name}</span>
                      <span className="text-xs text-gray-500">₹{gift.price}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowGiftPanel(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
              </div>
            </div>
          )}

          {/* Gift Notification */}
          {giftNotification && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
              🎁 {giftNotification.fromName} sent {giftNotification.giftName}!
            </div>
          )}

          {/* Gift Request Notification */}
          {giftRequest && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              <div className="text-center">
                <p className="font-semibold">
                  {astrologerName || 'Astrologer'} is requesting a gift!
                </p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => {
                      setShowGiftPanel(true);
                      setGiftRequest(null);
                    }}
                    className="bg-white text-yellow-600 px-3 py-1 rounded text-sm font-medium"
                  >
                    Send Gift
                  </button>
                  <button
                    onClick={() => setGiftRequest(null)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Dismiss
                  </button>
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
            <h2 className="text-2xl font-bold mb-4">Call Ended</h2>
            <p className="text-lg">Disconnecting from audio room...</p>
          </div>
        </div>
      )}
    </div>
  );
} 