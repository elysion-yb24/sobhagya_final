"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Users,
  Clock,
  ArrowLeft
} from "lucide-react";

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const roomName = searchParams.get('room');
  const astrologerName = searchParams.get('astrologer');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token || !roomName) {
      setError("Missing video call parameters");
      return;
    }

    initializeLiveKit();
    
    return () => {
      cleanup();
    };
  }, [token, roomName]);

  useEffect(() => {
    if (isConnected) {
      // Start call duration timer
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  const initializeLiveKit = async () => {
    try {
      setIsConnecting(true);
      
      // Dynamic import of LiveKit SDK to avoid SSR issues
      const { Room, RoomEvent, Track, RemoteTrack, LocalTrack } = await import('livekit-client');
      
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.Connected, () => {
        console.log('Connected to room');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        setIsConnected(false);
        cleanup();
      });

      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        console.log('Participant connected:', participant.identity);
        setParticipants(prev => [...prev, participant.identity]);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: any) => {
        console.log('Participant disconnected:', participant.identity);
        setParticipants(prev => prev.filter(p => p !== participant.identity));
      });

      room.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
        if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
          track.attach(remoteVideoRef.current);
        }
      });

      room.on(RoomEvent.LocalTrackPublished, (publication: any, participant: any) => {
        if (publication.track && publication.track.kind === Track.Kind.Video && localVideoRef.current) {
          publication.track.attach(localVideoRef.current);
        }
      });

      // Connect to room
      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server.com', token!);

      // Enable camera and microphone
      await room.localParticipant.enableCameraAndMicrophone();

    } catch (error) {
      console.error('Failed to initialize LiveKit:', error);
      setError('Failed to connect to video call. Please try again.');
      setIsConnecting(false);
    }
  };

  const cleanup = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const toggleCamera = async () => {
    if (roomRef.current) {
      try {
        if (isCameraOn) {
          await roomRef.current.localParticipant.setCameraEnabled(false);
        } else {
          await roomRef.current.localParticipant.setCameraEnabled(true);
        }
        setIsCameraOn(!isCameraOn);
      } catch (error) {
        console.error('Failed to toggle camera:', error);
      }
    }
  };

  const toggleMicrophone = async () => {
    if (roomRef.current) {
      try {
        if (isMicOn) {
          await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        } else {
          await roomRef.current.localParticipant.setMicrophoneEnabled(true);
        }
        setIsMicOn(!isMicOn);
      } catch (error) {
        console.error('Failed to toggle microphone:', error);
      }
    }
  };

  const endCall = () => {
    cleanup();
    window.close(); // Close the popup window
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.close()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.close()}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Video Call</h1>
              {astrologerName && (
                <p className="text-sm text-gray-300">with {decodeURIComponent(astrologerName)}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
            
            {participants.length > 0 && (
              <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">{participants.length + 1}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full h-screen">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={false}
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isCameraOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Connection Status */}
        {isConnecting && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">Connecting to video call...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we connect you</p>
            </div>
          </div>
        )}

        {/* No Video Placeholder */}
        {isConnected && !isConnecting && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Video className="h-16 w-16 text-white/60" />
              </div>
              <p className="text-xl font-semibold mb-2">
                {astrologerName ? decodeURIComponent(astrologerName) : 'Astrologer'}
              </p>
              <p className="text-gray-300">Video call in progress</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Microphone Toggle */}
          <button
            onClick={toggleMicrophone}
            className={`p-4 rounded-full transition-all duration-200 ${
              isMicOn 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all duration-200 ${
              isCameraOn 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
          >
            <PhoneOff className="h-6 w-6" />
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-all duration-200 ${
              isSpeakerOn 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>
        </div>

        {/* Call Status */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
    </div>
  );
} 