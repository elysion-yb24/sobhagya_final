import React, { useEffect } from 'react';
import { useLocalParticipant, useRemoteParticipants } from "@livekit/components-react";
import ParticipantAvatar from '../ui/ParticipantAvatar';
import AudioVisualizer from '../media/AudioVisualizer';
import CallControls from '../controls/CallControls';
import CallTimer from '../ui/CallTimer';
import ParticipantHeader from '../ui/ParticipantHeader';

interface AudioCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverId: string;
    receiverAvatar?: string;
    callData?: { balance: string; rpm: string; startTime: string; userJoinTime?: string };
}

const AudioCallView: React.FC<AudioCallViewProps> = ({ onDisconnect, receiverName, receiverId, receiverAvatar, callData }) => {
    const { localParticipant } = useLocalParticipant();

    const remoteParticipants = useRemoteParticipants();
    const remoteParticipant = remoteParticipants[0];

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isReceiverSpeaking = remoteParticipant?.isSpeaking || false;
    const isLocalSpeaking = localParticipant?.isSpeaking || false;
    const isSpeaking = isReceiverSpeaking || isLocalSpeaking;
    const isConnected = !!remoteParticipant;

    // Track if we have ever connected to handle reconnection logic
    const hasConnected = React.useRef(false);

    useEffect(() => {
        if (isConnected) {
            hasConnected.current = true;
        }
    }, [isConnected]);

    // Handle connecting audio
    useEffect(() => {
        let audio: HTMLAudioElement | null = null;
        if (!isConnected && !hasConnected.current) {
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
    }, [isConnected]);

    const toggleMute = async () => {
        await localParticipant?.setMicrophoneEnabled(!!isMuted);
    };


    return (
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black/5 flex flex-col items-center justify-center">

            {/* Top Left Header - Only visible when connected */}
            {isConnected && (
                <div className="absolute top-6 left-6 z-30 animate-fade-in">
                    <ParticipantHeader
                        name={receiverName}
                        avatar={receiverAvatar}
                        isConnected={isConnected}
                    />
                </div>
            )}

            {/* Background Layer: Full Screen Profile Image with Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {receiverAvatar ? (
                    <img
                        src={receiverAvatar}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black" />
                )}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6 w-full">

                {/* Receiver Avatar & Connecting State - Only visible when NOT connected */}
                {!isConnected && (
                    <>
                        <div className="relative z-10 mb-8 shadow-2xl">
                            <ParticipantAvatar
                                name={receiverName}
                                src={receiverAvatar}
                                size="xl"
                                isSpeaking={false}
                            />
                        </div>
                        <div className="relative z-10 mb-12 animate-fade-in">
                            <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-sm">{receiverName}</h2>
                            <p className="text-white/70 font-semibold tracking-wide animate-pulse uppercase text-sm">connecting...</p>
                        </div>
                    </>
                )}

                {/* Audio Visualizer Waves - Only visible when connected */}
                {isConnected && (
                    <div className="relative z-10 w-full mb-20 animate-fade-in">
                        <AudioVisualizer
                            isSpeaking={isSpeaking}
                            speakerName={isReceiverSpeaking ? receiverName : 'You'}
                        />
                    </div>
                )}

                <div className="h-6 mb-8" />
            </div>

            {/* Vertical Controls - Fixed Position to the Right */}
            <div className="absolute bottom-6 right-6 flex flex-col items-center z-30">
                <CallTimer
                    isConnected={isConnected}
                    balance={callData?.balance}
                    rpm={callData?.rpm}
                    startTime={callData?.userJoinTime || callData?.startTime}
                />
                <CallControls
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    onDisconnect={onDisconnect}
                    showVideoControl={false}
                    showFilterControl={false}
                />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AudioCallView;
