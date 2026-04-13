"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface CallErrorProps {
    error: string;
}

export default function CallError({ error }: CallErrorProps) {
    const router = useRouter();

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
                <h1 className="text-2xl font-bold mb-4 text-red-500">Call Failed</h1>
                <p className="text-gray-300 mb-8">{error}</p>
                <button
                    onClick={() => router.push('/astrologers')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full font-medium"
                >
                    Back to Astrologers
                </button>
            </div>
        </div>
    );
}
