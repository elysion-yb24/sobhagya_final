"use client";

import React, { useState, useEffect } from 'react';
import AstrologerCard from './AstrologerCard';
import { AstrologerCardSkeleton, ListSkeleton } from '../ui/SkeletonLoader';

interface Astrologer {
  _id: string;
  name: string;
  languages: string[];
  specializations: string[];
  experience: string;
  callsCount: number;
  rating: number | { avg: number; count: number; max: number; min: number };
  profileImage: string;
  hasVideo?: boolean;
  about?: string;
  age?: number;
  avatar?: string;
  blockReason?: string;
  blockedReason?: string;
  callMinutes?: number;
  callType?: string;
  calls?: number;
  createdAt?: string;
  hasBlocked?: boolean;
  isBlocked?: boolean;
  isLive?: boolean;
  isLiveBlocked?: boolean;
  isRecommended?: boolean;
  isVideoCallAllowed?: boolean;
  isVideoCallAllowedAdmin?: boolean;
  language?: string[];
  numericId?: number;
  offerRpm?: number;
  payoutAudioRpm?: number;
  payoutVideoRpm?: number;
  phone?: string;
  priority?: number;
  reportCount?: number;
  role?: string;
  rpm?: number;
  sample?: string;
  status?: string;
  talksAbout?: string[];
  upi?: string;
  videoRpm?: number;
}

interface AstrologerListProps {
  astrologers: Astrologer[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

const AstrologerList: React.FC<AstrologerListProps> = ({ 
  astrologers, 
  isLoading = false,
  isLoadingMore = false,
  hasError = false,
  onRetry
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton loading for initial load
  if (isLoading && astrologers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ListSkeleton count={6} ItemSkeleton={AstrologerCardSkeleton} />
        </div>
      </div>
    );
  }

  // Error state with retry
  if (hasError && astrologers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Astrologers
          </h3>
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to our servers. Please check your internet connection and try again.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && astrologers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Astrologers Found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any astrologers matching your criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Astrologers Grid with stagger animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation">
        {astrologers.map((astrologer, index) => (
          <div
            key={astrologer._id}
            className="animate-fadeInUp"
            style={{ animationDelay: `${(index % 6) * 0.1}s` }}
          >
            <AstrologerCard astrologer={astrologer} />
          </div>
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 font-medium">Loading more astrologers...</span>
          </div>
        </div>
      )}

      {/* Performance hint for large lists */}
      {astrologers.length > 50 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {astrologers.length} astrologers. Use filters to refine your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default AstrologerList;
