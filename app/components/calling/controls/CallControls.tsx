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
    showFilterControl?: boolean;
}

const CallControls: React.FC<CallControlsProps> = ({
    isMuted,
    isVideoOff,
    onToggleMute,
    onToggleVideo,
    onDisconnect,
    showVideoControl = true,
    showFilterControl = false
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

    const baseControlButtonClass =
        "rounded-full flex items-center justify-center transition-all w-[clamp(2.1rem,4vw,2.75rem)] h-[clamp(2.1rem,4vw,2.75rem)] [&>svg]:w-[clamp(1.1rem,2.2vw,1.65rem)] [&>svg]:h-[clamp(1.1rem,2.2vw,1.65rem)]";

    return (
        <div className="relative flex flex-col items-center gap-2">
            {/* Speaker Menu */}
            {showSpeakerMenu && (
                <div
                    ref={menuRef}
                    className="absolute bottom-full mb-3 bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/50 min-w-[clamp(160px,24vw,200px)] z-50 animate-fade-in"
                >
                    <div className="text-[11px] sm:text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wide">
                        Select Speaker
                    </div>
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                        {audioDevices.length > 0 ? (
                            audioDevices.map((device) => (
                                <button
                                    key={device.deviceId}
                                    onClick={() => handleDeviceSelect(device.deviceId)}
                                    className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition-all truncate flex items-center justify-between group ${selectedDeviceId === device.deviceId
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-white/80 hover:shadow-sm'
                                        }`}
                                >
                                    <span className="truncate">{device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}</span>
                                    {selectedDeviceId === device.deviceId && (
                                        <span className="w-2 h-2 rounded-full bg-white ml-2 shrink-0 animate-pulse" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No speakers found</div>
                        )}
                        {audioDevices.length === 0 && (
                            <div className="px-3 py-2 text-xs text-red-400">
                                Note: Speaker switching requires browser permission.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center gap-[clamp(0.35rem,1.2vw,0.5rem)] p-[clamp(0.2rem,0.8vw,0.375rem)] bg-white/25 backdrop-blur-2xl rounded-full border border-white/40 z-40">
                {/* Speaker Toggle */}
                <button
                    onClick={() => setShowSpeakerMenu(!showSpeakerMenu)}
                    className={`${baseControlButtonClass} ${showSpeakerMenu ? 'bg-white text-blue-600 shadow-lg scale-105' : 'bg-white/90 text-gray-800 hover:bg-white'
                        }`}
                    title="Change Speaker"
                >
                    <Speaker />
                </button>

                <button
                    onClick={onToggleMute}
                    className={`${baseControlButtonClass} ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/90 text-gray-800 hover:bg-white'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MuteIcon /> : <UnMuteIcon />}
                </button>

                {showVideoControl && onToggleVideo && (
                    <button
                        onClick={onToggleVideo}
                        className={`${baseControlButtonClass} ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/90 text-gray-800 hover:bg-white'}`}
                        title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                    >
                        {isVideoOff ? <VideoOffIcon /> : <VideoOnIcon />}
                    </button>
                )}

                <button
                    onClick={onDisconnect}
                    className={`${baseControlButtonClass} bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30`}
                >
                    <CallEndIcon />
                </button>
            </div>
        </div>
    );
};

export default CallControls;
