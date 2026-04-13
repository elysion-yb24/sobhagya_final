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
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Animated Rings for Speaking */}
            {isSpeaking && (
                <>
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-blue-400/10 animate-pulse scale-110" />
                </>
            )}

            <div
                className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden border-4 border-white/80 shadow-xl relative z-10 bg-gray-100
        `}
            >
                <img
                    src={displaySrc}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                />
            </div>
        </div>
    );
};

export default ParticipantAvatar;
