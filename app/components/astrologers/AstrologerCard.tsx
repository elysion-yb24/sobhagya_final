"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getAuthToken, getUserDetails } from "../../utils/auth-utils";
import { Phone, Video, Star, Users, Award, Loader2, CheckCircle } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import { buildApiUrl } from "../../config/api";

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
}

const AstrologerCard = React.memo(function AstrologerCard({ astrologer }: Props) {
  const router = useRouter();
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [callError, setCallError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAudioConfirmDialog, setShowAudioConfirmDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Insufficient balance modal state
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
    requiredAmount: number;
    serviceType: 'call' | 'gift' | 'consultation';
  } | null>(null);
  
  // New states for call history checking
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
  const [isCheckingHistory, setIsCheckingHistory] = useState(true);
  const [isFetchingWallet, setIsFetchingWallet] = useState(false);

  const {
    _id,
    name,
    languages,
    specializations,
    experience,
    callsCount,
    rating,
    profileImage,
    rpm,
    videoRpm,
    isVideoCallAllowed
  } = astrologer;

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
    
    fetchWalletBalance();
  }, []); // Empty dependency array to run only once

  const fetchWalletBalance = async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingWallet) return;
    setIsFetchingWallet(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`,
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
        const data = await response.json();
        if (data.success && data.data) {
          setWalletBalance(data.data.balance || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setIsFetchingWallet(false);
    }
  };

  const fetchWalletPageData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return 0;

      const response = await fetch(
        `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`,
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
        const data = await response.json();
        if (data.success && data.data) {
          const balance = data.data.balance || 0;
          setWalletBalance(balance);
          return balance;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error fetching wallet page data:', error);
      return 0;
    }
  };

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
      // Fetch latest wallet balance first
      const currentBalance = await fetchWalletPageData();
      
      // Check wallet balance first
      const callCost = (rpm || 15) * 2; // Estimate 2 minutes minimum cost
      if (currentBalance < callCost) {
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

    // Fetch latest wallet balance first
    const currentBalance = await fetchWalletPageData();

    // Check wallet balance first
    const videoCost = (videoRpm || 25) * 2; // Estimate 2 minutes minimum cost for video
    if (currentBalance < videoCost) {
      setInsufficientBalanceData({
        requiredAmount: videoCost,
        serviceType: 'call'
      });
      setShowInsufficientBalanceModal(true);
      return;
    }

    // Navigate to video call page with astrologer details
    const videoCallUrl = `/video-call?astrologerId=${encodeURIComponent(_id)}&astrologerName=${encodeURIComponent(name)}&callType=video&videoRpm=${encodeURIComponent(videoRpm || 25)}`;
    
    // Open video call in the same tab
    router.push(videoCallUrl);
  };

  const handleCallConfirm = async () => {
    try {
      setCallError(null);
      setIsConnecting(true);
      
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
    router.push(`/astrologers/${_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl border border-orange-300 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] overflow-hidden max-w-[350px] min-w-[320px] mx-auto"
      style={{ boxShadow: '0 2px 8px 0 rgba(247,151,30,0.07)' }}
    >
      <div className="flex gap-4 items-center mb-2">
        <div className="relative">
          <img
            src={profileImage || '/default-astrologer.png'}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-4"
            style={{ borderColor: astrologer.status === 'online' ? '#22C55E' : '#E5E7EB' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=64`;
            }}
          />
          {/* Online indicator */}
          {astrologer.status === 'online' && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white block"></span>
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xl font-bold text-gray-800 truncate">{name}</span>
            <span className="ml-1 text-orange-400" title="Verified">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </span>
          </div>
          <div className="text-gray-700 text-sm font-medium leading-tight truncate">
            {specializations?.join(', ')}
          </div>
          <div className="text-gray-400 text-sm truncate">
            {languages?.join(', ')}
          </div>
          <div className="text-gray-500 text-sm mt-1">Exp:- <span className="font-semibold">{experience} years</span></div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 mb-1">
        <span className="text-lg font-bold text-gray-800">₹ {rpm || 15}/<span className="text-base font-medium">min.</span></span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-600 text-xs font-semibold">Online</span>
        <span className="flex items-center text-orange-400 text-base">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="16" height="16" fill={i < (typeof rating === 'number' ? Math.round(rating) : Math.round(rating.avg)) ? '#F7971D' : '#E5E7EB'} viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 "/></svg>
          ))}
        </span>
        <span className="text-gray-400 text-xs ml-1">{callsCount} orders</span>
      </div>
      <div className="flex gap-2 mt-4">
        {isVideoCallAllowed ? (
          <>
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold rounded-md py-2 transition-all hover:bg-orange-600"
              style={{ fontSize: '1rem' }}
              onClick={handleCallButtonClick}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"/></svg>
              Call
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-orange-100 text-orange-600 font-semibold rounded-md py-2 transition-all hover:bg-orange-200 border border-orange-300"
              style={{ fontSize: '1rem' }}
              onClick={handleVideoCall}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="15" height="10" rx="2"/><polygon points="23 7 16 12 23 17 23 7"/></svg>
              Video
            </button>
          </>
        ) : (
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold rounded-md py-2 transition-all hover:bg-orange-600"
            style={{ fontSize: '1rem' }}
            onClick={handleCallButtonClick}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </button>
        )}
      </div>
    </div>
  );
});

export default AstrologerCard;

