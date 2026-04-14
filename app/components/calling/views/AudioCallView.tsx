import React, { useEffect, useState } from 'react';
import { useLocalParticipant, useRemoteParticipants } from "@livekit/components-react";
import ParticipantAvatar from '../ui/ParticipantAvatar';
import AudioVisualizer from '../media/AudioVisualizer';
import CallControls from '../controls/CallControls';
import CallTimer from '../ui/CallTimer';
import DakshinaModal from '../ui/DakshinaModal';

interface AudioCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverId: string;
    receiverAvatar?: string;
    callData?: { balance: string; rpm: string; startTime: string; userJoinTime?: string };
    sendGift?: (gift: any, receiverId: string, receiverName: string) => Promise<void>;
    gifts?: any[];
    fetchGifts?: () => void;
}

const AudioCallView: React.FC<AudioCallViewProps> = ({ onDisconnect, receiverName, receiverId, receiverAvatar, callData, sendGift, gifts, fetchGifts }) => {
    const [showDakshina, setShowDakshina] = useState(false);
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

    const handleDakshinaSend = async (gift: any) => {
        if (sendGift && receiverId) {
            await sendGift(gift, receiverId, receiverName);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col">
            {/* ═══ BACKGROUND ═══ */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#16082a] to-[#0d0819]" />

            {/* Warm saffron glow */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.035] rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-400/[0.025] rounded-full blur-[120px] pointer-events-none" />

            {/* Subtle mandala rings */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03]">
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-amber-300 rounded-full" style={{ animation: 'acv-spin 70s linear infinite' }} />
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-orange-400 rounded-full" style={{ animation: 'acv-spin 50s linear infinite reverse' }} />
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border border-amber-200 rounded-full" style={{ animation: 'acv-spin 30s linear infinite' }} />
            </div>

            {/* Golden floating particles */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[12%] left-[8%] w-1 h-1 bg-amber-400/30 rounded-full" style={{ animation: 'acv-float 9s ease-in-out infinite' }} />
                <div className="absolute top-[25%] right-[12%] w-1.5 h-1.5 bg-orange-300/20 rounded-full" style={{ animation: 'acv-float 12s ease-in-out infinite 2s' }} />
                <div className="absolute bottom-[30%] left-[15%] w-1 h-1 bg-amber-300/25 rounded-full" style={{ animation: 'acv-float 8s ease-in-out infinite 4s' }} />
                <div className="absolute top-[55%] right-[10%] w-0.5 h-0.5 bg-orange-400/30 rounded-full" style={{ animation: 'acv-float 7s ease-in-out infinite 1s' }} />
            </div>

            {/* ═══ MAIN LAYOUT — flexbox column with proper spacing ═══ */}
            <div className="relative z-10 flex flex-col h-full">

                {/* ── TOP: Timer only (no duplicate name) ── */}
                <div className="flex-shrink-0 pt-4 pb-2 px-5 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
                        {isConnected ? (
                            <CallTimer
                                isConnected={isConnected}
                                balance={callData?.balance}
                                rpm={callData?.rpm}
                                startTime={callData?.userJoinTime || callData?.startTime}
                            />
                        ) : (
                            <span className="text-white/60 text-xs font-medium animate-pulse">Connecting...</span>
                        )}
                    </div>
                </div>

                {/* ── CENTER: Avatar + Name + Visualizer ── */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0" style={{ animation: 'acv-fadeIn 0.5s ease-out' }}>
                    {/* Avatar with connecting/speaking effects */}
                    <div className="relative mb-5">
                        {!isConnected && (
                            <>
                                <div className="absolute -inset-3 rounded-full border-2 border-orange-400/25" style={{ animation: 'acv-pingRing 2s cubic-bezier(0,0,0.2,1) infinite' }} />
                                <div className="absolute -inset-6 rounded-full border border-orange-400/10" style={{ animation: 'acv-pingRing 3s cubic-bezier(0,0,0.2,1) infinite' }} />
                            </>
                        )}
                        <ParticipantAvatar
                            name={receiverName}
                            src={receiverAvatar}
                            size="lg"
                            isSpeaking={isConnected ? isReceiverSpeaking : false}
                        />
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight drop-shadow-lg">{receiverName}</h2>

                    {!isConnected && (
                        <p className="text-white/40 text-sm font-medium animate-pulse">Calling...</p>
                    )}

                    {/* Audio Visualizer — inline, no card wrapper */}
                    {isConnected && (
                        <div className="w-full max-w-xs mt-5">
                            <AudioVisualizer
                                isSpeaking={isSpeaking}
                                speakerName={isReceiverSpeaking ? receiverName : 'You'}
                            />
                        </div>
                    )}
                </div>

                {/* ── BOTTOM: Dakshina + Controls ── */}
                <div className="flex-shrink-0 pb-6 pt-4 flex flex-col items-center gap-4">
                    {/* Dakshina button */}
                    {isConnected && (
                        <button
                            onClick={() => setShowDakshina(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-400/25 backdrop-blur-md hover:from-amber-500/30 hover:to-orange-500/25 transition-all duration-300 group"
                            style={{ animation: 'acv-fadeIn 0.6s ease-out' }}
                        >
                            <span className="text-base group-hover:scale-110 transition-transform">🙏</span>
                            <span className="text-amber-200/90 text-xs font-semibold tracking-wide">Offer Dakshina</span>
                        </button>
                    )}
                    <CallControls
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                        onDisconnect={onDisconnect}
                        showVideoControl={false}
                    />
                </div>
            </div>

            {/* ═══ DAKSHINA MODAL ═══ */}
            <DakshinaModal
                isOpen={showDakshina}
                onClose={() => setShowDakshina(false)}
                onSend={handleDakshinaSend}
                receiverName={receiverName}
                gifts={gifts}
                onFetchGifts={fetchGifts}
            />

            <style jsx global>{`
                @keyframes acv-fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes acv-pingRing {
                    75%, 100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes acv-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes acv-float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-18px) translateX(6px); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default AudioCallView;
