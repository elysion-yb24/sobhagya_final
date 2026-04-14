import React, { useState, useEffect, useRef } from 'react';
import { useTracks, useLocalParticipant, useRemoteParticipants, useRoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { Track, Room, RoomEvent } from "livekit-client";
import LocalVideo from '../media/LocalVideo';
import RemoteVideo from '../media/RemoteVideo';
import MobileCallControls from '../controls/MobileCallControls';
import CallTimer from '../ui/CallTimer';
import ParticipantAvatar from '../ui/ParticipantAvatar';
import DakshinaModal from '../ui/DakshinaModal';

interface VideoCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverAvatar?: string;
    balance?: string;
    rpm?: string;
    startTime?: string;
    sendGift?: (gift: any, receiverId: string, receiverName: string) => Promise<void>;
    receiverId?: string;
    gifts?: any[];
    fetchGifts?: () => void;
}

const VideoCallMobileView: React.FC<VideoCallViewProps> = ({
    onDisconnect,
    receiverName,
    receiverAvatar,
    balance,
    rpm,
    startTime,
    sendGift,
    receiverId,
    gifts,
    fetchGifts
}) => {
    const [showDakshina, setShowDakshina] = useState(false);
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const remoteParticipant = remoteParticipants[0];

    let room: Room | undefined;
    try { room = useRoomContext(); } catch (e) {}

    // Primary: useTracks with placeholders
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true },
         { source: Track.Source.ScreenShare, withPlaceholder: false }],
        { onlySubscribed: false }
    );
    const localTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteCameraTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteScreenTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare);
    const hookRemoteTrack = remoteCameraTrack || remoteScreenTrack;

    // Fallback: direct room event listener
    const [directRemoteTrack, setDirectRemoteTrack] = useState<any>(null);
    const directTrackRef = useRef<any>(null);

    useEffect(() => {
        if (!room) return;
        const scan = () => {
            let found: any = null;
            room!.remoteParticipants.forEach((p: any) => {
                if (found) return;
                const cam = p.getTrackPublication(Track.Source.Camera);
                if (cam?.isSubscribed && cam.track) { found = { participant: p, publication: cam, source: Track.Source.Camera }; }
                if (!found) {
                    const scr = p.getTrackPublication(Track.Source.ScreenShare);
                    if (scr?.isSubscribed && scr.track) { found = { participant: p, publication: scr, source: Track.Source.ScreenShare }; }
                }
            });
            if (found !== directTrackRef.current) { directTrackRef.current = found; setDirectRemoteTrack(found); }
        };
        const h = () => scan();
        room.on(RoomEvent.TrackSubscribed, h);
        room.on(RoomEvent.TrackUnsubscribed, h);
        room.on(RoomEvent.TrackPublished, h);
        room.on(RoomEvent.ParticipantConnected, h);
        scan();
        return () => { room!.off(RoomEvent.TrackSubscribed, h); room!.off(RoomEvent.TrackUnsubscribed, h); room!.off(RoomEvent.TrackPublished, h); room!.off(RoomEvent.ParticipantConnected, h); };
    }, [room]);

    const remoteTrack = hookRemoteTrack || directRemoteTrack;

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isVideoOff = !localParticipant?.isCameraEnabled;
    const isConnected = !!remoteParticipant;
    const hasRemoteVideo = !!remoteTrack;


    const toggleMute = async () => {
        await localParticipant?.setMicrophoneEnabled(!!isMuted);
    };

    const toggleVideo = async () => {
        await localParticipant?.setCameraEnabled(!!isVideoOff);
    };

    const handleDakshinaSend = async (gift: any) => {
        if (sendGift && receiverId) {
            await sendGift(gift, receiverId, receiverName);
        }
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            <RoomAudioRenderer />

            {/* ═══ BACKGROUND ═══ */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#1a0e2e] to-[#0d0819] pointer-events-none" />

            {/* Subtle mandala rings */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-amber-300 rounded-full" style={{ animation: 'vcvm-spin 70s linear infinite' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-orange-400 rounded-full" style={{ animation: 'vcvm-spin 50s linear infinite reverse' }} />
            </div>

            {/* Golden floating particles */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[15%] left-[8%] w-1 h-1 bg-amber-400/30 rounded-full" style={{ animation: 'vcvm-float 9s ease-in-out infinite' }} />
                <div className="absolute top-[35%] right-[12%] w-1 h-1 bg-orange-300/20 rounded-full" style={{ animation: 'vcvm-float 11s ease-in-out infinite 2s' }} />
                <div className="absolute bottom-[20%] left-[18%] w-0.5 h-0.5 bg-amber-300/25 rounded-full" style={{ animation: 'vcvm-float 8s ease-in-out infinite 3s' }} />
            </div>

            {/* ═══ REMOTE VIDEO / STATES ═══ */}
            {isConnected && hasRemoteVideo ? (
                <div className="absolute inset-0 z-[2]">
                    <RemoteVideo remoteTrack={remoteTrack} receiverName={receiverName} layout="pip" />
                </div>
            ) : (
                <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative mb-6">
                        {!isConnected && (
                            <>
                                <div className="absolute -inset-3 rounded-full border-2 border-orange-400/25" style={{ animation: 'vcv-ping-ring 2s cubic-bezier(0,0,0.2,1) infinite' }} />
                                <div className="absolute -inset-6 rounded-full border border-orange-400/10" style={{ animation: 'vcv-ping-ring 3s cubic-bezier(0,0,0.2,1) infinite' }} />
                            </>
                        )}
                        <ParticipantAvatar
                            src={receiverAvatar}
                            name={receiverName}
                            size="xl"
                            isSpeaking={isConnected ? (remoteParticipant?.isSpeaking || false) : false}
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">{receiverName}</h2>
                    <p className="text-white/50 text-sm font-medium">
                        {isConnected ? 'Camera Off' : 'Calling...'}
                    </p>
                </div>
            )}

            {/* ═══ TOP BAR — timer pill ═══ */}
            <div className="absolute top-0 inset-x-0 z-30">
                <div className="bg-gradient-to-b from-black/60 to-transparent pt-4 pb-8 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                        <span className="text-white/80 text-xs font-medium">{receiverName}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.1]">
                        {isConnected ? (
                            <CallTimer isConnected={isConnected} balance={balance} rpm={rpm} startTime={startTime} />
                        ) : (
                            <span className="text-white/60 text-xs font-medium animate-pulse">Connecting...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ LOCAL PIP ═══ */}
            <div
                className="absolute top-20 right-4 w-[100px] h-[140px] z-40 rounded-2xl shadow-2xl border-2 border-white/15 overflow-hidden"
            >
                <LocalVideo localTrack={localTrack} isVideoOff={isVideoOff} isMuted={isMuted} layout="mobile" />
            </div>

            {/* ═══ BOTTOM CONTROLS + DAKSHINA ═══ */}
            <div className="absolute bottom-0 inset-x-0 z-30">
                <div className="bg-gradient-to-t from-black/70 to-transparent pt-10 pb-8 flex flex-col items-center gap-3">
                    {isConnected && (
                        <button
                            onClick={() => setShowDakshina(true)}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-400/25 backdrop-blur-md transition-all duration-300"
                        >
                            <span className="text-sm">🙏</span>
                            <span className="text-amber-200/90 text-[11px] font-semibold tracking-wide">Offer Dakshina</span>
                        </button>
                    )}
                    <MobileCallControls
                        isMuted={isMuted}
                        isVideoOff={isVideoOff}
                        onToggleMute={toggleMute}
                        onToggleVideo={toggleVideo}
                        onDisconnect={onDisconnect}
                        showVideoControl={true}
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
                @keyframes vcv-ping-ring {
                    75%, 100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes vcvm-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes vcvm-float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-16px) translateX(5px); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default VideoCallMobileView;
