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
        <div className="relative flex flex-col items-center gap-4">
            {/* Speaker Menu */}
            {showSpeakerMenu && (
                <div
                    ref={menuRef}
                    className="absolute left-0 bottom-full mb-4 bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/50 min-w-[200px] z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <div className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wide">
                        Select Audio Output
                    </div>
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                        {audioDevices.length > 0 ? (
                            audioDevices.map((device) => (
                                <button
                                    key={device.deviceId}
                                    onClick={() => handleDeviceSelect(device.deviceId)}
                                    className={`text-left px-3 py-2 rounded-xl text-sm transition-all truncate flex items-center justify-between group ${selectedDeviceId === device.deviceId
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="truncate">{device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}</span>
                                    {selectedDeviceId === device.deviceId && (
                                        <span className="w-2 h-2 rounded-full bg-white ml-2 shrink-0 animate-pulse" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                                Default Speaker
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Vertical Controls Pill */}
            <div className="flex flex-col items-center gap-3 p-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                {/* Layout / Minimize */}
                <button
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/10 text-white hover:bg-white/20"
                >
                    <div className="scale-75"><MobileLayoutIcon /></div>
                </button>

                {/* Speaker Toggle */}
                <button
                    onClick={() => setShowSpeakerMenu(!showSpeakerMenu)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showSpeakerMenu ? 'bg-white text-black' : 'bg-white/90 text-black shadow-sm'}`}
                >
                    <div className="scale-75"><MobileSpeakerIcon /></div>
                </button>

                {showVideoControl && onToggleVideo && (
                    <button
                        onClick={onToggleVideo}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-white text-black shadow-sm'}`}
                    >
                        <div className="scale-75">{isVideoOff ? <MobileVideoOffIcon /> : <MobileVideoIcon />}</div>
                    </button>
                )}

                <button
                    onClick={onToggleMute}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-white text-black shadow-sm'}`}
                >
                    <div className="scale-75">{isMuted ? <MobileMuteIcon /> : <MobileUnMuteIcon />}</div>
                </button>

                <button
                    onClick={onDisconnect}
                    className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/40 mt-1"
                >
                    <div className="scale-90"><MobileEndCallIcon /></div>
                </button>
            </div>
        </div>
    );
};

export default MobileCallControls;
