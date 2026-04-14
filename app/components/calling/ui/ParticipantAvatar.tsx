import React, { useState } from 'react';
import Image from 'next/image';

interface ParticipantAvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isSpeaking?: boolean;
    className?: string;
}

const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
    src,
    name,
    size = 'md',
    isSpeaking = false,
    className = '',
}) => {
    const [imgError, setImgError] = useState(false);
    const fallbackImage = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name);

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
    };

    // Determine what to display as the image source
    const displaySrc = (imgError || !src) ? fallbackImage : src;

    const handleImageError = () => setImgError(true);

    return (
        <div className={`relative flex items-center justify-center rounded-full ${className}`}>
            {/* Outer golden aura — always visible, pulses when speaking */}
            <div className={`absolute -inset-4 rounded-full transition-all duration-500 ${
                isSpeaking
                    ? 'bg-amber-400/15 shadow-[0_0_40px_8px_rgba(245,158,11,0.15)]'
                    : 'bg-amber-400/[0.04]'
            }`} style={isSpeaking ? { animation: 'pa-auraPulse 2s ease-in-out infinite' } : undefined} />

            {/* Speaking rings */}
            {isSpeaking && (
                <>
                    <div className="absolute -inset-2 rounded-full border-2 border-amber-400/30" style={{ animation: 'pa-speakRing 1.5s ease-out infinite' }} />
                    <div className="absolute -inset-5 rounded-full border border-orange-400/15" style={{ animation: 'pa-speakRing 2s ease-out infinite 0.3s' }} />
                </>
            )}

            {/* Decorative ring — subtle sacred geometry feel */}
            <div className="absolute -inset-2 rounded-full border border-amber-300/[0.08]" />

            <div
                className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden relative z-10 bg-gray-100 transition-all duration-300
          ${isSpeaking
            ? 'border-[3px] border-amber-400/70 shadow-[0_0_24px_4px_rgba(245,158,11,0.2)]'
            : 'border-[3px] border-white/30 shadow-2xl'
          }
        `}
            >
                <img
                    src={displaySrc}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                />
            </div>

            <style jsx global>{`
                @keyframes pa-auraPulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.08); opacity: 1; }
                }
                @keyframes pa-speakRing {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.3); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default ParticipantAvatar;
