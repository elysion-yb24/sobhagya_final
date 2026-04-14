"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface CallErrorProps {
    error: string;
}

export default function CallError({ error }: CallErrorProps) {
    const router = useRouter();

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f0c29] text-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-orange-500/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-56 h-56 bg-red-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center p-8 bg-white/[0.06] backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-white/10">
                {/* Error icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Call Failed</h1>
                <p className="text-white/60 mb-8 text-sm leading-relaxed">{error}</p>
                <button
                    onClick={() => router.push('/astrologers')}
                    className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all duration-200 w-full font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                    Back to Astrologers
                </button>
            </div>
        </div>
    );
}
