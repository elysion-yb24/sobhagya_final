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
  VideoTrack
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
import { useRouter } from 'next/navigation';

// Import LiveKit styles
import '@livekit/components-styles';

interface VideoCallRoomProps {
  token: string;
  wsURL: string;
  roomName: string;
  participantName: string;
  astrologerName?: string;
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
      participantIdentities: participants.map(p => p.identity)
    });
  }, [participants.length, localVideoTracks.length, remoteVideoTracks.length, localParticipant?.identity]);

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

// Custom control bar
const CustomControlBar = ({ onEndCall }: { onEndCall: () => void }) => {
  const { localParticipant } = useLocalParticipant();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 rounded-full px-6 py-3 flex items-center gap-4 z-[60]">
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-full transition-all ${
          isAudioEnabled 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full transition-all ${
          isVideoEnabled 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      <button
        onClick={() => {
          console.log('End call button clicked');
          onEndCall();
        }}
        className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
        title="End call"
      >
        <PhoneOff className="w-5 h-5" />
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
  onDisconnect,
}: VideoCallRoomProps) {
  const router = useRouter();
  const roomRef = useRef<Room | null>(null);
  const isDisconnectingRef = useRef(false);
  
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    isConnected: false,
  });
  const [showSettings, setShowSettings] = useState(false);

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
    
    // Add extra delay to ensure proper cleanup before navigation
    // This prevents 401 errors when returning to astrologers page
    setTimeout(() => {
      console.log('🧹 Cleanup complete, preparing navigation...');
      
      if (onDisconnect) {
        onDisconnect();
      } else {
        // Navigate back to astrologers page with additional delay
        console.log('🏠 Navigating back to astrologers page after video call');
        
        // Set a flag to indicate returning from video call
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('returning_from_video_call', 'true');
        }
        
        router.push('/astrologers');
      }
    }, 1500); // Increased delay for better cleanup
  }, [onDisconnect, router]);

  const handleError = useCallback((error: Error) => {
    console.error('Room error:', error);
    // Don't automatically disconnect on errors, let user decide
  }, []);

  // Safe disconnect function
  const handleLeaveCall = useCallback(() => {
    if (isDisconnectingRef.current) return;
    
    isDisconnectingRef.current = true;
    setCallStats(prev => ({ ...prev, isConnected: false }));
    
    if (roomRef.current) {
      try {
        // Stop local tracks before disconnecting
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
        
        // Disconnect with a short delay
        setTimeout(() => {
          if (roomRef.current) {
            roomRef.current.disconnect();
          }
        }, 50);
      } catch (error) {
        console.error('Error during disconnect:', error);
        // Force navigation even if disconnect fails
        setTimeout(() => {
          router.push('/astrologers');
        }, 100);
      }
    } else {
      // No room reference, navigate directly
      router.push('/astrologers');
    }
  }, [router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current && !isDisconnectingRef.current) {
        isDisconnectingRef.current = true;
        try {
          roomRef.current.disconnect();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    };
  }, []);

  // Call info header
  const CallHeader = React.memo(() => (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[60] pointer-events-none">
      <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2 text-white pointer-events-auto">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">
              {astrologerName ? `Call with ${astrologerName}` : 'Video Call'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(callStats.duration)}</span>
          </div>

          {callStats.isConnected && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-black bg-opacity-70 rounded-lg p-2 text-white hover:bg-opacity-90 transition-all"
          title="Settings"
          disabled={isDisconnectingRef.current}
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleLeaveCall}
          className="bg-red-500 bg-opacity-80 rounded-lg p-2 text-white hover:bg-opacity-100 transition-all disabled:opacity-50"
          title="Leave call"
          disabled={isDisconnectingRef.current}
        >
          <PhoneOff className="w-5 h-5" />
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
          // Enable adaptive stream for better performance
          adaptiveStream: true,
          // Enable dynacast for better performance
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

        {/* Custom Video Display */}
        <CustomVideoDisplay />

        {/* Custom Control Bar */}
        <CustomControlBar onEndCall={handleLeaveCall} />

        {/* Audio Renderer */}
        <RoomAudioRenderer />

        {/* Connection Status Toast */}
        <ConnectionStateToast />

        {/* Settings Panel */}
        <SettingsPanel />
      </LiveKitRoom>
    </div>
  );
} 