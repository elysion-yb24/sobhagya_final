import React, { useState, useEffect, useCallback } from 'react';
import { useTracks, useLocalParticipant, useRoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { Track, Room } from "livekit-client";
import LocalVideo from '../media/LocalVideo';
import RemoteVideo from '../media/RemoteVideo';
import MobileCallControls from '../controls/MobileCallControls';
import CallTimer from '../ui/CallTimer';
import ParticipantAvatar from '../ui/ParticipantAvatar';

interface VideoCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverAvatar?: string;
    balance?: string;
    rpm?: string;
    startTime?: string;
}

const VideoCallMobileView: React.FC<VideoCallViewProps> = ({
    onDisconnect,
    receiverName,
    receiverAvatar,
    balance,
    rpm,
    startTime
}) => {
    const [layout, setLayout] = useState<'pip' | 'split'>('pip');
    const [controlsVisible, setControlsVisible] = useState(false);
    const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const { localParticipant } = useLocalParticipant();

    let room: Room | undefined;
    try {
        room = useRoomContext();
    } catch (e) {}

    const tracks = useTracks([Track.Source.Camera]);
    const localTrack = tracks.find(t => t.participant.isLocal);
    const remoteTrack = tracks.find(t => !t.participant.isLocal);

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isVideoOff = !localParticipant?.isCameraEnabled;
    const isConnected = !!remoteTrack;

    const showControlsForAWhile = useCallback(() => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
            controlsTimeoutRef.current = null;
        }, 8000);
    }, []);

    useEffect(() => {
        showControlsForAWhile();
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    const toggleMute = async () => {
        await localParticipant?.setMicrophoneEnabled(!!isMuted);
    };

    const toggleVideo = async () => {
        await localParticipant?.setCameraEnabled(!!isVideoOff);
    };

    const handleLocalVideoClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setLayout(prev => prev === 'pip' ? 'split' : 'pip');
    }, []);

    const handleContainerTap = useCallback(() => {
        if (controlsVisible) {
            setControlsVisible(false);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = null;
            }
            return;
        }
        showControlsForAWhile();
    }, [controlsVisible, showControlsForAWhile]);

    return (
        <div
            className="relative w-full h-full flex flex-col bg-black overflow-hidden"
            onClick={handleContainerTap}
        >
            <RoomAudioRenderer />
            
            {/* Blurred background */}
            <img
                src={receiverAvatar}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 pointer-events-none scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

            {/* Main Content Area */}
            <div className={`relative w-full h-full flex transition-all duration-500 ${layout === 'split' ? 'flex-col gap-2 p-2' : ''}`}>

                {/* Remote Video Area */}
                <div className={`${layout === 'split' ? 'relative flex-1 w-full' : 'absolute inset-0 w-full h-full'}`}>
                    {isConnected ? (
                        <RemoteVideo
                            remoteTrack={remoteTrack}
                            receiverName={receiverName}
                            layout={layout}
                        />
                    ) : (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10 p-6 text-center">
                            <ParticipantAvatar
                                src={receiverAvatar}
                                name={receiverName}
                                size="xl"
                                isSpeaking={false}
                                className="mb-10 shadow-2xl scale-110 ring-8 ring-white/5"
                            />
                            <h2 className="text-4xl font-extrabold text-white mb-3 drop-shadow-2xl">
                                {receiverName}
                            </h2>
                            <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                <p className="text-white/90 font-bold tracking-[0.2em] animate-pulse uppercase text-[10px]">
                                    establishing secure connection...
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Video - PiP or Split Bottom */}
                <div
                    onClick={handleLocalVideoClick}
                    className={`
                        transition-all duration-500 ease-in-out z-50
                        ${layout === 'split'
                            ? 'relative flex-1 w-full'
                            : 'absolute top-6 right-6 w-[100px] h-[150px] rounded-2xl shadow-2xl border-2 border-white/30 overflow-hidden'
                        }
                    `}
                >
                    <LocalVideo
                        localTrack={localTrack}
                        isVideoOff={isVideoOff}
                        isMuted={isMuted}
                        layout="mobile"
                    />
                </div>
            </div>

            {/* Top Left: Timer */}
            <div className="absolute left-6 top-8 z-[50]">
                <CallTimer 
                    isConnected={isConnected} 
                    balance={balance}
                    rpm={rpm}
                    startTime={startTime}
                />
            </div>

            {/* Controls Overlay */}
            <div
                className={`absolute left-6 top-1/2 -translate-y-1/2 z-[60] transition-all duration-500 ease-spring ${controlsVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <MobileCallControls
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onDisconnect={onDisconnect}
                    showVideoControl={true}
                />
            </div>

            {/* Bottom Info Bar */}
            <div className={`absolute bottom-8 left-0 right-0 z-40 px-8 transition-all duration-500 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">Live Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallMobileView;
