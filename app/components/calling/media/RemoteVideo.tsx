import React, { useRef, useEffect, useState } from 'react';
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

    // Fallback: native video element for direct track attachment
    const nativeVideoRef = useRef<HTMLVideoElement>(null);
    const [useNativeFallback, setUseNativeFallback] = useState(false);

    // Extract the actual media track from the track reference
    const mediaTrack = remoteTrack?.publication?.track ?? remoteTrack?.publication?.videoTrack ?? null;

    useEffect(() => {
        if (!remoteTrack) {
            setUseNativeFallback(false);
            return;
        }

        // Give VideoTrack component 2s to render, then check if it worked
        const timer = setTimeout(() => {
            if (nativeVideoRef.current?.parentElement) {
                // Check if any sibling <video> from VideoTrack is actually playing
                const parent = nativeVideoRef.current.closest('[data-rv-container]');
                if (parent) {
                    const lkVideo = parent.querySelector('video:not([data-native-fallback])');
                    const isPlaying = lkVideo && (lkVideo as HTMLVideoElement).videoWidth > 0;
                    if (!isPlaying && mediaTrack) {
                        console.log('[RemoteVideo] VideoTrack not rendering, activating native fallback');
                        setUseNativeFallback(true);
                    }
                }
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [remoteTrack, mediaTrack]);

    // Attach track to native video element as fallback
    useEffect(() => {
        if (!useNativeFallback || !mediaTrack || !nativeVideoRef.current) return;

        try {
            mediaTrack.attach(nativeVideoRef.current);
            console.log('[RemoteVideo] Native fallback: track attached');
        } catch (e) {
            console.error('[RemoteVideo] Native fallback attach error:', e);
        }

        return () => {
            try {
                if (mediaTrack && nativeVideoRef.current) {
                    mediaTrack.detach(nativeVideoRef.current);
                }
            } catch (e) {}
        };
    }, [useNativeFallback, mediaTrack]);

    return (
        <div className={`${containerClasses} transition-all duration-500 ease-in-out`}>
            <div className={innerClasses + " relative"} data-rv-container>
                {remoteTrack ? (
                    <>
                        {!useNativeFallback && (
                            <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
                        )}
                        {/* Native video fallback - always in DOM for measurement, visible only when fallback active */}
                        <video
                            ref={nativeVideoRef}
                            data-native-fallback
                            autoPlay
                            playsInline
                            muted={false}
                            className={`w-full h-full object-cover absolute inset-0 ${useNativeFallback ? 'z-10' : 'sr-only'}`}
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0a2e]/80 via-[#16213e]/80 to-[#0f0c29]/80 backdrop-blur-md">
                        <div className="relative mb-6">
                            <div className="absolute -inset-2 rounded-full border-2 border-orange-400/30 animate-ping" />
                             <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-50"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        </div>
                        <p className="text-white/60 font-semibold tracking-[0.15em] animate-pulse uppercase text-xs">Connecting to {receiverName}...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoteVideo;
