"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthToken, getUserDetails } from "../../utils/auth-utils";
import CallConfirmationDialog from "../ui/CallConfirmationDialog";
import { Phone, Video, Star, Users, Award, Loader2, CheckCircle } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";

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

export default function AstrologerCard({ astrologer }: Props) {
  const router = useRouter();
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [callError, setCallError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAudioConfirmDialog, setShowAudioConfirmDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // New states for call history checking
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
  const [isCheckingHistory, setIsCheckingHistory] = useState(true);

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
    checkCallHistory();
  }, [_id]);

  const checkCallHistory = async () => {
    try {
      setIsCheckingHistory(true);
      const token = getAuthToken();
      const userDetails = getUserDetails();
      
      if (!token || !userDetails?.id) {
        setIsCheckingHistory(false);
        return;
      }

      // Check if user has any call history with this astrologer
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
        
        // Check if user has any previous calls with this specific astrologer
        const callsWithThisAstrologer = callHistory.data?.list?.filter((call: any) => 
          call.astrologerId === _id || call.receiverId === _id
        ) || [];
        
        if (callsWithThisAstrologer.length > 0) {
          setHasCompletedFreeCall(true);
        } else {
          // Check localStorage as fallback
          const freeCallUsed = localStorage.getItem(`freeCallUsed_${_id}`);
          if (freeCallUsed === 'true') {
            setHasCompletedFreeCall(true);
          }
        }
      } else {
        // Fallback to localStorage if API fails
        const freeCallUsed = localStorage.getItem(`freeCallUsed_${_id}`);
        if (freeCallUsed === 'true') {
          setHasCompletedFreeCall(true);
        }
      }
    } catch (error) {
      console.error('Error checking call history:', error);
      // Fallback to localStorage if API fails
      const freeCallUsed = localStorage.getItem(`freeCallUsed_${_id}`);
      if (freeCallUsed === 'true') {
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
    // For now, redirect to the profile page for video calls
    router.push(`/astrologers/${_id}`);
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
        throw new Error(errorData.message || 'Failed to initiate call');
      }

      // Mark free call as used and update state
      localStorage.setItem(`freeCallUsed_${_id}`, 'true');
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
        className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={profileImage || '/default-astrologer.png'}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=64`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              Online
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{languages.join(", ")}</p>
            <div className="flex flex-wrap gap-1">
              {specializations.slice(0, 2).map((spec, index) => (
                <span key={index} className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {spec}
                </span>
              ))}
              {specializations.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{specializations.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-3 h-3 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">{experience}</span>
            </div>
            <span className="text-xs text-gray-500">Years</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3 h-3 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{callsCount}</span>
            </div>
            <span className="text-xs text-gray-500">Calls</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-gray-900">
                {typeof rating === 'number' ? rating.toFixed(1) : rating.avg.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">Rating</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Audio: <span className="font-semibold text-green-600">₹{rpm || 15}/min</span>
          </div>

          {isCheckingHistory ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-gray-500 text-sm">Loading...</span>
            </div>
          ) : isCallRequested ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span className="text-orange-600 font-medium text-sm">Connecting...</span>
              </div>
              <div className="text-xs text-gray-500">
                Time left: {formatTimeLeft()}
              </div>
            </div>
          ) : !hasCompletedFreeCall ? (
            <button
              onClick={handleCallButtonClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              FREE First Call
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleAudioCallButtonClick}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                Call
              </button>
              
              {isVideoCallAllowed && (
                <button
                  onClick={handleVideoCall}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  Video
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
      <CallConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleDialogClose}
        onConfirm={handleCallConfirm}
        astrologer={astrologer}
        isLoading={isConnecting}
      />

      {/* Audio Call Confirmation Dialog */}
      <CallConfirmationDialog
        isOpen={showAudioConfirmDialog}
        onClose={handleAudioDialogClose}
        onConfirm={handleAudioCall}
        astrologer={astrologer}
        isLoading={isConnecting}
        callType="audio"
        rate={rpm || 15}
      />
    </>
  );
}
