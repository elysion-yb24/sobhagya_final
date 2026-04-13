import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocalParticipant, useRemoteParticipants, RoomAudioRenderer } from "@livekit/components-react";
import ParticipantAvatar from '../ui/ParticipantAvatar';
import AudioVisualizer from '../media/AudioVisualizer';
import MobileCallControls from '../controls/MobileCallControls';
import CallTimer from '../ui/CallTimer';

interface AudioCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverId: string;
    receiverAvatar?: string;
    balance?: string;
    rpm?: string;
    startTime?: string;
}

const AudioCallMobileView: React.FC<AudioCallViewProps> = ({
    onDisconnect,
    receiverName,
    receiverId,
    receiverAvatar,
    balance,
    rpm,
    startTime
}) => {
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const remoteParticipant = remoteParticipants[0];

    const [controlsVisible, setControlsVisible] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isReceiverSpeaking = remoteParticipant?.isSpeaking || false;
    const isLocalSpeaking = localParticipant?.isSpeaking || false;
    const isSpeaking = isReceiverSpeaking || isLocalSpeaking;
    const isConnected = !!remoteParticipant;

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

    const toggleMute = async () => {
        await localParticipant?.setMicrophoneEnabled(!!isMuted);
    };

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center"
            onClick={handleContainerTap}
        >
            <RoomAudioRenderer />
            
            {/* Background Blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src={receiverAvatar}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-[100px] opacity-40 scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-black/80" />
            </div>

            {/* Top Info: Timer */}
            <div className="absolute left-6 top-8 z-[50]">
                <CallTimer 
                    isConnected={isConnected} 
                    balance={balance}
                    rpm={rpm}
                    startTime={startTime}
                />
            </div>

            {/* Main Content: Avatar and Visualizer */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full px-8 -mt-20">
                <div className="relative mb-12">
                     {/* Rippling effects around avatar */}
                    {isSpeaking && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-white/5 animate-ping duration-1000" />
                            <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse duration-1500 scale-125" />
                        </>
                    )}
                    
                    <ParticipantAvatar
                        name={receiverName}
                        src={receiverAvatar}
                        size="xl"
                        isSpeaking={isConnected ? isReceiverSpeaking : false}
                        className={`transition-all duration-1000 ${isConnected ? 'scale-110 shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'scale-125 shadow-2xl opacity-50'}`}
                    />
                </div>

                {!isConnected ? (
                    <div className="text-center animate-in fade-in zoom-in duration-700">
                        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-2xl">{receiverName}</h2>
                        <div className="px-6 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mx-auto w-fit">
                            <p className="text-white/60 font-black tracking-[0.3em] animate-pulse uppercase text-[10px]">
                                connecting audio stream...
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
                        <h2 className="text-3xl font-bold text-white/90 mb-8 tracking-tight">{receiverName}</h2>
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 w-full max-w-[320px] shadow-2xl">
                             <AudioVisualizer
                                isSpeaking={isSpeaking}
                                speakerName={isReceiverSpeaking ? receiverName : 'You'}
                                className="w-full"
                             />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Overlay */}
            <div
                className={`absolute left-6 top-1/2 -translate-y-1/2 z-[60] transition-all duration-500 ease-spring ${controlsVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <MobileCallControls
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    onDisconnect={onDisconnect}
                    showVideoControl={false}
                />
            </div>

            {/* Bottom Status Panel */}
            <div className={`absolute bottom-8 left-0 right-0 z-40 px-8 transition-all duration-500 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex items-center justify-center">
                    <p className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase">Secure End-to-End Encrypted</p>
                </div>
            </div>
        </div>
    );
};

export default AudioCallMobileView;
