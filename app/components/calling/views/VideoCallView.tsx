import React, { useState, useEffect, useRef } from 'react';
import { useTracks, useLocalParticipant, useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import LocalVideo from '../media/LocalVideo';
import RemoteVideo from '../media/RemoteVideo';
import CallControls from '../controls/CallControls';
import CallTimer from '../ui/CallTimer';
import ParticipantAvatar from '../ui/ParticipantAvatar';
import DakshinaModal from '../ui/DakshinaModal';

interface VideoCallViewProps {
    onDisconnect: () => void;
    receiverName: string;
    receiverAvatar?: string;
    callData?: { balance: string; rpm: string; startTime: string; userJoinTime?: string };
    sendGift?: (gift: any, receiverId: string, receiverName: string) => Promise<void>;
    receiverId?: string;
    gifts?: any[];
    fetchGifts?: () => void;
}

const VideoCallView: React.FC<VideoCallViewProps> = ({ onDisconnect, receiverName, receiverAvatar, callData, sendGift, receiverId, gifts, fetchGifts }) => {
    const [showDakshina, setShowDakshina] = useState(false);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const remoteParticipant = remoteParticipants[0];

    let room: any;
    try { room = useRoomContext(); } catch (e) {}

    // Primary: useTracks hook
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true },
         { source: Track.Source.ScreenShare, withPlaceholder: false }],
        { onlySubscribed: false }
    );
    const localTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteCameraTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteScreenTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare);
    const hookRemoteTrack = remoteCameraTrack || remoteScreenTrack;

    // Fallback: direct room event listener for remote video tracks
    const [directRemoteTrack, setDirectRemoteTrack] = useState<any>(null);
    const directTrackRef = useRef<any>(null);

    useEffect(() => {
        if (!room) return;

        const scanForRemoteVideo = () => {
            let found: any = null;
            room.remoteParticipants.forEach((participant: any) => {
                if (found) return;
                const cameraPub = participant.getTrackPublication(Track.Source.Camera);
                if (cameraPub?.isSubscribed && cameraPub.track) {
                    found = { participant, publication: cameraPub, source: Track.Source.Camera };
                }
                if (!found) {
                    const screenPub = participant.getTrackPublication(Track.Source.ScreenShare);
                    if (screenPub?.isSubscribed && screenPub.track) {
                        found = { participant, publication: screenPub, source: Track.Source.ScreenShare };
                    }
                }
            });
            if (found !== directTrackRef.current) {
                directTrackRef.current = found;
                setDirectRemoteTrack(found);
            }
        };

        const onTrackSubscribed = () => { scanForRemoteVideo(); };
        const onTrackUnsubscribed = () => { scanForRemoteVideo(); };

        room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
        room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
        room.on(RoomEvent.TrackPublished, onTrackSubscribed);
        room.on(RoomEvent.ParticipantConnected, onTrackSubscribed);

        // Scan immediately
        scanForRemoteVideo();

        return () => {
            room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
            room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
            room.off(RoomEvent.TrackPublished, onTrackSubscribed);
            room.off(RoomEvent.ParticipantConnected, onTrackSubscribed);
        };
    }, [room]);

    // Use hook result first, fallback to direct room scan
    const remoteTrack = hookRemoteTrack || directRemoteTrack;

    const isMuted = !localParticipant?.isMicrophoneEnabled;
    const isVideoOff = !localParticipant?.isCameraEnabled;
    const isConnected = !!remoteParticipant;
    const hasRemoteVideo = !!remoteTrack;

    // Debug logging
    useEffect(() => {
        console.log('[VideoCallView] Track state:', {
            tracksFromHook: tracks.length,
            hookTracks: tracks.map(t => `${t.participant?.identity}:${t.source}:local=${t.participant?.isLocal}`),
            hookRemoteTrack: !!hookRemoteTrack,
            directRemoteTrack: !!directRemoteTrack,
            finalRemoteTrack: !!remoteTrack,
            isConnected,
            remoteParticipantIdentity: remoteParticipant?.identity,
            remoteParticipantCamera: remoteParticipant?.isCameraEnabled,
            remotePubs: remoteParticipant
                ? Array.from(remoteParticipant.trackPublications.values()).map((p: any) =>
                    `${p.source}:kind=${p.kind}:sub=${p.isSubscribed}:track=${!!p.track}`
                ) : [],
        });
    }, [tracks, hookRemoteTrack, directRemoteTrack, remoteTrack, isConnected, remoteParticipant]);

    const hasConnected = React.useRef(false);


    useEffect(() => {
        if (isConnected) {
            hasConnected.current = true;
        }
    }, [isConnected]);


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

    const handleDakshinaSend = async (gift: any) => {
        if (sendGift && receiverId) {
            await sendGift(gift, receiverId, receiverName);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-black">
            {/* ═══ BACKGROUND ═══ */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#1a0e2e] to-[#0d0819] pointer-events-none" />

            {/* Subtle mandala rings */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-300 rounded-full" style={{ animation: 'vcv-spin 80s linear infinite' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-orange-400 rounded-full" style={{ animation: 'vcv-spin 55s linear infinite reverse' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] border border-amber-200 rounded-full" style={{ animation: 'vcv-spin 35s linear infinite' }} />
            </div>

            {/* Golden floating particles */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[15%] left-[10%] w-1 h-1 bg-amber-400/30 rounded-full" style={{ animation: 'vcv-float 8s ease-in-out infinite' }} />
                <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-orange-300/20 rounded-full" style={{ animation: 'vcv-float 11s ease-in-out infinite 2s' }} />
                <div className="absolute bottom-[25%] left-[20%] w-1 h-1 bg-amber-300/25 rounded-full" style={{ animation: 'vcv-float 9s ease-in-out infinite 4s' }} />
                <div className="absolute top-[60%] right-[8%] w-0.5 h-0.5 bg-orange-400/30 rounded-full" style={{ animation: 'vcv-float 7s ease-in-out infinite 1s' }} />
                <div className="absolute top-[45%] left-[5%] w-1 h-1 bg-amber-400/20 rounded-full" style={{ animation: 'vcv-float 10s ease-in-out infinite 3s' }} />
            </div>

            {/* ═══ REMOTE VIDEO / STATES ═══ */}
            {isConnected && hasRemoteVideo ? (
                <div className="absolute inset-0 z-[2]">
                    <RemoteVideo remoteTrack={remoteTrack} receiverName={receiverName} layout="pip" />
                </div>
            ) : (
                /* Connecting or Camera-Off — centred avatar */
                <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6">
                    {/* Subtle background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative mb-6" style={{ animation: 'vcv-fadeSlideIn 0.5s ease-out' }}>
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

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-lg" style={{ animation: 'vcv-fadeSlideIn 0.6s ease-out' }}>
                        {receiverName}
                    </h2>

                    <p className="text-white/50 text-sm font-medium" style={{ animation: 'vcv-fadeSlideIn 0.7s ease-out' }}>
                        {isConnected ? 'Camera Off' : (localTrack ? 'Calling...' : 'Initializing camera...')}
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
            </div>

            {/* ═══ LOCAL PIP ═══ */}
            <div
                className="absolute top-20 right-4 w-[100px] h-[140px] md:w-[130px] md:h-[180px] z-40 rounded-2xl shadow-2xl border-2 border-white/15 overflow-hidden transition-all duration-500"
            >
                <LocalVideo
                    localTrack={localTrack}
                    isVideoOff={isVideoOff}
                    isMuted={isMuted}
                    layout="mobile"
                />
            </div>

            {/* ═══ BOTTOM CONTROLS + DAKSHINA ═══ */}
            <div className="absolute bottom-0 inset-x-0 z-30">
                <div className="bg-gradient-to-t from-black/70 to-transparent pt-10 pb-8 flex flex-col items-center gap-4">
                    {/* Actions Row */}
                    <div className="flex items-center gap-3">
                        {/* Dakshina button — shown when connected */}
                        {isConnected && (
                            <button
                                onClick={() => setShowDakshina(true)}
                                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-400/25 backdrop-blur-md hover:from-amber-500/30 hover:to-orange-500/25 transition-all duration-300 group"
                                style={{ animation: 'vcv-fadeSlideIn 0.6s ease-out' }}
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">🙏</span>
                                <span className="text-amber-200/90 text-xs font-semibold tracking-wide">Offer Dakshina</span>
                            </button>
                        )}
                        {/* Scrollable Widget Toggle */}
                        {isConnected && (
                            <button
                                onClick={() => setIsWidgetOpen(true)}
                                className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group xl:hidden"
                                style={{ animation: 'vcv-fadeSlideIn 0.6s ease-out', animationDelay: '0.1s', animationFillMode: 'both' }}
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">📝</span>
                                <span className="text-white/90 text-xs font-semibold tracking-wide">Notes</span>
                            </button>
                        )}
                    </div>
                    <CallControls
                        isMuted={isMuted}
                        isVideoOff={isVideoOff}
                        onToggleMute={toggleMute}
                        onToggleVideo={toggleVideo}
                        onDisconnect={onDisconnect}
                        showVideoControl={true}
                    />
                </div>
            </div>

            {/* ═══ SCROLLABLE WIDGET (BOTTOM SHEET) ═══ */}
            <div 
                className={`absolute bottom-0 left-0 right-0 bg-[#16082a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl transition-transform duration-500 ease-in-out z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${
                    isWidgetOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{ height: '65vh' }}
            >
                {/* Drag Handle / Header */}
                <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-4 px-6 border-b border-white/5 relative">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mb-4" />
                    <h3 className="text-white font-semibold text-lg tracking-wide">Consultation Notes</h3>
                    <button 
                        onClick={() => setIsWidgetOpen(false)}
                        className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                    {/* Simulated Content */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <h4 className="text-amber-400 text-sm font-medium mb-1">Current Transit Insights</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Focusing on relationships and inner harmony as major planetary transits align in your house of partnership. Keep emotions grounded during the call.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <h4 className="text-amber-400 text-sm font-medium mb-1">Suggested Remedies</h4>
                        <ul className="text-white/70 text-sm leading-relaxed list-disc list-inside space-y-1 mt-2">
                            <li>Morning meditation for 10 minutes.</li>
                            <li>Offer water to the Sun daily.</li>
                            <li>Wear lighter colors on Thursdays.</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <h4 className="text-amber-400 text-sm font-medium mb-1">Caller Details</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-white/70">
                            <div><span className="text-white/40">Status:</span> Premium Active</div>
                            <div><span className="text-white/40">Language:</span> Hindi/English</div>
                            <div><span className="text-white/40">Topic:</span> Career & Love</div>
                            <div><span className="text-white/40">Mood:</span> Anxious / Seeking Clarity</div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <h4 className="text-amber-400 text-sm font-medium mb-1">Previous Session</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            In the last physical meeting, discussed long-term goals. Caller mentioned a potential job relocation. Worth asking for a follow-up.
                        </p>
                    </div>
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
                @keyframes vcv-fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes vcv-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes vcv-float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-20px) translateX(8px); opacity: 0.7; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );

};

export default VideoCallView;
