import React, { useEffect, useState } from 'react';
import { useLocalParticipant, useRemoteParticipants, RoomAudioRenderer } from "@livekit/components-react";
import ParticipantAvatar from '../ui/ParticipantAvatar';
import AudioVisualizer from '../media/AudioVisualizer';
import MobileCallControls from '../controls/MobileCallControls';
import CallTimer from '../ui/CallTimer';
import DakshinaModal from '../ui/DakshinaModal';

interface AudioCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverId: string;
    receiverAvatar?: string;
    balance?: string;
    rpm?: string;
    startTime?: string;
    sendGift?: (gift: any, receiverId: string, receiverName: string) => Promise<void>;
    gifts?: any[];
    fetchGifts?: () => void;
}

const AudioCallMobileView: React.FC<AudioCallViewProps> = ({
    onDisconnect,
    receiverName,
    receiverId,
    receiverAvatar,
    balance,
    rpm,
    startTime,
    sendGift,
    gifts,
    fetchGifts
}) => {
    const [showDakshina, setShowDakshina] = useState(false);
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const remoteParticipant = remoteParticipants[0];

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isReceiverSpeaking = remoteParticipant?.isSpeaking || false;
    const isLocalSpeaking = localParticipant?.isSpeaking || false;
    const isSpeaking = isReceiverSpeaking || isLocalSpeaking;
    const isConnected = !!remoteParticipant;

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
            <RoomAudioRenderer />

            {/* ═══ BACKGROUND ═══ */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#16082a] to-[#0d0819]" />
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/[0.035] rounded-full blur-[140px] pointer-events-none" />

            {/* Subtle mandala rings */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03]">
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-amber-300 rounded-full" style={{ animation: 'acm-spin 65s linear infinite' }} />
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-orange-400 rounded-full" style={{ animation: 'acm-spin 45s linear infinite reverse' }} />
            </div>

            {/* Golden floating particles */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[10%] left-[12%] w-1 h-1 bg-amber-400/30 rounded-full" style={{ animation: 'acm-float 8s ease-in-out infinite' }} />
                <div className="absolute top-[28%] right-[10%] w-1 h-1 bg-orange-300/20 rounded-full" style={{ animation: 'acm-float 10s ease-in-out infinite 2s' }} />
                <div className="absolute bottom-[35%] left-[8%] w-0.5 h-0.5 bg-amber-300/25 rounded-full" style={{ animation: 'acm-float 9s ease-in-out infinite 3s' }} />
            </div>

            {/* ═══ MAIN LAYOUT ═══ */}
            <div className="relative z-10 flex flex-col h-full">

                {/* ── TOP: Timer pill ── */}
                <div className="flex-shrink-0 pt-4 pb-2 px-5 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
                        {isConnected ? (
                            <CallTimer isConnected={isConnected} balance={balance} rpm={rpm} startTime={startTime} />
                        ) : (
                            <span className="text-white/60 text-xs font-medium animate-pulse">Connecting...</span>
                        )}
                    </div>
                </div>

                {/* ── CENTER: Avatar + Name + Visualizer ── */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0" style={{ animation: 'acm-fadeIn 0.5s ease-out' }}>
                    <div className="relative mb-5">
                        {!isConnected && (
                            <>
                                <div className="absolute -inset-3 rounded-full border-2 border-orange-400/25" style={{ animation: 'acm-pingRing 2s cubic-bezier(0,0,0.2,1) infinite' }} />
                                <div className="absolute -inset-6 rounded-full border border-orange-400/10" style={{ animation: 'acm-pingRing 3s cubic-bezier(0,0,0.2,1) infinite' }} />
                            </>
                        )}
                        <ParticipantAvatar
                            name={receiverName}
                            src={receiverAvatar}
                            size="lg"
                            isSpeaking={isConnected ? isReceiverSpeaking : false}
                        />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1 tracking-tight drop-shadow-lg">{receiverName}</h2>

                    {!isConnected && (
                        <p className="text-white/40 text-sm font-medium animate-pulse">Calling...</p>
                    )}

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
                <div className="flex-shrink-0 pb-6 pt-4 flex flex-col items-center gap-3">
                    {isConnected && (
                        <button
                            onClick={() => setShowDakshina(true)}
                            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-400/25 backdrop-blur-md transition-all duration-300"
                        >
                            <span className="text-sm">🙏</span>
                            <span className="text-amber-200/90 text-[11px] font-semibold tracking-wide">Offer Dakshina</span>
                        </button>
                    )}
                    <MobileCallControls
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
                @keyframes acm-fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes acm-pingRing {
                    75%, 100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes acm-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes acm-float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-16px) translateX(5px); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default AudioCallMobileView;
