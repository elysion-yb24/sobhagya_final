"use client";

import React from 'react';
import { Loader2, Phone, Video } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Call type icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${
            callType === 'video' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {callType === 'video' ? (
              <Video className="w-8 h-8" />
            ) : (
              <Phone className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Connecting animation */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connecting to {callType === 'video' ? 'Video' : 'Audio'} Call
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-4">
          Connecting you with {astrologerName}...
        </p>

        {/* Status text */}
        <p className="text-sm text-gray-500">
          Please wait while we establish your connection
        </p>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
} 