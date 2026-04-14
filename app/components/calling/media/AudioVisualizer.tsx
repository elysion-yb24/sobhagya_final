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
    // Gradient colors for each group: orange -> amber -> gold -> amber -> orange
    const groupColors = [
        ['#F97316', '#FB923C'], // orange
        ['#F59E0B', '#FBBF24'], // amber
        ['#EAB308', '#FDE047'], // gold (center)
        ['#F59E0B', '#FBBF24'], // amber
        ['#F97316', '#FB923C'], // orange
    ];

    // 5 groups of 5 bars each
    const barGroups = Array.from({ length: 5 }).map((_, groupIndex) => {
        const xOffset = groupIndex * 48;
        const [colorStart, colorEnd] = groupColors[groupIndex];
        const gradientId = `bar-grad-${groupIndex}`;

        const barsData = [
            { rx: 2.5, y: 15, h: 12.5 },   // Outer Left
            { rx: 12.5, y: 7.5, h: 27.5 }, // Inner Left
            { rx: 22.5, y: 0, h: 42.5 },   // Center
            { rx: 32.5, y: 7.5, h: 27.5 }, // Inner Right
            { rx: 42.5, y: 15, h: 12.5 }   // Outer Right
        ];

        return [
            <defs key={`defs-${groupIndex}`}>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorEnd} />
                    <stop offset="100%" stopColor={colorStart} />
                </linearGradient>
            </defs>,
            ...barsData.map((bar, barIndex) => {
                const delay = (groupIndex * 5 + barIndex) * 0.05;
                return (
                    <rect
                        key={`bar-${groupIndex}-${barIndex}`}
                        x={xOffset + bar.rx - 2.5}
                        y={bar.y}
                        width="5"
                        height={bar.h}
                        rx="2.5"
                        fill={isSpeaking ? `url(#${gradientId})` : 'rgba(255,255,255,0.3)'}
                        className={`transition-all duration-300 ${isSpeaking ? 'animate-svg-wave' : ''}`}
                        style={{
                            animationDelay: `${delay}s`,
                            transformOrigin: `${xOffset + bar.rx}px ${bar.y + bar.h / 2}px`,
                            willChange: 'transform'
                        } as any}
                    />
                );
            })
        ];
    });

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg width="237" height="73" viewBox="0 0 237 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                    {barGroups}
                </g>
            </svg>

            {/* Speaker name below visualizer */}
            {isSpeaking && speakerName && (
                <p className="mt-3 text-xs font-semibold text-white/50 tracking-wider uppercase">
                    {speakerName} is speaking
                </p>
            )}

            {!isSpeaking && (
                <p className="mt-3 text-xs font-medium text-white/30 tracking-wider uppercase">
                    Listening...
                </p>
            )}

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
