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

        // startTime might be empty string or "0" before call fully starts
        const anchorMs = (startTime && startTime !== '0' && startTime.length > 1) ? Date.parse(startTime) : NaN;

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

    const isLowTime = timeLeft < 60 && timeLeft > 0;

    return (
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums select-none ${
            isLowTime ? 'text-red-400' : 'text-white/80'
        } ${isLowTime ? 'animate-pulse' : ''}`}>
            <span>{formatTime(timeLeft)}</span>
            <span className={`text-[10px] uppercase tracking-wider ${isLowTime ? 'text-red-400/70' : 'text-white/40'}`}>left</span>
        </span>
    );
};

export default CallTimer;
