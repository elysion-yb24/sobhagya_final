import React, { useState, useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import MuteIcon from '../assets/MuteIcon';
import UnMuteIcon from '../assets/UnMuteIcon';
import VideoOffIcon from '../assets/VideoOffIcon';
import VideoOnIcon from '../assets/VideoOnIcon';
import Speaker from '../assets/Speaker';
import CallEndIcon from '../assets/CallEndIcon';

interface CallControlsProps {
    isMuted: boolean;
    isVideoOff?: boolean;
    onToggleMute: () => void;
    onToggleVideo?: () => void;
    onDisconnect: () => void;
    showVideoControl?: boolean;
}

const CallControls: React.FC<CallControlsProps> = ({
    isMuted,
    isVideoOff,
    onToggleMute,
    onToggleVideo,
    onDisconnect,
    showVideoControl = true,
}) => {
    let room: Room | undefined;
    try {
        room = useRoomContext();
    } catch (e) {
        console.log("CallControls used outside RoomContext");
    }

    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [showSpeakerMenu, setShowSpeakerMenu] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getDevices = async () => {
            try {
                if (!navigator.mediaDevices?.enumerateDevices) return;

                const devices = await navigator.mediaDevices.enumerateDevices();
                const outputDevices = devices.filter(d => d.kind === 'audiooutput');
                setAudioDevices(outputDevices);
            } catch (e) {
                console.log("Error enumerating devices", e);
            }
        };

        getDevices();
        navigator.mediaDevices?.addEventListener?.('devicechange', getDevices);
        return () => {
            navigator.mediaDevices?.removeEventListener?.('devicechange', getDevices);
        };
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowSpeakerMenu(false);
            }
        };
        if (showSpeakerMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSpeakerMenu]);

    const handleDeviceSelect = async (deviceId: string) => {
        try {
            if (room) {
                await room.switchActiveDevice('audiooutput', deviceId);
            }
            setSelectedDeviceId(deviceId);
            setShowSpeakerMenu(false);
        } catch (e) {
            console.log("Failed to switch audio output", e);
        }
    };

    return (
        <div className="relative">
            {/* Speaker Menu — dark theme, opens upward */}
            {showSpeakerMenu && (
                <div
                    ref={menuRef}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1c1033]/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 min-w-[220px] z-50"
                >
                    <div className="text-[10px] font-bold text-white/40 px-3 py-2 uppercase tracking-[0.2em]">
                        Audio Output
                    </div>
                    <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto">
                        {audioDevices.length > 0 ? (
                            audioDevices.map((device) => (
                                <button
                                    key={device.deviceId}
                                    onClick={() => handleDeviceSelect(device.deviceId)}
                                    className={`text-left px-3 py-2.5 rounded-xl text-xs transition-all truncate flex items-center gap-2 ${
                                        selectedDeviceId === device.deviceId
                                            ? 'bg-orange-500/15 text-orange-300'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                                    }`}
                                >
                                    {selectedDeviceId === device.deviceId && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                    )}
                                    <span className="truncate">{device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-xs text-white/30">Default speaker</div>
                        )}
                    </div>
                </div>
            )}

            {/* Horizontal controls — SVGs provide their own circular backgrounds */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => setShowSpeakerMenu(!showSpeakerMenu)}
                    className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ${showSpeakerMenu ? 'opacity-100 scale-105 bg-white/10' : 'opacity-80 hover:opacity-100 hover:bg-white/5'}`}
                    title="Speaker"
                >
                    <Speaker />
                </button>

                <button
                    onClick={onToggleMute}
                    className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ${isMuted ? 'opacity-100 scale-105 bg-white/10' : 'opacity-80 hover:opacity-100 hover:bg-white/5'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MuteIcon /> : <UnMuteIcon />}
                </button>

                {showVideoControl && onToggleVideo && (
                    <button
                        onClick={onToggleVideo}
                        className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ${isVideoOff ? 'opacity-100 scale-105 bg-white/10' : 'opacity-80 hover:opacity-100 hover:bg-white/5'}`}
                        title={isVideoOff ? "Camera On" : "Camera Off"}
                    >
                        {isVideoOff ? <VideoOffIcon /> : <VideoOnIcon />}
                    </button>
                )}

                <button
                    onClick={onDisconnect}
                    className="w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                    title="End Call"
                >
                    <CallEndIcon />
                </button>
            </div>
        </div>
    );
};

export default CallControls;
