import React from 'react';
import { VideoTrack } from "@livekit/components-react";

interface LocalVideoProps {
    localTrack: any;
    isVideoOff: boolean;
    isMuted: boolean;
    layout: 'pip' | 'split' | 'mobile';
    onToggleLayout?: () => void;
}

const LocalVideo: React.FC<LocalVideoProps> = ({
    localTrack,
    isVideoOff,
    isMuted,
    layout,
    onToggleLayout
}) => {
    return (
        <div className={`
            ${layout === 'split'
                ? 'relative flex-1 h-full rounded-[2rem] overflow-hidden border-4 border-white/20 bg-black/40'
                : layout === 'mobile'
                    ? 'w-full h-full object-cover' 
                    : 'absolute left-6 bottom-6 w-32 h-44 md:w-40 md:h-56 z-40 rounded-2xl shadow-2xl border-2 border-white/50 overflow-hidden'
            } transition-all duration-500 ease-in-out group
        `}>
            {localTrack && !isVideoOff ? (
                <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-md">
                    <div className="text-center">
                        <div className="flex justify-center mb-2 opacity-40">
                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 01 2-2h2m5.6 0h1.4a2 2 0 01 2 2v2M21 7l-2 3.5 2 3.5V7M2 2l20 20"/></svg>
                        </div>
                        <p className="text-white/60 text-xs font-medium">{isVideoOff ? 'Camera is off' : 'Initializing...'}</p>
                    </div>
                </div>
            )}

            {isMuted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                     <div className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center text-white shadow-lg animate-pulse">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 18.5V22M8 22h8"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                     </div>
                </div>
            )}
        </div>
    );
};

export default LocalVideo;
