import React from 'react';
import ParticipantAvatar from './ParticipantAvatar';

interface ParticipantHeaderProps {
    name: string;
    avatar?: string;
    isConnected: boolean;
    className?: string;
}

const ParticipantHeader: React.FC<ParticipantHeaderProps> = ({
    name,
    avatar,
    isConnected,
    className = ""
}) => {
    return (
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl ${className}`}>
            <ParticipantAvatar
                name={name}
                src={avatar}
                size="sm"
                isSpeaking={false}
            />
            <div className="flex flex-col pr-3">
                <h3 className="text-sm font-bold text-white leading-tight drop-shadow-sm">{name}</h3>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`} />
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isConnected ? 'text-green-400' : 'text-white/60 animate-pulse'}`}>
                        {isConnected ? 'connected' : 'connecting...'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ParticipantHeader;
