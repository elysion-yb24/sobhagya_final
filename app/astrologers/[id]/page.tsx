"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Star, 
  Phone, 
  Video, 
  Clock, 
  Users, 
  Award, 
  MapPin, 
  Languages,
  Heart,
  Gift,
  MessageCircle,
  Calendar,
  Shield,
  Verified,
  PhoneCall,
  VideoIcon,
  X,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getAuthToken, clearAuthData, isAuthenticated, getUserDetails } from "../../utils/auth-utils";
import { getApiBaseUrl } from "../../config/api";


// Updated Astrologer interface with all API fields
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

interface Review {
  _id: string;
  userId: string;
  userName: string;
  astrologerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Gift {
  _id: string;
  name: string;
  icon: string;
  price: number;
  description?: string;
}

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  type?: 'default' | 'warning' | 'success';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText = "Cancel",
  type = 'default',
  isLoading = false,
  icon
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-orange-500 hover:bg-orange-600 text-white';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-orange-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div className={`p-3 rounded-full bg-gray-100 ${getIconColor()}`}>
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">{message}</p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${getButtonStyles()}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AstrologerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const astrologerId = params?.id as string;
  
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Call states
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [isAudioCallProcessing, setIsAudioCallProcessing] = useState(false);
  const [isVideoCallProcessing, setIsVideoCallProcessing] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<'audio' | 'video' | null>(null);
  
