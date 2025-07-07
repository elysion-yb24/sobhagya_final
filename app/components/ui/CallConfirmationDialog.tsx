"use client";

import { useState, useEffect } from "react";
import { X, Phone, Clock, Star, User, Video, Shield, Award } from "lucide-react";

interface Astrologer {
  _id: string;
  name: string;
  languages: string[];
  specializations: string[];
  experience: string;
  rating: number | { avg: number; count: number; max: number; min: number };
  profileImage: string;
}

interface CallConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  astrologer: Astrologer;
  isLoading?: boolean;
  callType?: 'free' | 'audio' | 'video';
  rate?: number;
}

export default function CallConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  astrologer,
  isLoading = false,
  callType = 'free',
  rate
}: CallConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting'>('entering');

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setAnimationState('entering');
      // Trigger entrance animation
      const timer = setTimeout(() => setAnimationState('entered'), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  if (!mounted || !isOpen) return null;

  const getCallTypeIcon = () => {
    switch (callType) {
      case 'video':
        return <Video className="h-8 w-8 text-white" />;
      case 'audio':
        return <Phone className="h-8 w-8 text-white" />;
      case 'free':
      default:
        return <Phone className="h-8 w-8 text-white" />;
    }
  };

  const getCallTypeColor = () => {
    switch (callType) {
      case 'video':
        return 'from-blue-500 to-blue-600';
      case 'audio':
        return 'from-gray-500 to-gray-600';
      case 'free':
      default:
        return 'from-orange-500 to-red-500';
    }
  };

  const getCallTypeText = () => {
    switch (callType) {
      case 'video':
        return 'Video Call';
      case 'audio':
        return 'Audio Call';
      case 'free':
      default:
        return 'Free Call';
    }
  };

  const getButtonColor = () => {
    switch (callType) {
      case 'video':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500';
      case 'audio':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:ring-gray-500';
      case 'free':
      default:
        return 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:ring-orange-500';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          animationState === 'entered' ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Dialog Container */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 pointer-events-auto max-h-[90vh] overflow-y-auto ${
            animationState === 'entered' 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="text-center">
              <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${getCallTypeColor()} rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse-orange`}>
                {getCallTypeIcon()}
              </div>
              <h2 id="dialog-title" className="text-xl font-bold text-gray-900 mb-2">
                Confirm {getCallTypeText()}
              </h2>
              <p id="dialog-description" className="text-sm text-gray-600">
                {callType === 'free' 
                  ? "You're about to start a free consultation with" 
                  : `You're about to start a ${callType} consultation with`
                }
              </p>
            </div>
          </div>

          {/* Astrologer Info */}
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl p-4 mb-4 border border-orange-100">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 relative">
                  <img
                    src={astrologer.profileImage || '/default-astrologer.png'}
                    alt={`${astrologer.name}'s profile`}
                    className="w-14 h-14 rounded-full border-3 border-orange-300 object-cover shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=f97316&color=fff&size=56`;
                    }}
                  />
                  {/* Verified badge */}
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-lg">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-2">
                    {astrologer.name}
                    <Award className="w-4 h-4 text-yellow-500" />
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1 font-medium">
                        {typeof astrologer.rating === 'number' ? astrologer.rating.toFixed(1) : astrologer.rating.avg.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-xs text-gray-600 font-medium">{astrologer.experience}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {astrologer.languages.slice(0, 2).map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {lang}
                        </span>
                      ))}
                      {astrologer.languages.length > 2 && (
                        <span className="text-xs text-gray-500 font-medium">
                          +{astrologer.languages.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Details */}
            <div className="space-y-3 mb-6">
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors duration-300 ${
                callType === 'free' 
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : callType === 'video'
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    callType === 'free' ? 'bg-green-100' : callType === 'video' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      callType === 'free' ? 'text-green-600' : callType === 'video' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <span className={`text-sm font-semibold ${
                      callType === 'free' ? 'text-green-800' : callType === 'video' ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {getCallTypeText()}
                    </span>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {callType === 'free' 
                        ? 'No charges for your first consultation' 
                        : 'Secure and private consultation'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    callType === 'free' ? 'text-green-600' : callType === 'video' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {callType === 'free' ? 'FREE' : `₹${rate}/min`}
                  </span>
                  {callType !== 'free' && (
                    <p className="text-xs text-gray-500">per minute</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-gray-700">100% Secure</span>
                    </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <User className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-700">Verified Expert</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    {getCallTypeIcon()}
                    <span className="ml-2">
                      {callType === 'free' ? 'Start Free Call' : `Start ${getCallTypeText()}`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            {callType !== 'free' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> You will be charged ₹{rate} per minute. The call will automatically end when your wallet balance is insufficient.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}