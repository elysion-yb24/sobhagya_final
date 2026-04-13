import React, { useState, useEffect, useCallback } from 'react';
import { useTracks, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import LocalVideo from '../media/LocalVideo';
import RemoteVideo from '../media/RemoteVideo';
import CallControls from '../controls/CallControls';
import CallTimer from '../ui/CallTimer';
import ParticipantAvatar from '../ui/ParticipantAvatar';

interface VideoCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverAvatar?: string;
    callData?: { balance: string; rpm: string; startTime: string; userJoinTime?: string };
}

const VideoCallView: React.FC<VideoCallViewProps> = ({ onDisconnect, receiverName, receiverAvatar, callData }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [layout, setLayout] = useState<'pip' | 'split'>('pip');
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const { localParticipant } = useLocalParticipant();

    const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
    const localTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteTrack = tracks.find(t => !t.participant.isLocal);

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isVideoOff = !localParticipant?.isCameraEnabled;
    const isConnected = !!remoteTrack;

    const hasConnected = React.useRef(false);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Set default layout based on screen size
    useEffect(() => {
        setLayout(isMobile ? 'pip' : 'split');
    }, [isMobile]);

    useEffect(() => {
        if (isConnected) {
            hasConnected.current = true;
        }
    }, [isConnected]);

    // Auto-hide controls on mobile
    const showControlsTemporarily = useCallback(() => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isMobile) {
            controlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
            }, 6000);
        }
    }, [isMobile]);

    useEffect(() => {
        showControlsTemporarily();
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [showControlsTemporarily]);

    // Handle connecting audio
    useEffect(() => {
        let audio: HTMLAudioElement | null = null;
        if (!isConnected && !hasConnected.current && localTrack) {
            audio = new Audio('/audio/caller.m4a');
            audio.loop = true;
            audio.play().catch(err => console.log("Audio play failed:", err));
        }
        return () => {
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        };
    }, [isConnected, localTrack]);

    const toggleMute = async () => {
        await localParticipant?.setMicrophoneEnabled(!!isMuted);
    };

    const toggleVideo = async () => {
        await localParticipant?.setCameraEnabled(!!isVideoOff);
    };

    const handleContainerTap = useCallback(() => {
        if (isMobile) {
            if (controlsVisible) {
                setControlsVisible(false);
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                    controlsTimeoutRef.current = null;
                }
            } else {
                showControlsTemporarily();
            }
        }
    }, [isMobile, controlsVisible, showControlsTemporarily]);

    return (
        <div
            className="relative w-full h-full overflow-hidden rounded-none md:rounded-[2.5rem]"
            onClick={handleContainerTap}
        >
            {/* Background */}
            <>
                {receiverAvatar ? (
                    <img
                        src={receiverAvatar}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-60 pointer-events-none"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-black pointer-events-none" />
                )}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            </>

            {/* Astrology decorative overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-10">
                <div className="absolute top-4 left-4 w-16 h-16 border border-white/30 rounded-full animate-rotate-slow" />
                <div className="absolute bottom-20 right-4 w-12 h-12 border border-white/20 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse' }} />
            </div>

            <div
                className={`relative z-10 w-full h-full ${layout === "split" ? "flex items-center gap-3 md:gap-5 p-3 md:p-5" : ""}`}
            >
                {/* Remote / Connecting */}
                <div
                    className={`${layout === "split"
                        ? "flex-1 h-full rounded-2xl md:rounded-[2rem] overflow-hidden relative"
                        : "w-full h-full flex items-center justify-center relative"
                    } transition-all duration-500`}
                >
                    {isConnected ? (
                        <RemoteVideo
                            remoteTrack={remoteTrack}
                            receiverName={receiverName}
                            layout={layout}
                        />
                    ) : (
                        <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                            {receiverAvatar ? (
                                <img
                                    src={receiverAvatar}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-80"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-orange-900/80 to-black/80" />
                            )}
                            <div className="absolute inset-0 bg-black/30" />

                            <div className="relative z-10 flex flex-col items-center animate-fade-in">
                                {/* Animated connecting ring */}
                                <div className="relative mb-6">
                                    <div className="absolute -inset-3 rounded-full border-2 border-orange-400/40 animate-ping" />
                                    <div className="absolute -inset-6 rounded-full border border-orange-300/20 animate-pulse" />
                                    <ParticipantAvatar
                                        src={receiverAvatar}
                                        name={receiverName}
                                        size="xl"
                                        isSpeaking={false}
                                        className="shadow-2xl ring-4 ring-orange-400/30"
                                    />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                                    {receiverName}
                                </h2>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                    <p className="text-white/90 font-semibold tracking-wide uppercase text-xs">
                                        {localTrack ? "connecting..." : "loading..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local PIP */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setLayout(layout === "pip" ? "split" : "pip");
                    }}
                    className={layout === 'pip'
                        ? 'absolute top-4 right-4 md:left-6 md:bottom-6 md:top-auto md:right-auto w-[90px] h-[130px] md:w-40 md:h-56 z-40 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/40 overflow-hidden cursor-pointer transition-all duration-500'
                        : 'cursor-pointer'
                    }
                >
                    <LocalVideo
                        localTrack={localTrack}
                        isVideoOff={isVideoOff}
                        isMuted={isMuted}
                        layout={layout === 'pip' ? 'mobile' : layout}
                        onToggleLayout={() => setLayout(layout === "pip" ? "split" : "pip")}
                    />
                </div>
            </div>

            {/* Timer - top left */}
            <div className={`absolute top-4 left-4 z-20 transition-all duration-500 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <CallTimer
                    isConnected={isConnected}
                    balance={callData?.balance}
                    rpm={callData?.rpm}
                    startTime={callData?.userJoinTime || callData?.startTime}
                />
            </div>

            {/* Controls */}
            <div
                className={`absolute z-20 transition-all duration-500 ease-in-out ${
                    isMobile
                        ? `bottom-0 left-0 right-0 flex justify-center pb-8 ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`
                        : 'bottom-6 right-6 flex flex-col items-center'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <CallControls
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onDisconnect={onDisconnect}
                    showVideoControl={true}
                />
            </div>

            {/* Bottom info bar - mobile only */}
            {isMobile && isConnected && (
                <div className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ${controlsVisible ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Live Session with {receiverName}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default VideoCallView;
