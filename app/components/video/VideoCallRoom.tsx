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
  PhoneOff
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

// Custom video component to show actual video tracks
const CustomVideoDisplay = () => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  
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

  return (
    <div className="h-full w-full bg-gray-900 relative">
      {/* Remote participants video */}
      {remoteVideoTracks.length > 0 ? (
        <div className="h-full w-full">
          {remoteVideoTracks.map((track, index) => (
            <div key={track.participant.identity} className="h-full w-full">
              <VideoTrack
                trackRef={track}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Participant name overlay */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded-lg px-3 py-1 text-white text-sm">
                {track.participant.name || 'Astrologer'}
              </div>
              {/* Debug info overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg px-3 py-1 text-white text-xs">
                Track: {track.publication?.trackSid?.slice(0, 8) || 'unknown'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-xl font-semibold">Waiting for astrologer...</p>
            <p className="text-gray-400 mt-2">The astrologer will join shortly</p>
            <p className="text-xs text-gray-500 mt-4">
              Remote tracks: {remoteVideoTracks.length} | Participants: {participants.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Participant IDs: {participants.map(p => p.identity).join(', ')}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Participant Names: {participants.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Local video - picture in picture */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden z-10 border-2 border-gray-600">
        {localVideoTracks.length > 0 ? (
          <VideoTrack
            trackRef={localVideoTracks[0]}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-gray-800">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs">You</p>
              <p className="text-xs text-gray-400">Camera off</p>
              <p className="text-xs text-gray-500">Tracks: {localVideoTracks.length}</p>
            </div>
          </div>
        )}
        
        {/* Local video label */}
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 rounded px-2 py-1 text-white text-xs">
          You
        </div>
      </div>
    </div>
  );
};

// Custom control bar with mic, camera, gift, and end call buttons
const CustomControlBar = ({ onEndCall, onGift }: { onEndCall: () => void, onGift: () => void }) => {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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

  // Get remote participant camera status (show for first remote participant if present)
  const remoteCameraStatus = remoteParticipants.length > 0
    ? remoteParticipants[0].isCameraEnabled
    : null;

  return (
    <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4 z-[60]">
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
        onClick={toggleVideo}
        className={`p-2 sm:p-3 rounded-full transition-all ${
          isVideoEnabled 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Show remote participant camera status if present */}
      {remoteCameraStatus !== null && (
        <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 rounded text-white text-xs sm:text-sm">
          <span>Astrologer Camera:</span>
          {remoteCameraStatus ? <Video className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
        </div>
      )}

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
  const roomRef = useRef<Room | null>(null);
  const isDisconnectingRef = useRef(false);
  
  const astrologerId = partner?._id || '';
  
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    isConnected: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Gift state
  const [gifts, setGifts] = useState<any[]>([]);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftNotification, setGiftNotification] = useState<any>(null);
  const [giftRequest, setGiftRequest] = useState<any>(null);

  // Add state for gift confirmation
  const [pendingGift, setPendingGift] = useState<any | null>(null);
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);


  const [callId, setCallId] = useState<string | null>(null);

  // useEffect(() => {
    // const fetchCallId = async () => {
    //   try {
    //     const token = getAuthToken();

    //     if(!partner || !partner._id) {
    //       console.error('Partner not found');
    //       return;
    //     }

    //     const astrologerId = partner._id;
      
    //     const response = await fetch(`${buildApiUrl('/calling/api/call/call-token-livekit')}`, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${token}`,
    //       },
    //       body: JSON.stringify({
    //         receiverUserId: astrologerId,
    //         type: 'video',
    //         appVersion: '1.0.0',
    //       }),
    //       credentials: "include",
    //     });
    //     if (response.ok) {
    //       const data = await response.json();
    //       if (data.success && data.data && data.data.callId) {
    //         setCallId(data.data.callId);
    //       }
    //     }
    //   } catch (err) {
    //     console.error("Failed to fetch callId for room:", err);
    //   }
    // };
    // fetchCallId();
  // }, [roomName]);


  

  // const sendCallEndToBackend = async () => {
  //   try {
  //     const token = getAuthToken();
  //     const user = getUserDetails();
  //     if (!callId) return;
  //     await fetch(`${getApiBaseUrl()}/calling/api/call/call-token-livekit`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${token}`,
  //       },
       
  //       body: JSON.stringify({
  //         action: "end_call",
  //         callId,
  //         userId: user.id || user._id,
  //       }),
  //       credentials: "include",
  //     });
  //   } catch (err) {
  //     console.error("Failed to send call end to backend:", err);
  //   }
  // };

  
  useEffect(() => {
    const token = getAuthToken();
    fetch(`${getApiBaseUrl()}/calling/api/gift/get-gifts`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Gift API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => setGifts(data.data || []))
      .catch(err => {
        console.error('Failed to fetch gifts:', err);
        setGifts([]);
      });
  }, []);

  useEffect(() => {
    function handleReceiveGift(data: any) {
      setGiftNotification(data);
      setTimeout(() => setGiftNotification(null), 4000);
    }
    socketManager.onReceiveGift(handleReceiveGift);
    return () => {
      if (socketManager.getSocket()) {
        socketManager.getSocket()?.off('receive_gift', handleReceiveGift);
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

  // Call info header
  const CallHeader = React.memo(() => (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center z-[60] pointer-events-none">
      <div className="bg-black bg-opacity-70 rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-white pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium truncate max-w-20 sm:max-w-none">
              {astrologerName ? `Call with ${astrologerName}` : 'Video Call'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formatDuration(callStats.duration)}</span>
          </div>

          {callStats.isConnected && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Connected</span>
            </div>
          )}
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
  ));

  // Settings panel
  const SettingsPanel = React.memo(() => {
    if (!showSettings) return null;

    return (
      <div className="absolute top-16 right-4 bg-white rounded-lg shadow-xl p-4 z-[60] w-80 pointer-events-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Call Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Room:</span>
            <span className="ml-2 text-gray-600">{roomName}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Participant:</span>
            <span className="ml-2 text-gray-600">{participantName}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className={`ml-2 ${callStats.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {callStats.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <span className="ml-2 text-gray-600">{formatDuration(callStats.duration)}</span>
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

        {/* Gift Panel */}
        {showGiftPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Send a Gift</h3>
              <div className="grid grid-cols-3 gap-4">
                {gifts.map(gift => (
                  <button
                    key={gift._id}
                    className="flex flex-col items-center p-2 border rounded hover:bg-orange-50"
                    onClick={() => {
                      setPendingGift(gift);
                      setShowGiftConfirm(true);
                    }}
                    disabled={sendingGift}
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
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded shadow-lg z-50">
            🎁 {giftNotification.fromName} sent {giftNotification.giftName}!
          </div>
        )}

        {/* Gift Request Notification */}
        {giftRequest && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-orange-100 border border-orange-400 text-orange-800 px-6 py-3 rounded shadow-lg z-50 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <span className="font-medium">
                {astrologerName || 'Astrologer'} is requesting a gift!
              </span>
            </div>
            <button
              onClick={() => {
                setShowGiftPanel(true);
                setGiftRequest(null);
              }}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
            >
              Send Gift
            </button>
            <button
              onClick={() => setGiftRequest(null)}
              className="text-orange-600 hover:text-orange-800 text-sm"
            >
              ✕
            </button>
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