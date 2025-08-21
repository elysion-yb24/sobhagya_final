"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../utils/auth-utils";
import { Phone, Video, Star, Users, Award, Loader2, CheckCircle, MessageCircle, ChevronDown } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import { buildApiUrl } from "../../config/api";
import { useWalletBalance } from './WalletBalanceContext';

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

interface Props {
  astrologer: Astrologer;
  compactButtons?: boolean;
  showVideoButton?: boolean;
  source?: string;
}

const AstrologerCard = React.memo(function AstrologerCard({ astrologer, compactButtons = false, showVideoButton = false, source }: Props) {
  const router = useRouter();
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [isCallMenuOpen, setIsCallMenuOpen] = useState(false);
  const callMenuRef = useRef<HTMLDivElement | null>(null);
  const callButtonRef = useRef<HTMLButtonElement | null>(null);

  // Insufficient balance modal state
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  // Remove local wallet balance state
  // const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
    requiredAmount: number;
    serviceType: 'call' | 'gift' | 'consultation';
  } | null>(null);

  // New states for call history checking
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
  const [isCheckingHistory, setIsCheckingHistory] = useState(true);
  const { walletBalance, isFetching: isFetchingWallet, refreshWalletBalance } = useWalletBalance();

  // In the AstrologerCard, treat the astrologer prop as 'partner' for consistency
  const partner = astrologer;

  const {
    _id,
    name,
    languages,
    specializations,
    experience,
    callsCount,
    calls,
    rating,
    profileImage,
    rpm,
    videoRpm,
    isVideoCallAllowed,
    age,
    talksAbout
  } = partner;

  useEffect(() => {
    // Check if we already have cached data to avoid unnecessary API calls
    const cachedHasCalledBefore = localStorage.getItem('userHasCalledBefore');
    const lastCheckTime = localStorage.getItem('lastCallHistoryCheck');
    const now = Date.now();

    // Only check API if we don't have cached data or it's been more than 5 minutes
    if (cachedHasCalledBefore === 'true') {
      setHasCompletedFreeCall(true);
      setIsCheckingHistory(false);
    } else if (!lastCheckTime || (now - parseInt(lastCheckTime)) > 300000) { // 5 minutes
      checkCallHistory();
      localStorage.setItem('lastCallHistoryCheck', now.toString());
    } else {
      setIsCheckingHistory(false);
    }

    // Only fetch wallet balance once on mount
    // Remove fetchWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  // Remove fetchWalletBalance and fetchWalletPageData definitions

  const checkCallHistory = async () => {
    try {
      setIsCheckingHistory(true);
      const token = getAuthToken();
      const userDetails = getUserDetails();

      if (!token || !userDetails?.id) {
        setIsCheckingHistory(false);
        return;
      }

      // Check if user has ANY call history (with any astrologer)
      const response = await fetch(
        `${getApiBaseUrl()}/calling/api/call/call-log?skip=0&limit=10&role=user`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const callHistory = await response.json();
        console.log('Call history response:', callHistory);

        // Check if user has ANY previous calls (with any astrologer)
        const totalCalls = callHistory.data?.list?.length || 0;
        console.log('Total calls found:', totalCalls);

        if (totalCalls > 0) {
          console.log('User has call history, hiding free call option');
          setHasCompletedFreeCall(true);
          // Mark globally that user has used free call
          localStorage.setItem('userHasCalledBefore', 'true');
        } else {
          console.log('No call history found, checking localStorage');
          // Check localStorage as fallback
          const hasCalledBefore = localStorage.getItem('userHasCalledBefore');
          console.log('localStorage userHasCalledBefore:', hasCalledBefore);
          if (hasCalledBefore === 'true') {
            setHasCompletedFreeCall(true);
          }
        }
      } else {
        console.log('Call history API failed with status:', response.status);
        // Fallback to localStorage if API fails
        const hasCalledBefore = localStorage.getItem('userHasCalledBefore');
        if (hasCalledBefore === 'true') {
          setHasCompletedFreeCall(true);
        }
      }
    } catch (error) {
      console.error('Error checking call history:', error);
      // Fallback to localStorage if API fails
      const hasCalledBefore = localStorage.getItem('userHasCalledBefore');
      if (hasCalledBefore === 'true') {
        setHasCompletedFreeCall(true);
      }
    } finally {
      setIsCheckingHistory(false);
    }
  };

  // Close the call menu if clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!isCallMenuOpen) return;
      const target = e.target as Node;
      if (callMenuRef.current && callMenuRef.current.contains(target)) return;
      if (callButtonRef.current && callButtonRef.current.contains(target)) return;
      setIsCallMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCallMenuOpen]);

  const handleCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    handleAudioCall();
  };

  const handleAudioCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setIsCallMenuOpen(false);
    
    // Check if user is authenticated
    if (isAuthenticated()) {
      // If authenticated, go directly to astrologer profile with call type
      router.push(`/astrologers/${_id}?callType=audio`);
    } else {
      // If not authenticated, redirect to login with call intent
      console.log('🔍 Setting audio call intent for astrologer:', _id);
      localStorage.setItem('callIntent', 'audio');
      localStorage.setItem('selectedAstrologerId', _id);
      localStorage.setItem('callSource', source || 'astrologerCard');
      console.log('✅ Stored in localStorage:', {
        callIntent: 'audio',
        selectedAstrologerId: _id,
        callSource: source || 'astrologerCard'
      });
      router.push('/login');
    }
  };

  const handleAudioCall = async () => {
    try {
      // Use cached walletBalance instead of fetching again
      const callCost = (rpm || 15) * 2; // Estimate 2 minutes minimum cost
      if (walletBalance < callCost) {
        setInsufficientBalanceData({
          requiredAmount: callCost,
          serviceType: 'call'
        });
        setShowInsufficientBalanceModal(true);
        return;
      }

      setIsCallRequested(true);
      const token = getAuthToken();
      const userDetails = getUserDetails();

      if (!token || !userDetails?.id) {
        throw new Error('Authentication required');
      }

      // Request LiveKit token and channel from backend for audio call
      const requestBody = {
        receiverUserId: _id,
        type: 'call',
        appVersion: '1.0.0'
      };
      const channelId = Date.now().toString();
      const baseUrl = getApiBaseUrl() || 'https://micro.sobhagya.in';
      const livekitUrl = `${baseUrl}/calling/api/call/call-token-livekit?channel=${encodeURIComponent(channelId)}`;

      const response = await fetch(livekitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Check if it's a balance-related error
        if (errorData.message?.toLowerCase().includes('balance') ||
          errorData.message?.toLowerCase().includes('insufficient')) {
          setInsufficientBalanceData({
            requiredAmount: callCost,
            serviceType: 'call'
          });
          setShowInsufficientBalanceModal(true);
          return;
        }

        throw new Error(errorData.message || 'Failed to initiate audio call');
      }

      const data = await response.json();
      if (!data.success || !data.data?.token || !data.data?.channel) {
        throw new Error(data.message || 'Failed to get audio call token');
      }

      // Store navigation source and astrologer ID for proper back navigation
      localStorage.setItem('lastAstrologerId', _id);
      localStorage.setItem('callSource', 'astrologerCard');

      // Redirect to audio call page with token and room
      const audioCallUrl = `/audio-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(name)}&astrologerId=${encodeURIComponent(_id)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`;
      router.push(audioCallUrl);

    } catch (error) {
      console.error('Audio call error:', error);
      setCallError(error instanceof Error ? error.message : 'Failed to initiate audio call');
      // Show error alert
      alert(error instanceof Error ? error.message : 'Failed to initiate audio call');
    }
  };

  const openChatRoom = (currentUserId: string, currentUserName: string) => {
    // Deterministic room id so both sides join the same room regardless of who starts
    const a = currentUserId;
    const b = _id;
    const roomId = a < b ? `chat-${a}-${b}` : `chat-${b}-${a}`;

    // Prepare auto message with any captured details
    const userDetails = getUserDetails();
    const autoMessageLines = [
      `👋 Hi! I'm ${currentUserName}.`,
      userDetails?.phoneNumber ? `📱 Phone: ${userDetails.phoneNumber}` : null,
      userDetails?.email ? `📧 Email: ${userDetails.email}` : null,
      `🆔 User ID: ${currentUserId}`,
      `🧑‍⚕️ Astrologer: ${name}`,
      `⏰ Joined at: ${new Date().toLocaleString()}`,
    ].filter(Boolean) as string[];
    const autoMessage = autoMessageLines.join("\n");

    try {
      sessionStorage.setItem('chatAutoMessage', autoMessage);
    } catch { }

    const url = `/chat-room/${encodeURIComponent(roomId)}?userId=${encodeURIComponent(currentUserId)}&userName=${encodeURIComponent(currentUserName)}&role=user&autoDetails=1&astrologerId=${encodeURIComponent(_id)}&astroName=${encodeURIComponent(name || '')}`;
    window.open(url, '_blank');
  };

  const handleChatClick = () => {
    // If authenticated, open chat directly
    const isAuthValid = isAuthenticated();
    if (isAuthValid) {
      const profile = getUserDetails();
      const currentUserId = profile?.id || profile?._id;
      const currentUserName = profile?.displayName || profile?.name || 'User';
      if (!currentUserId) {
        // Fallback to login if user id missing
        localStorage.setItem('initiateChatWithAstrologerId', _id);
        window.location.href = '/login';
        return;
      }
      openChatRoom(currentUserId, currentUserName);
      return;
    }

    // Not authenticated: set intent and go through details + OTP flow
    localStorage.setItem('selectedAstrologerId', _id);
    localStorage.setItem('chatIntent', '1');
    // Reuse the existing call details flow to capture user details
    window.location.href = `/calls/call1?astrologerId=${_id}`;
  };

  const handleVideoCall = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation

    // Check if user is authenticated
    if (isAuthenticated()) {
      // If authenticated, go directly to astrologer profile with call type
      router.push(`/astrologers/${_id}?callType=video`);
    } else {
      // If not authenticated, redirect to login with video call intent
      console.log('🔍 Setting video call intent for astrologer:', _id);
      localStorage.setItem('callIntent', 'video');
      localStorage.setItem('selectedAstrologerId', _id);
      localStorage.setItem('callSource', source || 'astrologerCard');
      console.log('✅ Stored in localStorage:', {
        callIntent: 'video',
        selectedAstrologerId: _id,
        callSource: source || 'astrologerCard'
      });
      router.push('/login');
    }
  };

  // Remove the old dialog close handler since we don't have confirmation dialogs anymore

  // Navigate to /astrologer/[ID] on entire card click
  const handleCardClick = () => {
    // Check if user is authenticated
    const isAuthValid = isAuthenticated();

    if (isAuthValid) {
      // If authenticated, go directly to astrologer profile
      router.push(`/astrologers/${_id}`);
    } else {
      // If not authenticated, go to call flow with astrologer ID
      router.push(`/calls/call1?astrologerId=${_id}`);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative ${isCallMenuOpen ? 'z-[9998]' : 'z-0 hover:z-50'} bg-white rounded-md border p-3 cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col w-full max-w-[520px] mx-auto`}
        style={{
          borderColor: '#F7971E',
          boxShadow: '0 2px 8px 0 rgba(247,151,30,0.07)',
          overflow: 'visible'
        }}
      >
        {/* Main Content Area */}
        <div className="flex gap-4 mb-2.5">
          {/* Left Column - Avatar, Online Status, Rating, Orders */}
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <img
              src={partner.avatar || partner.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F7971E&color=fff&size=70`}
              alt={name}
              className="w-[70px] h-[70px] rounded-full object-cover border-2 mb-1.5"
              style={{ 
                borderColor: partner.status === 'online' ? '#10B981' : '#F7971E',
                borderWidth: '2px'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F7971E&color=fff&size=70`;
              }}
            />
            
            {/* Online Status */}
            {partner.status === 'online' && (
              <span className="text-xs text-green-600 font-medium mb-1">Online</span>
            )}
            
            {/* Rating Stars */}
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => {
                const value = typeof rating === 'number' ? rating : rating?.avg || 4.5;
                return (
                  <span
                    key={i}
                    style={{ 
                      fontSize: '13px',
                      color: i < Math.floor(value) ? '#F7971E' : '#D1D5DB'
                    }}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            
            {/* Orders Count */}
            <div className="text-center">
              <span className="text-xs font-semibold block italic" style={{ color: '#636161' }}>{calls || callsCount || '64987'}</span>
              <span className="text-[10px] italic -mt-1 block" style={{ color: '#636161' }}>orders</span>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 min-w-0">
            {/* Name with Verified Badge */}
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate" style={{
                fontFamily: "Poppins",
                fontSize: "18px"
              }}>
                {name.startsWith('Pt.') ? name : name}
              </h3>
              <img src="/orange_tick.png" alt="Verified" className="w-4 h-4 flex-shrink-0" />
            </div>
            
            {/* Specializations */}
            <div className="text-gray-700 text-xs mb-1" style={{ fontSize: "16px" }}>
              {partner.talksAbout && partner.talksAbout.length > 0
                ? partner.talksAbout.slice(0, 3).join(', ')
                : specializations?.join(', ') || 'Kp, Vedic, Vastu'
              }
            </div>
            
            {/* Languages */}
            <div className="text-gray-600 text-xs mb-1" style={{ fontSize: "13px" }}>
              {(languages || partner.language)?.join(', ') || 'Hindi, Gujarati'}
            </div>
            
            {/* Experience */}
            <div className="text-gray-600 text-xs mb-1.5" style={{ fontSize: "13px" }}>
              Exp- {age || experience || '8'} years
            </div>
            
            {/* Price */}
            <div className="text-gray-900 font-semibold text-base">
              ₹ {rpm || 79}/min.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleChatClick();
            }}
            className="flex-1 py-1.5 px-3 border rounded-full font-semibold transition-colors flex items-center justify-center gap-1"
            style={{
              borderColor: '#F7971E',
              color: '#F7971E'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF5F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <img src="/message.png" alt="Chat" className="w-3.5 h-3.5" />
            Free 1st chat
          </button>
          
          {/* Unified Call button with hover dropdown for Audio/Video */}
          <div className="relative flex-1 z-10" ref={callMenuRef}>
            <button
              ref={callButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsCallMenuOpen((prev) => !prev);
              }}
              className="w-full py-2 px-4 text-white rounded-full font-semibold flex items-center justify-center gap-2 text-sm shadow-md transition-all"
              style={{ background: 'linear-gradient(180deg, #F9A43A 0%, #F7971E 100%)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.95)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
            >
              <img src="/Vector.png" alt="Call" className="w-4 h-4 brightness-0 invert" />
              Call
              <ChevronDown size={16} className="opacity-90" />
            </button>
            {/* Dropdown */}
            <div
              className={`absolute bottom-full left-7 -translate-x-1/2 mb-2 flex-col rounded-2xl overflow-hidden shadow-2xl z-[9999] transition-all duration-200 w-56 sm:w-64 ${isCallMenuOpen ? 'flex opacity-100 translate-y-0 pointer-events-auto' : 'hidden opacity-0 translate-y-1 pointer-events-none'}`}
              style={{ background: 'white', border: '1px solid #FBE3C9' }}
                 onClick={(e) => e.stopPropagation()}>
              <button
                className="w-full text-[15px] py-3 px-4 text-gray-800 hover:bg-orange-50 flex items-center justify-center gap-3"
                onClick={handleAudioCallButtonClick}
              >
                <Phone size={18} /> Audio call
              </button>
              <button
                className="w-full text-[15px] py-3 px-4 text-gray-800 hover:bg-orange-50 border-t border-orange-100 flex items-center justify-center gap-3"
                onClick={handleVideoCall}
              >
                <Video size={18} /> Video call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Balance Modal */}
      {showInsufficientBalanceModal && insufficientBalanceData && (
        <InsufficientBalanceModal
          isOpen={showInsufficientBalanceModal}
          onClose={() => setShowInsufficientBalanceModal(false)}
          requiredAmount={insufficientBalanceData.requiredAmount}
          currentBalance={walletBalance}
          serviceType={insufficientBalanceData.serviceType}
        />
      )}
    </>
  );
});

export default AstrologerCard;