  // Gift/Dakshina states
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isSendingGift, setIsSendingGift] = useState(false);
  const [giftSent, setGiftSent] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Confirmation dialog states
  const [showFreeCallConfirm, setShowFreeCallConfirm] = useState(false);
  const [showAudioCallConfirm, setShowAudioCallConfirm] = useState(false);
  const [showVideoCallConfirm, setShowVideoCallConfirm] = useState(false);
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      clearAuthData();
      router.push("/");
      return;
    }

    // Clear any cached free call status to ensure fresh API check
    localStorage.removeItem(`freeCallUsed_${astrologerId}`);
    
    fetchAstrologerProfile();
    fetchReviews();
    fetchGifts();
    checkFreeCallStatus();
    fetchWalletBalance();
  }, [astrologerId, router]);

  const fetchAstrologerProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${getApiBaseUrl()}/user/api/users?skip=0&limit=10`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch astrologer profile");
      }

      const result = await response.json();
      let astrologers: any[] = [];
      
      if (result?.data?.list && Array.isArray(result.data.list)) {
        astrologers = result.data.list;
      } else if (result?.list && Array.isArray(result.list)) {
        astrologers = result.list;
      }

      const foundAstrologer = astrologers.find(ast => 
        ast._id === astrologerId || 
        ast.id === astrologerId || 
        ast.numericId?.toString() === astrologerId
      );

      if (!foundAstrologer) {
        throw new Error("Astrologer not found");
      }

      // Normalize the data
      const normalizedAstrologer: Astrologer = {
        _id: foundAstrologer._id || foundAstrologer.id || foundAstrologer.numericId?.toString() || '',
        name: foundAstrologer.name || "Unknown Astrologer",
        languages: Array.isArray(foundAstrologer.language) 
          ? foundAstrologer.language 
          : typeof foundAstrologer.language === 'string' 
            ? foundAstrologer.language.split(',').map((lang: string) => lang.trim())
            : ["Hindi"],
        specializations: foundAstrologer.talksAbout || [],
        experience: foundAstrologer.age?.toString() || "0",
        callsCount: foundAstrologer.calls || 0,
        rating: foundAstrologer.rating?.avg || foundAstrologer.rating || 5,
        profileImage: foundAstrologer.avatar || "",
        hasVideo: foundAstrologer.isVideoCallAllowed || false,
        // All additional fields
        about: foundAstrologer.about || "",
        age: foundAstrologer.age,
        avatar: foundAstrologer.avatar,
        callMinutes: foundAstrologer.callMinutes,
        calls: foundAstrologer.calls,
        createdAt: foundAstrologer.createdAt,
        isLive: foundAstrologer.isLive,
        isRecommended: foundAstrologer.isRecommended,
        isVideoCallAllowed: foundAstrologer.isVideoCallAllowed,
        numericId: foundAstrologer.numericId,
        offerRpm: foundAstrologer.offerRpm,
        phone: foundAstrologer.phone,
        priority: foundAstrologer.priority,
        role: foundAstrologer.role,
        rpm: foundAstrologer.rpm,
        status: foundAstrologer.status,
        talksAbout: foundAstrologer.talksAbout,
        upi: foundAstrologer.upi,
        videoRpm: foundAstrologer.videoRpm
      };

      setAstrologer(normalizedAstrologer);
    } catch (error) {
      console.error("Error fetching astrologer profile:", error);
      setError(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

    const fetchReviews = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${getApiBaseUrl()}/user/api/top-reviews?partnerId=${astrologerId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get reviews from response
        let allReviews = [];
        if (data.data && Array.isArray(data.data)) {
          allReviews = data.data;
        } else if (data.list && Array.isArray(data.list)) {
          allReviews = data.list;
        } else if (Array.isArray(data)) {
          allReviews = data;
        }
        
        // Filter reviews for this astrologer using the 'to' field
        const astrologerReviews = allReviews.filter((review: any) => 
          review.to === astrologerId
        );
        
        // Transform reviews to match our interface
        const transformedReviews = astrologerReviews.map((review: any) => ({
          _id: review._id,
          userId: review.by,
          userName: review.name || 'Anonymous',
          astrologerId: review.to,
          rating: review.rating || 0,
          comment: review.message || '',
          createdAt: review.createdAt
        }));
        
        setReviews(transformedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchGifts = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${getApiBaseUrl()}/calling/api/gift/get-gifts`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGifts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${getApiBaseUrl()}/payment/api/transaction/wallet-balance`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.data?.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const checkFreeCallStatus = async () => {
    try {
      const token = getAuthToken();
      const userDetails = getUserDetails();
      
      if (!token || !userDetails?.id) {
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
          call.astrologerId === astrologerId || call.receiverId === astrologerId
        ) || [];
        
        if (callsWithThisAstrologer.length > 0) {
          setHasCompletedFreeCall(true);
          localStorage.setItem(`freeCallUsed_${astrologerId}`, 'true');
        } else {
          // Also check localStorage as fallback
          const freeCallUsed = localStorage.getItem(`freeCallUsed_${astrologerId}`);
          if (freeCallUsed === 'true') {
            setHasCompletedFreeCall(true);
          }
        }
      } else {
        // Fallback to localStorage if API fails
        const freeCallUsed = localStorage.getItem(`freeCallUsed_${astrologerId}`);
        if (freeCallUsed === 'true') {
          setHasCompletedFreeCall(true);
        }
      }
    } catch (error) {
      console.error('Error checking call history:', error);
      // Fallback to localStorage if API fails
      const freeCallUsed = localStorage.getItem(`freeCallUsed_${astrologerId}`);
      if (freeCallUsed === 'true') {
        setHasCompletedFreeCall(true);
      }
    }
  };

  const handleSendGift = async (gift: Gift | null) => {
    try {
      if (!gift) {
        alert('Please select a gift first.');
        return;
      }

      if (walletBalance < gift.price) {
        alert('Insufficient wallet balance. Please add funds to your wallet.');
        return;
      }

      setIsSendingGift(true);
      setShowGiftConfirm(false);
      const token = getAuthToken();
      const userDetails = getUserDetails();
      
      if (!token || !userDetails?.id) {
        throw new Error('Authentication required');
      }

      const giftData = {
        id: gift._id,
        receiverUserId: astrologerId,
      };

      const response = await fetch(`${getApiBaseUrl()}/calling/api/gift/send-gift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(giftData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send gift');
      }

      // Update wallet balance
      setWalletBalance(prev => prev - gift.price);
      setGiftSent(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowGiftModal(false);
        setGiftSent(false);
        setSelectedGift(null);
      }, 2000);

    } catch (error) {
      console.error('Error sending gift:', error);
      alert(error instanceof Error ? error.message : 'Failed to send gift');
    } finally {
      setIsSendingGift(false);
    }
  };

  const handleFreeCallRequest = async () => {
    try {
      setIsCallRequested(true);
      setShowFreeCallConfirm(false);
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
          astrologerId: astrologer?._id,
          callerId: userDetails.id,
          receiverId: astrologer?._id,
          callType: 'free',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate call');
      }

      // Mark free call as used
      localStorage.setItem(`freeCallUsed_${astrologerId}`, 'true');
      
      // Show success state and then switch to paid call options
      setTimeout(() => {
        setIsCallRequested(false);
        setHasCompletedFreeCall(true);
      }, 3000);

    } catch (error) {
      console.error('Call request error:', error);
      setIsCallRequested(false);
      alert(error instanceof Error ? error.message : 'Failed to initiate call');
    }
  };

  const handleAudioCall = async () => {
    try {
      setIsAudioCallProcessing(true);
      setShowAudioCallConfirm(false);
      setCurrentCallType('audio');
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
          astrologerId: astrologer?._id,
          callerId: userDetails.id,
          receiverId: astrologer?._id,
          callType: 'audio',
          rpm: astrologer?.rpm || 15,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate audio call');
      }

      const result = await response.json();
      console.log('Audio call initiated:', result);

      // Show success state
      setTimeout(() => {
        setIsAudioCallProcessing(false);
        setCurrentCallType(null);
      }, 3000);

    } catch (error) {
      console.error('Audio call error:', error);
      setIsAudioCallProcessing(false);
      setCurrentCallType(null);
      alert(error instanceof Error ? error.message : 'Failed to initiate audio call');
    }
  };

  const handleVideoCall = async () => {
    try {
      setIsVideoCallProcessing(true);
      setShowVideoCallConfirm(false);
      setCurrentCallType('video');
      const token = getAuthToken();
      const userDetails = getUserDetails();
      
      if (!token || !userDetails?.id) {
        throw new Error('Authentication required');
      }

      // First, initiate the video call request
      const response = await fetch(`${getApiBaseUrl()}/calling/api/call/request-video-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          astrologerId: astrologer?._id,
          callerId: userDetails.id,
          receiverId: astrologer?._id,
          callType: 'video',
          rpm: astrologer?.videoRpm || 20,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate video call');
      }

      const result = await response.json();
      console.log('Video call initiated:', result);

      // Initialize LiveKit for video call
      await initializeLiveKitCall(result);

    } catch (error) {
      console.error('Video call error:', error);
      setIsVideoCallProcessing(false);
      setCurrentCallType(null);
      alert(error instanceof Error ? error.message : 'Failed to initiate video call');
    }
  };

  const initializeLiveKitCall = async (callData: any) => {
    try {
      // Get LiveKit token from your backend
      const token = getAuthToken();
      const liveKitResponse = await fetch(`${getApiBaseUrl()}/calling/api/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomName: callData.roomId || `call_${astrologer?._id}_${Date.now()}`,
          participantName: getUserDetails()?.name || 'User',
          astrologerId: astrologer?._id,
        }),
        credentials: 'include',
      });

      if (!liveKitResponse.ok) {
        throw new Error('Failed to get LiveKit token');
      }

      const liveKitData = await liveKitResponse.json();
      
      // Redirect to video call page with LiveKit token
      const videoCallUrl = `/video-call?token=${encodeURIComponent(liveKitData.token)}&room=${encodeURIComponent(liveKitData.roomName)}&astrologer=${encodeURIComponent(astrologer?.name || '')}`;
      
      // Open video call in new window or navigate
      window.open(videoCallUrl, '_blank', 'width=1200,height=800');
      
      // Reset state after opening video call
      setTimeout(() => {
        setIsVideoCallProcessing(false);
        setCurrentCallType(null);
      }, 2000);

    } catch (error) {
      console.error('LiveKit initialization error:', error);
      setIsVideoCallProcessing(false);
      setCurrentCallType(null);
      alert('Failed to initialize video call. Please try again.');
    }
  };

  const getRatingDisplay = (rating: number | { avg: number; count: number; max: number; min: number }) => {
    return typeof rating === 'number' ? rating : rating.avg;
  };

  const getRatingCount = (rating: number | { avg: number; count: number; max: number; min: number }) => {
    return typeof rating === 'number' ? 0 : rating.count;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !astrologer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || "Astrologer not found"}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/astrologers')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Back to Astrologers
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={astrologer.profileImage || astrologer.avatar || '/default-astrologer.png'}
                alt={astrologer.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-orange-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=f97316&color=fff&size=96`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Online
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{astrologer.name}</h1>
                <Verified className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-3">
                {astrologer.specializations?.slice(0, 3).map((spec, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {spec}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 mb-4">
                <Languages className="h-4 w-4" />
                <span className="text-sm">{astrologer.languages?.join(" • ")}</span>
              </div>

              {/* Simple Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{astrologer.experience}</div>
                  <div className="text-xs text-gray-500">Years Exp</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{astrologer.callsCount}</div>
                  <div className="text-xs text-gray-500">Consultations</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-gray-900">{getRatingDisplay(astrologer.rating).toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">₹{astrologer.rpm || 15}</div>
                  <div className="text-xs text-gray-500">Per Minute</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {!hasCompletedFreeCall ? (
              <button
                onClick={() => setShowFreeCallConfirm(true)}
                disabled={isCallRequested}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isCallRequested ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    FREE First Call
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAudioCallConfirm(true)}
                  disabled={isAudioCallProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {isAudioCallProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Audio Call - ₹{astrologer.rpm || 15}/min
                    </>
                  )}
                </button>
                
                {astrologer.isVideoCallAllowed && (
                  <button
                    onClick={() => setShowVideoCallConfirm(true)}
                    disabled={isVideoCallProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    {isVideoCallProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4" />
                        Video Call - ₹{astrologer.videoRpm || 20}/min
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            <button
              onClick={() => setShowGiftModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-md font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Heart className="h-4 w-4" />
              Send Dakshina
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {astrologer.about && (
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  About {astrologer.name}
                </h2>
                <p className="text-gray-700 leading-relaxed">{astrologer.about}</p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  Reviews & Feedback
                </h2>
                {reviews.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {reviews.length} Reviews
                  </span>
                )}
              </div>
              
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="ml-2 text-gray-600">Loading reviews...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={review._id || index} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < (review.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">{review.rating || 0}/5</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{review.comment || 'No comment provided'}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date not available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Be the first to share your experience with {astrologer.name}.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-500" />
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total Calls</span>
                  <span className="font-semibold text-gray-900">{astrologer.callsCount}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold text-gray-900">{astrologer.experience} years</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">{getRatingDisplay(astrologer.rating).toFixed(1)}/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Audio Rate</span>
                  <span className="font-semibold text-green-600">₹{astrologer.rpm || 15}/min</span>
                </div>
                {astrologer.isVideoCallAllowed && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Video Rate</span>
                    <span className="font-semibold text-blue-600">₹{astrologer.videoRpm || 20}/min</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Specializations
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {astrologer.specializations?.map((spec, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Trust & Safety
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 text-sm font-medium">Verified Astrologer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 text-sm font-medium">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showFreeCallConfirm}
        onClose={() => setShowFreeCallConfirm(false)}
        onConfirm={handleFreeCallRequest}
        title="Start Free Call"
        message={`Do you want to start a free consultation call with ${astrologer.name}? This is a one-time free offer.`}
        confirmText="Start Call"
        icon={<Phone className="h-6 w-6" />}
        type="success"
        isLoading={isCallRequested}
      />

      <ConfirmationDialog
        isOpen={showAudioCallConfirm}
        onClose={() => setShowAudioCallConfirm(false)}
        onConfirm={handleAudioCall}
        title="Start Audio Call"
        message={`Start an audio consultation with ${astrologer.name} at ₹${astrologer.rpm || 15}/minute? Charges will be deducted from your wallet.`}
        confirmText="Start Call"
        icon={<Phone className="h-6 w-6" />}
        isLoading={isAudioCallProcessing}
      />

      <ConfirmationDialog
        isOpen={showVideoCallConfirm}
        onClose={() => setShowVideoCallConfirm(false)}
        onConfirm={handleVideoCall}
        title="Start Video Call"
        message={`Start a video consultation with ${astrologer.name} at ₹${astrologer.videoRpm || 20}/minute? Charges will be deducted from your wallet.`}
        confirmText="Start Call"
        icon={<Video className="h-6 w-6" />}
        isLoading={isVideoCallProcessing}
      />

      <ConfirmationDialog
        isOpen={showGiftConfirm}
        onClose={() => setShowGiftConfirm(false)}
        onConfirm={() => handleSendGift(selectedGift)}
        title="Send Dakshina"
        message={selectedGift ? `Send ${selectedGift.name} worth ₹${selectedGift.price} to ${astrologer.name}?` : ''}
        confirmText="Send Gift"
        icon={<Heart className="h-6 w-6" />}
        type="success"
        isLoading={isSendingGift}
      />

      {/* Enhanced Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Send Dakshina</h2>
                  <p className="text-gray-600">Wallet Balance: ₹{walletBalance.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {giftSent ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gift Sent Successfully!</h3>
                  <p className="text-gray-600">Your dakshina has been sent to {astrologer.name}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gifts.map((gift) => (
                    <div
                      key={gift._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors hover:border-orange-300 hover:bg-orange-50 ${
                        selectedGift?._id === gift._id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedGift(gift)}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                          {gift.icon ? (
                            <img
                              src={gift.icon}
                              alt={gift.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Gift className={`h-6 w-6 text-gray-400 ${gift.icon ? 'hidden' : ''}`} />
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{gift.name}</h3>
                        <p className="text-orange-600 font-semibold text-sm">₹{gift.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedGift && !giftSent && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedGift.name}</h3>
                      <p className="text-orange-600 font-semibold">₹{selectedGift.price}</p>
                    </div>
                    <button
                      onClick={() => setSelectedGift(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {walletBalance >= selectedGift.price ? (
                    <button
                      onClick={() => setShowGiftConfirm(true)}
                      disabled={isSendingGift}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Send Dakshina
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-600 mb-3 text-sm">Insufficient wallet balance</p>
                      <button
                        onClick={() => router.push('/wallet')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        Add Funds
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

