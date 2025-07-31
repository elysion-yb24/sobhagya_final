"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../utils/auth-utils";
import { Phone, Video, Star, Users, Award, Loader2, CheckCircle, MessageCircle } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import CallConfirmationDialog from "../../components/ui/CallConfirmationDialog";
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
}

const AstrologerCard = React.memo(function AstrologerCard({ astrologer, compactButtons = false, showVideoButton = false }: Props) {
  const router = useRouter();
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [callError, setCallError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAudioConfirmDialog, setShowAudioConfirmDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);


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

  const handleCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setShowConfirmDialog(true);
  };

  const handleAudioCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setShowAudioConfirmDialog(true);
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
        setShowAudioConfirmDialog(false);
        return;
      }

      setIsCallRequested(true);
      const token = getAuthToken();
      const userDetails = getUserDetails();

      if (!token || !userDetails?.id) {
        throw new Error('Authentication required');
      }

      const response = await fetch(buildApiUrl('/calling/api/call/request-tataTelecom-call'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          astrologerId: _id,
          callerId: userDetails.id,
          receiverId: _id,
          callType: 'audio',
          rpm: rpm || 15,
        }),
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
          setShowAudioConfirmDialog(false);
          setIsCallRequested(false);
          return;
        }

        throw new Error(errorData.message || 'Failed to initiate audio call');
      }

      // Close the dialog and show connecting state
      setShowAudioConfirmDialog(false);
      setIsCallRequested(true);

      // Show success state for 3 seconds
      setTimeout(() => {
        setIsCallRequested(false);
      }, 3000);

    } catch (error) {
      console.error('Audio call error:', error);
      setCallError(error instanceof Error ? error.message : 'Failed to initiate audio call');
      setIsCallRequested(false);
      // Keep dialog open to show error
    }
  };

  const handleVideoCall = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation

    // Get user details for authentication check
    const userDetails = getUserDetails();
    if (!userDetails?.id) {
      alert('Please log in to start a video call');
      return;
    }

    // Use cached walletBalance
    const videoCost = (videoRpm || 25) * 2; // Estimate 2 minutes minimum cost for video
    if (walletBalance < videoCost) {
      setInsufficientBalanceData({
        requiredAmount: videoCost,
        serviceType: 'call'
      });
      setShowInsufficientBalanceModal(true);
      return;
    }

    // Request LiveKit token and channel from backend
    const token = getAuthToken();
    const requestBody = {
      receiverUserId: partner._id, // use partner._id for receiverUserId
      type: 'video',
      appVersion: '1.0.0'
    };
    const channelId = Date.now().toString();
    const baseUrl = getApiBaseUrl() || 'https://micro.sobhagya.in';
    const livekitUrl = `${baseUrl}/calling/api/call/call-token-livekit?channel=${encodeURIComponent(channelId)}`;

    try {
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
        alert('Failed to initiate video call');
        return;
      }

      const data = await response.json();
      if (!data.success || !data.data?.token || !data.data?.channel) {
        alert(data.message || 'Failed to get video call token');
        return;
      }

      // Redirect to /video-call with token and room
      const videoCallUrl = `/video-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(partner.name)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`;
      router.push(videoCallUrl);
    } catch (err) {
      alert('Failed to initiate video call');
    }
  };

  const handleCallConfirm = async () => {
    try {
      setCallError(null);
      setIsConnecting(true);
      // Use cached walletBalance
      const freeCallCost = (rpm || 15) * 2;
      if (walletBalance < freeCallCost) {
        setInsufficientBalanceData({
          requiredAmount: freeCallCost,
          serviceType: 'call'
        });
        setShowInsufficientBalanceModal(true);
        setShowConfirmDialog(false);
        setIsConnecting(false);
        return;
      }

      // Get the authentication token and user details
      const token = getAuthToken();
      const userDetails = getUserDetails();

      console.log('Retrieved user details:', userDetails);

      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      if (!userDetails || !userDetails.id) {
        console.log('User details missing or invalid:', userDetails);
        throw new Error('User details not found. Please login again.');
      }

      console.log('Making call request with caller ID:', userDetails.id);

      const response = await fetch(buildApiUrl('/calling/api/call/request-tataTelecom-call'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          astrologerId: _id,
          callerId: userDetails.id,
          receiverId: _id,
          callType: 'free',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Call request failed:', errorData);

        // Check if it's a balance-related error
        if (errorData.message?.toLowerCase().includes('balance') ||
          errorData.message?.toLowerCase().includes('insufficient')) {
          const callCost = (rpm || 15) * 2; // Estimate 2 minutes minimum cost
          setInsufficientBalanceData({
            requiredAmount: callCost,
            serviceType: 'call'
          });
          setShowInsufficientBalanceModal(true);
          setShowConfirmDialog(false);
          setIsConnecting(false);
          return;
        }

        throw new Error(errorData.message || 'Failed to initiate call');
      }

      // Mark free call as used globally and update state
      localStorage.setItem('userHasCalledBefore', 'true');
      setHasCompletedFreeCall(true);

      // Close the dialog and show connecting state
      setShowConfirmDialog(false);
      setIsCallRequested(true);
      setIsConnecting(false);

      // Start the timer
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsCallRequested(false);
            return 120; // Reset to 2 minutes
          }
          return prevTime - 1;
        });
      }, 1000);

      // Cleanup timer on component unmount
      return () => clearInterval(timer);

    } catch (error) {
      console.error('Call request error:', error);
      setCallError(error instanceof Error ? error.message : 'Failed to initiate call. Please try again.');
      setIsCallRequested(false);
      setIsConnecting(false);
      setTimeLeft(120);
      // Keep dialog open to show error
    }
  };

  const handleDialogClose = () => {
    if (!isConnecting) {
      setShowConfirmDialog(false);
      setCallError(null);
    }
  };

  const handleAudioDialogClose = () => {
    if (!isConnecting) {
      setShowAudioConfirmDialog(false);
      setCallError(null);
    }
  };

  // Format time left into minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
        className="group relative bg-white rounded border border-orange-300 p-2 sm:p-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col w-full max-w-[390px] mx-auto"
        style={{
          boxShadow: '0 2px 8px 0 rgba(247,151,30,0.07)',
        }}
      >
        <div className="flex gap-2 sm:gap-3 items-center mb-1 sm:mb-2">
          <div className="relative flex flex-col items-center">
            <img
              src={partner.avatar || partner.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=64`}
              alt={name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2"
              style={{ borderColor: partner.status === 'online' ? '#56AE50' : '#ff0000' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=64`;
              }}
            />
            {partner.status === 'online' && (
              <span className="text-xs text-green-600 font-medium mt-0.5 sm:mt-1">Online</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
              <span className="text-base sm:text-lg font-extrabold text-gray-800 truncate">{name}</span>
              <span className="text-orange-400" title="Verified">
                <img src="/orange_tick.png" alt="Orange Tick" className="w-3 h-3 sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="text-gray-700 text-xs font-medium leading-tight truncate mb-0.5 sm:mb-1">
              {specializations?.join(', ')}
            </div>
            
            
            
            {partner.talksAbout && partner.talksAbout.length > 0 && (
              <div className="text-gray-500 text-xs truncate mb-0.5 sm:mb-1">
              <span className="font-semibold">{partner.talksAbout.slice(0, 2).join(', ')}</span>
              </div>
            )}
            <div className="text-gray-500 text-xs truncate mb-0.5 sm:mb-1">
             <span className="font-semibold">{(languages || partner.language)?.join(', ')}</span>
            </div>
            <div className="text-gray-500 text-xs mb-0.5 sm:mb-1">
              Exp:- <span className="font-semibold">{age || experience} years</span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-extrabold text-gray-900">₹ {rpm || 15}/<span className="text-xs font-medium">min.</span></span>
              {/* Show video call indicator */}
              {(astrologer.isVideoCallAllowed || astrologer.hasVideo || astrologer.callType === 'video') && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                  <Video className="w-3 h-3" />
                  <span className="font-medium">Video</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
          <span className="flex items-center text-orange-400 text-xs ml-1 sm:ml-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = typeof rating === 'number' ? rating : rating?.avg || 0;
              const isHalf = value - i >= 0.5 && value - i < 1;
              return (
                <span key={i} className="relative">
                  <svg width="10" height="10" className="sm:w-3 sm:h-3" fill={i < Math.floor(value) ? '#F7971D' : '#E5E7EB'} viewBox="0 0 20 20">
                    <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 " />
                  </svg>
                  {isHalf && (
                    <svg className="absolute left-0 top-0" width="10" height="10" viewBox="0 0 20 20">
                      <defs>
                        <linearGradient id={`half-star-${i}`}> <stop offset="50%" stopColor="#F7971D" /><stop offset="50%" stopColor="#E5E7EB" /></linearGradient>
                      </defs>
                      <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 " fill={`url(#half-star-${i})`} />
                    </svg>
                  )}
                </span>
              );
            })}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-1 sm:mb-2">
          <span className="flex flex-col ml-1 sm:ml-2 items-center justify-center mx-auto">
            <span className="text-gray-400 italic text-xs gap-2">{calls || callsCount}&nbsp;orders</span>
            
          </span>
        </div>
        <div className="flex gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-auto justify-end w-full">
          <button
            className={`${compactButtons ? 'px-2 py-1' : 'px-2 sm:px-3 py-1 sm:py-1.5'} flex items-center justify-center gap-1 border-2 border-[#F7971D] text-[#F7971D] font-semibold rounded-lg bg-white hover:bg-orange-50 transition-all duration-200 text-xs sm:text-sm w-[80px] sm:w-[100px]`}
            onClick={e => { e.stopPropagation(); /* handleChatClick() */ }}
          >
            {/* <MessageCircle className={compactButtons ? "w-4 h-4" : "w-5 h-5"} /> */}
            <img src="/message.png" alt="Chat" className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Chat</span>
            <span className="sm:hidden">Chat</span>
          </button>
          {/* Show video button if astrologer supports video calls */}
          {(showVideoButton || astrologer.isVideoCallAllowed || astrologer.hasVideo || astrologer.callType === 'video') && (
            <button
              className={`${compactButtons ? 'px-2 py-1.5' : 'px-3 sm:px-4 py-1.5 sm:py-2'} flex items-center justify-center gap-1 sm:gap-2 bg-[#F7971D] text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-all duration-200 text-xs sm:text-base w-[80px] sm:w-auto`}
              onClick={handleVideoCall}
            >
              <Video className={compactButtons ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"} fill="#fff" />
              <span className="hidden sm:inline">Video</span>
              <span className="sm:hidden">Video</span>
            </button>
          )}
          <button
            className={`${compactButtons ? 'px-2 py-1' : 'px-2 sm:px-3 py-1 sm:py-1.5'} flex items-center justify-center gap-1 bg-[#F7971D] text-white font-medium rounded-lg shadow-sm hover:bg-orange-600 transition-all duration-200 text-xs sm:text-sm w-[80px] sm:w-[100px]`}
            onClick={handleCallButtonClick}
          >
            {/* <Phone className={compactButtons ? "w-4 h-4" : "w-5 h-5"} /> */}
            <img src="/Vector.png" alt="Call" className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Call</span>
            <span className="sm:hidden">Call</span>
          </button>
        </div>
      </div>

      {/* Audio Call Confirmation Dialog */}
      {showAudioConfirmDialog && (
        <CallConfirmationDialog
          isOpen={showAudioConfirmDialog}
          onClose={handleAudioDialogClose}
          onConfirm={handleAudioCall}
          astrologer={partner}
          isLoading={isConnecting}
          callType="audio"
          rate={rpm}
        />
      )}

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

