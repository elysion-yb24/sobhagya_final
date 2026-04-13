import React from 'react';
import { VideoTrack } from "@livekit/components-react";

interface RemoteVideoProps {
    remoteTrack: any;
    receiverName: string;
    layout: 'pip' | 'split';
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({
    remoteTrack,
    receiverName,
    layout
}) => {
    const containerClasses = layout === 'split'
        ? 'relative flex-1 h-full'
        : 'absolute inset-0 z-0';

    const innerClasses = layout === 'split'
        ? 'w-full h-full overflow-hidden bg-black/20 rounded-2xl'
        : 'w-full h-full bg-black';

    return (
        <div className={`${containerClasses} transition-all duration-500 ease-in-out`}>
            <div className={innerClasses + " relative"}>
                {remoteTrack ? (
                    <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-md">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-40"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        </div>
                        <p className="text-white/80 font-medium tracking-tight text-lg animate-pulse uppercase text-xs">Connecting to {receiverName}...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoteVideo;
