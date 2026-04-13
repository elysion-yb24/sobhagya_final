import React, { useState, useEffect } from 'react';

interface CallTimerProps {
    isConnected: boolean;
    balance?: string;
    rpm?: string;
    startTime?: string;
}

const CallTimer: React.FC<CallTimerProps> = ({ isConnected, balance = "0", rpm = "0", startTime }) => {
    const [nowMs, setNowMs] = useState<number>(() => Date.now());

    const computeTimeLeft = (currentTimeMs: number): number => {
        const balanceVal = parseFloat(balance);
        const rpmVal = parseFloat(rpm);

        if (!Number.isFinite(balanceVal) || !Number.isFinite(rpmVal) || rpmVal <= 0) {
            return 0;
        }

        const totalSeconds = Math.max(0, Math.floor((balanceVal / rpmVal) * 60));
        const anchorMs = startTime ? Date.parse(startTime) : NaN;

        if (!Number.isFinite(anchorMs)) {
            return totalSeconds;
        }

        const elapsedSeconds = Math.max(0, Math.floor((currentTimeMs - anchorMs) / 1000));
        return Math.max(0, totalSeconds - elapsedSeconds);
    };

    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            setNowMs(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [isConnected]);

    const timeLeft = computeTimeLeft(nowMs);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else if (m > 0) {
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            return `0:${s.toString().padStart(2, '0')}`;
        }
    };

    if (!isConnected) return null;

    return (
        <div className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/90 backdrop-blur-md border border-white/50 shadow-2xl mb-4 text-black overflow-hidden p-1 select-none z-50">
            <div className={`text-xs font-bold leading-tight drop-shadow-sm ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
            </div>
            <div className="text-[9px] opacity-60 uppercase font-black tracking-tighter mt-0.5 scale-90">
                mins
            </div>

            {timeLeft < 60 && timeLeft > 0 && (
                <div className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping pointer-events-none" />
            )}
        </div>
    );
};

export default CallTimer;
