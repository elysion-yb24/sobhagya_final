"use client";

import React from 'react';
import { Phone, Video } from 'lucide-react';

interface ConnectingCallModalProps {
  isOpen: boolean;
  callType: 'audio' | 'video';
  astrologerName?: string;
}

export default function ConnectingCallModal({ 
  isOpen, 
  callType, 
  astrologerName = 'Astrologer' 
}: ConnectingCallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f0c29] animate-gradient-shift" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-orange-500/15 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-amber-400/10 rounded-full blur-[120px] animate-float-slower" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/8 rounded-full blur-[140px] animate-pulse" />
      </div>

      {/* Decorative celestial circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] border border-white/5 rounded-full animate-spin-very-slow" />
        <div className="absolute w-[220px] h-[220px] border border-orange-400/10 rounded-full animate-spin-reverse" />
        <div className="absolute w-[400px] h-[400px] border border-white/[0.03] rounded-full animate-spin-very-slow" style={{ animationDuration: '40s' }} />
      </div>
      
      {/* Modal content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Animated icon ring */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full border-2 border-orange-400/30 animate-ping-slow" />
          <div className="absolute -inset-8 rounded-full border border-amber-300/15 animate-pulse" />
          <div className="absolute -inset-12 rounded-full border border-orange-400/8 animate-ping-slower" />
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${
            callType === 'video'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
              : 'bg-gradient-to-br from-orange-400 to-amber-600 shadow-orange-500/30'
          }`}>
            {callType === 'video' ? (
              <Video className="w-9 h-9 text-white" />
            ) : (
              <span className="inline-block animate-wiggle"><Phone className="w-9 h-9 text-white" /></span>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Connecting {callType === 'video' ? 'Video' : 'Audio'} Call
        </h2>

        {/* Astrologer name with glow */}
        <p className="text-lg font-semibold bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 bg-clip-text text-transparent mb-4">
          {astrologerName}
        </p>

        {/* Status pill */}
        <div className="px-5 py-2 bg-white/[0.07] backdrop-blur-xl rounded-full border border-white/10 mb-8">
          <p className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase">
            establishing connection
          </p>
        </div>

        {/* Animated wave dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-orange-500 to-amber-300"
              style={{
                animation: 'wave-dot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
                height: '6px',
              }}
            />
          ))}
        </div>

        {/* Encrypted notice */}
        <div className="mt-8 flex items-center gap-2 opacity-40">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <p className="text-white text-[10px] font-medium tracking-wider uppercase">End-to-End Encrypted</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(15px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-20px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 12s ease-in-out infinite; }
        .animate-spin-very-slow { animation: spin 25s linear infinite; }
        .animate-spin-reverse { animation: spin 20s linear infinite reverse; }
        .animate-ping-slow { animation: modal-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-slower { animation: modal-ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes modal-ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes wave-dot {
          0%, 100% { height: 6px; opacity: 0.4; }
          50% { height: 20px; opacity: 1; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .animate-wiggle { animation: wiggle 0.8s ease-in-out infinite; }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
      `}</style>
    </div>
  );
}