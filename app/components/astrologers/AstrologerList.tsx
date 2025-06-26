import React from "react";
import AstrologerCard from "./AstrologerCard";

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
  // Additional fields from API response
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
}

export default function AstrologerList({ astrologers }: AstrologerListProps) {
  if (astrologers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No astrologers found</h3>
        <p className="text-gray-600 text-lg">Try adjusting your search or filter criteria.</p>
        <div className="mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#FDF4E6', color: '#F7971E' }}>
            <span>💫</span>
            <span>Expert astrologers are waiting to help you</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Expert Astrologers</h2>
        <p className="text-gray-600">Connect with verified astrologers for personalized guidance</p>
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#FDF4E6', color: '#F7971E' }}>
            <span>⭐</span>
            <span>{astrologers.length} Expert{astrologers.length !== 1 ? 's' : ''} Available</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {astrologers.map((ast, index) => (
          <div 
            key={ast._id} 
            className="animate-fadeIn"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <AstrologerCard astrologer={ast} />
          </div>
        ))}
      </div>
    </div>
  );
}
