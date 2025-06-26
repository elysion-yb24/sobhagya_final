"use client";

import { useState } from "react";
import { X, Phone, Clock, Star, User } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" 
        onClick={onClose}
      />
      
      {/* Dialog Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all pointer-events-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
            disabled={isLoading}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          {/* Header */}
          <div className="p-5 pb-3">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-3">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {callType === 'free' ? 'Confirm Free Call' : `Confirm ${callType === 'audio' ? 'Audio' : 'Video'} Call`}
              </h2>
              <p className="text-sm text-gray-600">
                {callType === 'free' 
                  ? "You're about to start a free consultation with" 
                  : `You're about to start a ${callType} consultation with`
                }
              </p>
            </div>
          </div>

          {/* Astrologer Info */}
          <div className="px-5 pb-5">
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src={astrologer.profileImage || '/default-astrologer.png'}
                    alt={astrologer.name}
                    className="w-12 h-12 rounded-full border-2 border-orange-300 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=random`;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {astrologer.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">
                        {typeof astrologer.rating === 'number' ? astrologer.rating.toFixed(1) : astrologer.rating.avg.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-xs text-gray-600">{astrologer.experience}</span>
                  </div>
                  <div className="mt-1">
                    <div className="flex flex-wrap gap-1">
                      {astrologer.languages.slice(0, 2).map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Details */}
            <div className="space-y-3 mb-4">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                callType === 'free' 
                  ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <Clock className={`h-4 w-4 mr-2 ${callType === 'free' ? 'text-green-600' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${callType === 'free' ? 'text-green-800' : 'text-blue-800'}`}>
                    {callType === 'free' ? 'Free Call' : `${callType === 'audio' ? 'Audio' : 'Video'} Call`}
                  </span>
                </div>
                <span className={`text-base font-bold ${callType === 'free' ? 'text-green-600' : 'text-blue-600'}`}>
                  {callType === 'free' ? 'FREE' : `₹${rate}/min`}
                </span>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-orange-800">Important Notes:</h4>
                    <ul className="mt-1 text-xs text-orange-700 space-y-0.5">
                      {callType === 'free' ? (
                        <>
                          <li>• This is a one-time free offer</li>
                          <li>• Call will connect within 2 minutes</li>
                          <li>• You can extend at regular rates</li>
                        </>
                      ) : (
                        <>
                          <li>• Charges apply at ₹{rate}/minute</li>
                          <li>• Call will start immediately</li>
                          <li>• Ensure sufficient wallet balance</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm ${
                  callType === 'free' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    {callType === 'free' ? 'Start Free Call' : `Start ${callType === 'audio' ? 'Audio' : 'Video'} Call`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}