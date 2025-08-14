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
  VideoTrack,
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
  Video,
  VideoOff,
  PhoneOff,
  Gift,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socketManager } from "../../utils/socket";
import { getUserDetails, getAuthToken } from "../../utils/auth-utils";
import { buildApiUrl, getApiBaseUrl } from "../../config/api";
import GiftConfirmationDialog from '../ui/GiftConfirmationDialog';

// Import LiveKit styles
import '@livekit/components-styles';

interface VideoCallRoomProps {
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

// Enhanced mobile-optimized video display component
const CustomVideoDisplay = () => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [isLocalVideoMinimized, setIsLocalVideoMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Get video tracks
  const localVideoTracks = useTracks([Track.Source.Camera], { onlySubscribed: false })
    .filter(track => track.participant === localParticipant);
  
  const remoteVideoTracks = useTracks([Track.Source.Camera], { onlySubscribed: true })
    .filter(track => track.participant !== localParticipant);

  // Debug logging
  useEffect(() => {
    console.log('🎥 Video tracks debug:', {
      participants: participants.length,
      localVideoTracks: localVideoTracks.length,
      remoteVideoTracks: remoteVideoTracks.length,
      localParticipant: localParticipant?.identity,
      remoteParticipant: remoteVideoTracks.map(track => track.participant.identity),
      participantIdentities: participants.map(p => p.identity),
      participantNames: participants.map(p => p.name),
      remoteTrackDetails: remoteVideoTracks.map(track => ({
        participant: track.participant.identity,
        participantName: track.participant.name,
        trackId: track.publication?.trackSid || 'unknown'
      })),
      localTrackDetails: localVideoTracks.map(track => ({
        participant: track.participant.identity,
        participantName: track.participant.name,
        trackId: track.publication?.trackSid || 'unknown'
      }))
    });

    // Log participant details
    participants.forEach(participant => {
      console.log('👤 Participant:', {
        identity: participant.identity,
        name: participant.name,
        metadata: participant.metadata,
        isLocal: participant === localParticipant,
        audioTracks: participant.audioTrackPublications.size,
        videoTracks: participant.videoTrackPublications.size
      });
    });
  }, [participants.length, localVideoTracks.length, remoteVideoTracks.length, localParticipant?.identity, remoteVideoTracks, localVideoTracks, participants]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Remote participants video - Main view */}
      {remoteVideoTracks.length > 0 ? (
        <div className="h-full w-full relative">
          {remoteVideoTracks.map((track, index) => (
            <div key={track.participant.identity} className="h-full w-full">
              <VideoTrack
                trackRef={track}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '0px'
                }}
              />
              
              {/* Enhanced participant name overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-sm sm:text-base">
                    {track.participant.name || 'Astrologer'}
                  </span>
                </div>
              </div>

              {/* Fullscreen toggle button */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-xl p-2 text-white hover:bg-opacity-90 transition-all"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Waiting for Astrologer</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4">The astrologer will join shortly</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Connecting...</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Local video - Picture in Picture */}
      <div className={`absolute transition-all duration-300 ease-in-out ${
        isLocalVideoMinimized 
          ? 'top-4 right-4 w-24 h-32 sm:w-32 sm:h-40' 
          : 'top-4 right-4 w-32 h-24 sm:w-40 sm:h-32'
      } bg-black rounded-2xl overflow-hidden z-20 border-2 border-white/20 shadow-2xl`}>
        {localVideoTracks.length > 0 ? (
          <div className="relative w-full h-full">
            <VideoTrack
              trackRef={localVideoTracks[0]}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
            
            {/* Local video controls overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium">
                  You
                </div>
                <button
                  onClick={() => setIsLocalVideoMinimized(!isLocalVideoMinimized)}
                  className="bg-black/70 backdrop-blur-sm rounded-lg p-1 text-white hover:bg-black/90 transition-colors"
                >
                  {isLocalVideoMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium">You</p>
              <p className="text-xs text-gray-400">Camera off</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced mobile-optimized control bar
const CustomControlBar = ({ onEndCall, onGift }: { onEndCall: () => void, onGift: () => void }) => {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls on mobile
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleTouch = () => resetTimeout();
    const handleMouse = () => resetTimeout();

    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('mousemove', handleMouse);
    resetTimeout();

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // Toggle local video
  const toggleVideo = useCallback(async () => {
    try {
      if (isVideoEnabled) {
        await localParticipant.setCameraEnabled(false);
      } else {
        await localParticipant.setCameraEnabled(true);
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }, [localParticipant, isVideoEnabled]);

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

  // Get remote participant camera status
  const remoteCameraStatus = remoteParticipants.length > 0
    ? remoteParticipants[0].isCameraEnabled
    : null;

  return (
    <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-in-out ${
      showControls ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {/* Main control bar */}
      <div className="bg-gradient-to-t from-black/90 via-black/80 to-transparent backdrop-blur-sm px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center gap-3 sm:gap-6">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 sm:p-5 rounded-full transition-all duration-200 shadow-lg ${
              isAudioEnabled 
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' 
                : 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 sm:p-5 rounded-full transition-all duration-200 shadow-lg ${
              isVideoEnabled 
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' 
                : 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Gift button */}
          <button
            onClick={onGift}
            className="p-4 sm:p-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transition-all duration-200 shadow-lg border border-yellow-300"
            title="Send Gift"
          >
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* End call button */}
          <button
            onClick={onEndCall}
            className="p-4 sm:p-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-lg border border-red-400"
            title="End call"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Remote participant status indicator */}
        {remoteCameraStatus !== null && (
          <div className="flex justify-center mt-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Astrologer:</span>
                {remoteCameraStatus ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <Video className="w-4 h-4" />
                    <span>Camera On</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <VideoOff className="w-4 h-4" />
                    <span>Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Touch indicator for mobile */}
      <div className="flex justify-center pb-2">
        <div className="w-12 h-1 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
};

export default function VideoCallRoom({
  token,
  wsURL,
  roomName,
  participantName,
  astrologerName,
  partner,
  onDisconnect,
}: VideoCallRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ensure astrologerId is always a string
  const astrologerId: string = (searchParams?.get('astrologerId') || partner?._id || '') as string;
  
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    isConnected: false,
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);
  const [pendingGift, setPendingGift] = useState<any>(null);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftNotification, setGiftNotification] = useState<any>(null);
  const [giftRequest, setGiftRequest] = useState<any>(null);
  
  const roomRef = useRef<Room | null>(null);
  const isDisconnectingRef = useRef(false);

  // Gift data
  const gifts = [
    { _id: '1', name: 'Rose', icon: '🌹', price: 10 },
    { _id: '2', name: 'Heart', icon: '❤️', price: 20 },
    { _id: '3', name: 'Star', icon: '⭐', price: 50 },
    { _id: '4', name: 'Crown', icon: '👑', price: 100 },
    { _id: '5', name: 'Diamond', icon: '💎', price: 200 },
    { _id: '6', name: 'Gift', icon: '🎁', price: 500 },
  ];

  // Listen for gift notifications
  useEffect(() => {
    function handleGiftNotification(data: any) {
      console.log('🎁 Gift notification received:', data);
      setGiftNotification(data);
      // Auto-hide gift notification after 5 seconds
      setTimeout(() => setGiftNotification(null), 5000);
    }
    socketManager.onReceiveGift(handleGiftNotification);
    return () => {
      if (socketManager.getSocket()) {
        socketManager.getSocket()?.off('receive_gift', handleGiftNotification);
      }
    };
  }, []);

  // Listen for gift requests from astrologer
  useEffect(() => {
    function handleGiftRequest(data: any) {
      console.log('🎁 Gift request received:', data);
      setGiftRequest(data);
      // Auto-hide gift request after 10 seconds
      setTimeout(() => setGiftRequest(null), 10000);
    }
    socketManager.onGiftRequest(handleGiftRequest);
    return () => {
      if (socketManager.getSocket()) {
        socketManager.getSocket()?.off('gift_request', handleGiftRequest);
      }
    };
  }, []);

  useEffect(() => {
    // Ensure socket is connected to the current room/channel before sending gifts
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

  const handleLeaveCall = useCallback(async () => {
    if (isDisconnectingRef.current) return;
    isDisconnectingRef.current = true;
    setCallStats(prev => ({ ...prev, isConnected: false }));

    console.log('📞 User ending call - cleaning up...');

    // Emit end_call event to notify astrologer and server
    if (roomName) {
      try {
        // Check if socket is connected before trying to emit
        if (socketManager.isSocketConnected()) {
          await socketManager.endCall(roomName, 'USER_ENDED');
        } else {
          // If socket is not connected, just emit the event directly
          socketManager.emitCallEnd(roomName, 'USER_ENDED');
        }
      } catch (error) {
        console.error('Failed to emit end_call event:', error);
        // Fallback to emitCallEnd if endCall fails
        socketManager.emitCallEnd(roomName, 'USER_ENDED');
      }
    }

    // Clean up LiveKit room
    if (roomRef.current) {
      try {
        // Stop all local tracks
        roomRef.current.localParticipant.audioTrackPublications.forEach((publication) => {
          if (publication.track) {
            publication.track.stop();
          }
        });
        roomRef.current.localParticipant.videoTrackPublications.forEach((publication) => {
          if (publication.track) {
            publication.track.stop();
          }
        });
        
        // Add a small delay to ensure socket events are sent
        setTimeout(async () => {
          if (roomRef.current) {
            try {
              await roomRef.current.disconnect();
            } catch (roomError) {
              console.warn('📞 Room disconnect error (usually harmless):', roomError);
              // Try to force disconnect by setting room to null
              roomRef.current = null;
            }
          }
        }, 100);
      } catch (error) {
        console.error('Error during LiveKit disconnect:', error);
      }
    }

    // Clean up socket connection
    setTimeout(() => {
      try {
        console.log('📞 Disconnecting socket manager...');
        socketManager.disconnect();
      } catch (error) {
        console.error('Error during socket disconnect:', error);
      }
      
      // Force cleanup room reference
      roomRef.current = null;
      
      // Navigate away
      setTimeout(() => {
        const callSource = localStorage.getItem('callSource');
        const astrologerId = localStorage.getItem('lastAstrologerId');
        
        if (callSource === 'astrologerCard') {
          // If user came from astrologer card, go back to astrologers list
          router.push('/astrologers');
        } else if (callSource === 'astrologerProfile' && astrologerId) {
          // If user came from astrologer profile, go back to that profile
          router.push(`/astrologers/${astrologerId}`);
        } else {
          // Fallback to astrologers list
          router.push('/astrologers');
        }
        
        // Clean up localStorage
        localStorage.removeItem('callSource');
      }, 100);
    }, 100);
  }, [router, roomName]);

  // Listen for end_call event and partner disconnection to disconnect user if astrologer ends the call
  useEffect(() => {
    function handleCallEnd(data: any) {
      console.log('📞 Call ended by server:', data);
      handleLeaveCall();
    }

    function handlePartnerDisconnect(data: any) {
      console.log('📞 Partner disconnected:', data);
      // Show notification to user
      alert('Astrologer has disconnected from the call.');
      handleLeaveCall();
    }

    function handlePartnerLeft(data: any) {
      console.log('📞 Partner left the call:', data);
      alert('Astrologer has left the call.');
      handleLeaveCall();
    }

    function handleCallTerminated(data: any) {
      console.log('📞 Call terminated:', data);
      alert('Call has been terminated.');
      handleLeaveCall();
    }

    const socket = socketManager.getSocket();
    if (socket) {
      // Listen for various call end and partner disconnection events
      socket.on('end_call', handleCallEnd);
      socket.on('call_end', handleCallEnd);
      socket.on('partner_disconnect', handlePartnerDisconnect);
      socket.on('partner_left', handlePartnerLeft);
      socket.on('call_terminated', handleCallTerminated);
      socket.on('broadcaster_disconnect', handlePartnerDisconnect);
      socket.on('broadcaster_left', handlePartnerLeft);
    }
    return () => {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.off('end_call', handleCallEnd);
        socket.off('call_end', handleCallEnd);
        socket.off('partner_disconnect', handlePartnerDisconnect);
        socket.off('partner_left', handlePartnerLeft);
        socket.off('call_terminated', handleCallTerminated);
        socket.off('broadcaster_disconnect', handlePartnerDisconnect);
        socket.off('broadcaster_left', handlePartnerLeft);
      }
    };
  }, [handleLeaveCall]);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStats.isConnected && !isDisconnectingRef.current) {
      interval = setInterval(() => {
        setCallStats(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStats.isConnected]);

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle room events
  const handleRoomConnected = useCallback(() => {
    console.log('Connected to room');
    isDisconnectingRef.current = false;
    
    setCallStats(prev => ({ 
      ...prev, 
      isConnected: true
    }));
  }, []);

  const handleRoomDisconnected = useCallback(() => {
    console.log('📞 Video call disconnected - cleaning up...');
    isDisconnectingRef.current = true;
    roomRef.current = null;
    setCallStats(prev => ({ ...prev, isConnected: false }));
   
    setTimeout(() => {
      if (onDisconnect) {
        onDisconnect();
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('returning_from_video_call', 'true');
        }
        router.push('/astrologers');
      }
    }, 1500);
  }, [onDisconnect, router]);

  const handleError = useCallback((error: Error) => {
    console.error('Room error:', error);
    
    // Handle DataChannel errors gracefully (they're usually harmless)
    if (error.message.includes('DataChannel') || error.message.includes('lossy')) {
      console.warn('📞 DataChannel error (usually harmless):', error.message);
      return; // Don't show alert for DataChannel errors
    }
    
    // For other errors, log but don't automatically disconnect
    console.error('📞 Room error:', error);
  }, []);

  // Cleanup on unmount and page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('📞 VideoCallRoom: Page unloading, forcing cleanup...');
      
      // Force disconnect socket manager
      try {
        socketManager.disconnect();
      } catch (error) {
        console.warn('📞 Force socket disconnect on page unload error:', error);
      }
      
      // Force disconnect room
      if (roomRef.current) {
        try {
          roomRef.current.disconnect();
        } catch (error) {
          console.warn('📞 Force room disconnect on page unload error:', error);
        }
      }
    };

    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('📞 VideoCallRoom: Component unmounting, forcing cleanup...');
      
      // Remove beforeunload event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (roomRef.current && !isDisconnectingRef.current) {
        isDisconnectingRef.current = true;
        try {
          roomRef.current.disconnect();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
      
      // Force disconnect socket manager
      try {
        socketManager.disconnect();
      } catch (error) {
        console.warn('📞 Force socket disconnect on unmount error:', error);
      }
      
      // Force cleanup room reference
      roomRef.current = null;
    };
  }, []);

  // Enhanced mobile-optimized call header
  const CallHeader = React.memo(() => (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center z-[60] pointer-events-none px-4 py-4">
      <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-3 text-white pointer-events-auto">
        <div className="flex items-center gap-3 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold truncate max-w-32 sm:max-w-none">
              {astrologerName ? `Call with ${astrologerName}` : 'Video Call'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatDuration(callStats.duration)}</span>
          </div>

          {callStats.isConnected && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-green-400 font-medium">Connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-black/80 backdrop-blur-sm rounded-2xl p-3 text-white hover:bg-black/90 transition-all"
          title="Settings"
          disabled={isDisconnectingRef.current}
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleLeaveCall}
          className="bg-red-500/90 backdrop-blur-sm rounded-2xl p-3 text-white hover:bg-red-600 transition-all disabled:opacity-50"
          title="Leave call"
          disabled={isDisconnectingRef.current}
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  ));

  // Enhanced mobile-optimized settings panel
  const SettingsPanel = React.memo(() => {
    if (!showSettings) return null;

    return (
      <div className="absolute top-20 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 z-[60] w-80 pointer-events-auto border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Call Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="font-semibold text-gray-700">Room:</span>
            <span className="ml-2 text-gray-600 font-mono">{roomName}</span>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="font-semibold text-gray-700">Participant:</span>
            <span className="ml-2 text-gray-600">{participantName}</span>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="font-semibold text-gray-700">Status:</span>
            <span className={`ml-2 font-semibold ${callStats.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {callStats.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <span className="font-semibold text-gray-700">Duration:</span>
            <span className="ml-2 text-gray-600 font-mono">{formatDuration(callStats.duration)}</span>
          </div>
        </div>
      </div>
    );
  });

  // Send gift handler
  const handleSendGift = async (gift: any) => {
    setSendingGift(true);
    const user = getUserDetails();
    try {
      // Make sure astrologerId is a string
      if (!astrologerId) {
        throw new Error("Astrologer ID is missing");
      }

      await socketManager.sendGift({
        channelId: roomName, 
        giftId: gift._id,
        from: user.id || user._id,
        fromName: user.name || user.displayName || "User",
        to: astrologerId,
        giftName: gift.name,
        giftIcon: gift.icon,
        toName: astrologerName || "Astrologer"
      });
      setShowGiftPanel(false);
    } catch (err) {
      console.error("Gift send error:", err);
      const errorMsg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
      alert("Failed to send gift: " + errorMsg);
    }
    setSendingGift(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={wsURL}
        data-lk-theme="default"
        style={{ height: '100vh', width: '100vw' }}
        onConnected={handleRoomConnected}
        onDisconnected={handleRoomDisconnected}
        onError={handleError}
        connect={true}
        options={{
          adaptiveStream: true,
          dynacast: true,
          // Audio settings
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          // Video settings  
          videoCaptureDefaults: {
            resolution: {
              width: 1280,
              height: 720,
            },
            facingMode: 'user',
          },
        }}
      >
        {/* Call Header */}
        <CallHeader />

        {/* All Participant Video Tiles */}
        <CustomVideoDisplay />

        {/* Custom Control Bar */}
        <CustomControlBar onEndCall={handleLeaveCall} onGift={() => setShowGiftPanel(true)} />

        {/* Audio Renderer */}
        <RoomAudioRenderer />

        {/* Connection Status Toast */}
        <ConnectionStateToast />

        {/* Settings Panel */}
        <SettingsPanel />

        {/* Enhanced mobile-optimized gift panel */}
        {showGiftPanel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Send a Gift</h3>
                <button 
                  onClick={() => setShowGiftPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {gifts.map(gift => (
                  <button
                    key={gift._id}
                    className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50 transition-all"
                    onClick={() => {
                      setPendingGift(gift);
                      setShowGiftConfirm(true);
                    }}
                    disabled={sendingGift}
                  >
                    <span className="text-3xl mb-2">{gift.icon}</span>
                    <span className="font-semibold text-gray-800 mb-1">{gift.name}</span>
                    <span className="text-sm text-orange-600 font-bold">₹{gift.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced gift notification */}
        {giftNotification && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <span className="font-semibold">
                {giftNotification.fromName} sent {giftNotification.giftName}!
              </span>
            </div>
          </div>
        )}

        {/* Enhanced gift request notification */}
        {giftRequest && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <span className="font-semibold">
                  {astrologerName || 'Astrologer'} is requesting a gift!
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowGiftPanel(true);
                    setGiftRequest(null);
                  }}
                  className="bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Send Gift
                </button>
                <button
                  onClick={() => setGiftRequest(null)}
                  className="bg-white/20 text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render the confirmation dialog */}
        {showGiftConfirm && pendingGift && (
          <GiftConfirmationDialog
            isOpen={showGiftConfirm}
            onClose={() => setShowGiftConfirm(false)}
            onConfirm={async () => {
              setShowGiftConfirm(false);
              await handleSendGift(pendingGift);
              setPendingGift(null);
            }}
            giftName={pendingGift.name}
            giftIcon={pendingGift.icon}
            giftPrice={pendingGift.price}
            isLoading={sendingGift}
          />
        )}
      </LiveKitRoom>
    </div>
  );
} 