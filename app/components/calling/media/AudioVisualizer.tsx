import React from 'react';

interface AudioVisualizerProps {
    isSpeaking: boolean;
    speakerName?: string;
    className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    isSpeaking,
    speakerName = "",
    className = ""
}) => {
    // 5 groups of 5 bars each
    const barGroups = Array.from({ length: 5 }).map((_, groupIndex) => {
        const xOffset = groupIndex * 48;

        const barsData = [
            { rx: 2.5, y: 15, h: 12.5 },   // Outer Left
            { rx: 12.5, y: 7.5, h: 27.5 }, // Inner Left
            { rx: 22.5, y: 0, h: 42.5 },   // Center
            { rx: 32.5, y: 7.5, h: 27.5 }, // Inner Right
            { rx: 42.5, y: 15, h: 12.5 }   // Outer Right
        ];

        return barsData.map((bar, barIndex) => {
            const delay = (groupIndex * 5 + barIndex) * 0.05;
            return (
                <rect
                    key={`bar-${groupIndex}-${barIndex}`}
                    x={xOffset + bar.rx - 2.5}
                    y={bar.y}
                    width="5"
                    height={bar.h}
                    rx="2.5"
                    fill="white"
                    className={`transition-all duration-300 ${isSpeaking ? 'animate-svg-wave' : 'opacity-40'}`}
                    style={{
                        animationDelay: `${delay}s`,
                        transformOrigin: `${xOffset + bar.rx}px ${bar.y + bar.h / 2}px`,
                        willChange: 'transform'
                    } as any}
                />
            );
        });
    });

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg width="237" height="73" viewBox="0 0 237 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                    {barGroups}
                </g>

                {isSpeaking && speakerName && (
                    <text
                        x="118.5"
                        y="68"
                        textAnchor="middle"
                        fill="white"
                        fillOpacity="0.66"
                        className="text-[12px] font-medium tracking-wide pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-300"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        {speakerName} is speaking
                    </text>
                )}
            </svg>

            <style jsx global>{`
                @keyframes svg-wave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.8); }
                }
                .animate-svg-wave {
                    animation: svg-wave 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default AudioVisualizer;
