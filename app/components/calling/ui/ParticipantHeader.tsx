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
        <div className={`flex items-center gap-3 p-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg ${className}`}>
            <ParticipantAvatar
                name={name}
                src={avatar}
                size="sm"
                isSpeaking={false}
            />
            <div className="flex flex-col pr-4">
                <h3 className="text-sm font-bold text-gray-800 leading-tight">{name}</h3>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isConnected ? 'text-green-600' : 'text-gray-500 animate-pulse'}`}>
                    {isConnected ? 'connected' : 'connecting...'}
                </p>
            </div>
        </div>
    );
};

export default ParticipantHeader;
