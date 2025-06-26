"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getAuthToken, getUserDetails } from "../../utils/auth-utils";
import { Phone, Video, Star, Users, Award, Loader2, CheckCircle } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
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
      // Check wallet balance first
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

      const response = await fetch(`${getApiBaseUrl()}/calling/api/call/request-tataTelecom-call`, {
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

    // Navigate to video call page with astrologer details
    const videoCallUrl = `/video-call?astrologerId=${encodeURIComponent(_id)}&astrologerName=${encodeURIComponent(name)}&callType=video`;
    
    // Open video call in a new window for better experience
    const videoWindow = window.open(
      videoCallUrl,
      'videoCall',
      'width=1200,height=800,scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no'
    );

    // Focus on the new window
    if (videoWindow) {
      videoWindow.focus();
    } else {
      // Fallback to same window if popup is blocked
      router.push(videoCallUrl);
    }
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

      const response = await fetch('http://localhost:8001/calling/api/call/request-tataTelecom-call', {
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
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F7971E'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={profileImage || '/default-astrologer.png'}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-3 transition-all duration-300 group-hover:scale-110 shadow-lg"
              style={{ 
                borderColor: astrologer.status === 'online' ? '#22C55E' : astrologer.status === 'busy' ? '#F59E0B' : '#EF4444',
                boxShadow: `0 0 20px ${astrologer.status === 'online' ? 'rgba(34, 197, 94, 0.3)' : astrologer.status === 'busy' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=64`;
              }}
            />
            <div 
              className="absolute -bottom-1 -right-1 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1" 
              style={{ 
                backgroundColor: astrologer.status === 'online' ? '#22C55E' : astrologer.status === 'busy' ? '#F59E0B' : '#EF4444'
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'white' }}
              />
              <span>
                {astrologer.status === 'online' ? 'Online' : astrologer.status === 'busy' ? 'Busy' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">{name}</h3>
              {/* Instagram-style verification tick */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="#1DA1F2"
                />
              </svg>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {astrologer.talksAbout?.map((spec, index) => (
                <span key={index} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#FDF4E6', color: '#F7971E' }}>
                  {spec}
                </span>
              )) || specializations.map((spec, index) => (
                <span key={index} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#FDF4E6', color: '#F7971E' }}>
                  {spec}
                </span>
              ))}
            </div>
            
            {/* Small stats below specializations */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" style={{ color: '#8B5CF6' }} />
                <span>{experience} Years</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" style={{ color: '#3B82F6' }} />
                <span>{callsCount} Orders</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(typeof rating === 'number' ? rating : rating.avg) 
                        ? 'fill-current' 
                        : ''
                    }`}
                    style={{ color: i < Math.floor(typeof rating === 'number' ? rating : rating.avg) ? '#F59E0B' : '#D1D5DB' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <div>Audio: <span className="font-semibold" style={{ color: '#F7971E' }}>₹{rpm || 15}/min</span></div>
            {(astrologer.isVideoCallAllowed || astrologer.hasVideo) && (
              <div className="mt-0.5">Video: <span className="font-semibold" style={{ color: '#3B82F6' }}>₹{videoRpm || 20}/min</span></div>
            )}
          </div>

          {isCheckingHistory ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-gray-500 text-sm">Loading...</span>
            </div>
          ) : isCallRequested ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#F7971E' }} />
                <span className="font-medium text-sm" style={{ color: '#F7971E' }}>Connecting...</span>
              </div>
              <div className="text-xs text-gray-500">
                Time left: {formatTimeLeft()}
              </div>
            </div>
          ) : !hasCompletedFreeCall ? (
            <button
              onClick={handleCallButtonClick}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: '#F7971E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8850B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7971E'}
            >
              FREE First Call
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleAudioCallButtonClick}
                className="bg-white border-2 text-black px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 hover:shadow-md hover:scale-105"
                style={{ 
                  borderColor: '#4A5568',
                  color: '#4A5568'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A5568';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#4A5568';
                }}
              >
                <Phone className="w-3 h-3" />
              </button>
              
              {(astrologer.isVideoCallAllowed || astrologer.hasVideo) && (
                <button
                  onClick={handleVideoCall}
                  className="bg-white border-2 text-black px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 hover:shadow-md hover:scale-105"
                  style={{ 
                    borderColor: '#4A5568',
                    color: '#4A5568'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A5568';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#4A5568';
                  }}
                >
                  <Video className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {callError && (
          <div className="mt-3 bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
            {callError}
          </div>
        )}
      </div>

      {/* Free Call Confirmation Dialog */}
      {showConfirmDialog && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Start Free Call</h2>
              <p className="text-gray-600">
                Do you want to start a free consultation call with {name}? This is a one-time free offer.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDialogClose}
                disabled={isConnecting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCallConfirm}
                disabled={isConnecting}
                className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: '#F7971E' }}
                onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.backgroundColor = '#E8850B')}
                onMouseLeave={(e) => !isConnecting && (e.currentTarget.style.backgroundColor = '#F7971E')}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Start Call
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Audio Call Confirmation Dialog */}
      {showAudioConfirmDialog && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Start Audio Call</h2>
              <p className="text-gray-600">
                Start an audio consultation with {name} at ₹{rpm || 15}/minute? Charges will be deducted from your wallet.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAudioDialogClose}
                disabled={isConnecting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAudioCall}
                disabled={isConnecting}
                className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: '#F7971E' }}
                onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.backgroundColor = '#E8850B')}
                onMouseLeave={(e) => !isConnecting && (e.currentTarget.style.backgroundColor = '#F7971E')}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Start Call
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        currentBalance={walletBalance}
        requiredAmount={insufficientBalanceData?.requiredAmount || 0}
        astrologerName={name}
        serviceType={insufficientBalanceData?.serviceType || 'call'}
      />
    </>
  );
});

export default AstrologerCard;
