import React, { useState, useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import {
    MobileMuteIcon,
    MobileUnMuteIcon,
    MobileVideoIcon,
    MobileVideoOffIcon,
    MobileEndCallIcon,
    MobileSpeakerIcon,
    MobileLayoutIcon
} from './MobileCallIcons';

interface CallControlsProps {
    isMuted: boolean;
    isVideoOff?: boolean;
    onToggleMute: () => void;
    onToggleVideo?: () => void;
    onDisconnect: () => void;
    showVideoControl?: boolean;
}

const MobileCallControls: React.FC<CallControlsProps> = ({
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
        // Expected if used outside RoomContext in some views
    }

    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [showSpeakerMenu, setShowSpeakerMenu] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
    const menuRef = useRef<HTMLDivElement>(null);

    const inputDevicesRef = useRef<MediaDeviceInfo[]>([]);

    const handleDeviceSelect = React.useCallback(async (deviceId: string) => {
        const canSetSinkId = typeof window !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;
        
        if (canSetSinkId && room) {
            try {
                await room.switchActiveDevice('audiooutput', deviceId);
                setSelectedDeviceId(deviceId);
                setShowSpeakerMenu(false);
                return;
            } catch (e) {
                console.log("Failed to switch audio output directly", e);
            }
        }

        // Fallback or closing
        setShowSpeakerMenu(false);
    }, [room]);

    useEffect(() => {
        const getDevices = async () => {
            try {
                if (!navigator.mediaDevices?.enumerateDevices) return;
                const devices = await navigator.mediaDevices.enumerateDevices();
                const outputDevices = devices.filter(d => d.kind === 'audiooutput');
                const inputDevices = devices.filter(d => d.kind === 'audioinput');

                inputDevicesRef.current = inputDevices;
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

    return (
        <div className="relative">
            {/* Speaker Menu — dark theme */}
            {showSpeakerMenu && (
                <div
                    ref={menuRef}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1c1033]/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 min-w-[220px] z-[100]"
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

            {/* Horizontal controls — WhatsApp style */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => setShowSpeakerMenu(!showSpeakerMenu)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        showSpeakerMenu ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    <MobileSpeakerIcon />
                </button>

                <button
                    onClick={onToggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isMuted ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    {isMuted ? <MobileMuteIcon /> : <MobileUnMuteIcon />}
                </button>

                {showVideoControl && onToggleVideo && (
                    <button
                        onClick={onToggleVideo}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isVideoOff ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {isVideoOff ? <MobileVideoOffIcon /> : <MobileVideoIcon />}
                    </button>
                )}

                <button
                    onClick={onDisconnect}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all duration-200"
                >
                    <MobileEndCallIcon />
                </button>
            </div>
        </div>
    );
};

export default MobileCallControls;
