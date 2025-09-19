"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MessageCircle } from 'lucide-react';

interface ChatConnectingModalProps {
  isOpen: boolean;
  astrologerName?: string;
}

export default function ChatConnectingModal({ 
  isOpen, 
  astrologerName = 'Astrologer' 
}: ChatConnectingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Full screen blurred background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Chat icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-orange-100 text-orange-600">
            <MessageCircle className="w-8 h-8" />
          </div>
        </div>

        {/* Connecting animation */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connecting to Chat Room
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-4">
          Connecting you to room with {astrologerName}...
        </p>

        {/* Status text */}
        <p className="text-sm text-gray-500">
          Please wait while we establish your chat session
        </p>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 space-x-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
