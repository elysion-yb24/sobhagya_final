"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getAuthToken, clearAuthData, isAuthenticated, getUserDetails } from "../../utils/auth-utils";
import { getApiBaseUrl, buildApiUrl, API_CONFIG } from "../../config/api";
import { fetchWalletBalance as simpleFetchWalletBalance } from '../../utils/production-api';
import InsufficientBalanceModal from '../../components/ui/InsufficientBalanceModal';
import CallInitiatedModal from '../../components/ui/CallInitiatedModal';
import GiftConfirmationDialog from '../../components/ui/GiftConfirmationDialog';
import { initiateCall } from '../../utils/calling-utils';


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
  priority?: number;
  reportCount?: number;
  role?: string;
  rpm?: number;
  sample?: string;
  status?: string;
  talksAbout?: string[];
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
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
  const searchParams = useSearchParams();
  const astrologerId = params?.id as string;
  
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [similarAstrologers, setSimilarAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Call states
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
  const [userHasCalledBefore, setUserHasCalledBefore] = useState(false);
  const [isCallRequested, setIsCallRequested] = useState(false);
  const [isAudioCallProcessing, setIsAudioCallProcessing] = useState(false);
  const [isVideoCallProcessing, setIsVideoCallProcessing] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<'audio' | 'video' | null>(null);
  const [showCallInitiatedModal, setShowCallInitiatedModal] = useState(false);
  
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

  // Insufficient balance modal state
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
    requiredAmount: number;
    serviceType: 'call' | 'gift' | 'consultation';
  } | null>(null);

  // Scroll functionality for similar astrologers
  const scrollLeft = () => {
    const container = document.getElementById('similar-astrologers-container');
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('similar-astrologers-container');
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    console.log('🚀 Page useEffect triggered:', { astrologerId });
    
    // Check user role first
    const user = getUserDetails();
    if (user && user.role === 'friend') {
      console.log('User is a friend, redirecting to partner info page');
      router.push('/partner-info');
      return;
    }
    
    // Initialize auth with token validation and extension
    const isAuthValid = isAuthenticated();
    
    if (!isAuthValid) {
      console.log('❌ User authentication failed, redirecting to home');
      clearAuthData();
      router.push("/");
      return;
    }

    // Clear any cached free call status to ensure fresh API check
    localStorage.removeItem(`freeCallUsed_${astrologerId}`);
    
    console.log('✅ Authentication verified, starting data fetch for astrologer:', astrologerId);
    fetchAstrologerProfile();
    fetchReviews();
    fetchGifts();
    checkFreeCallStatus();
    fetchWalletBalance();
  }, [astrologerId, router]);

  // Fetch similar astrologers when main astrologer data is loaded
  useEffect(() => {
    if (astrologer && astrologer.specializations?.length > 0) {
      fetchSimilarAstrologers();
    }
  }, [astrologer]);

  // Handle callType query parameter for direct call initiation
  useEffect(() => {
    const callType = searchParams?.get('callType');
    console.log('🔍 Astrologer profile: Checking for callType in query params:', callType);
    console.log('🔍 Astrologer profile: astrologer loaded:', !!astrologer);
    
    if (callType && astrologer) {
      console.log('✅ Found callType in query params:', callType, 'for astrologer:', astrologer.name);
      
      // Clear the query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Directly initiate call without confirmation dialog
      if (callType === 'audio') {
        console.log('🎯 Directly initiating audio call (no confirmation)');
        handleAudioCall();
      } else if (callType === 'video') {
        console.log('🎯 Directly initiating video call (no confirmation)');
        handleVideoCall();
      }
    }
  }, [searchParams, astrologer]);

  const fetchSimilarAstrologers = async () => {
    try {
      setSimilarLoading(true);
      const token = getAuthToken();
      if (!token || !astrologer?.specializations?.length) {
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/user/api/users-list?skip=0&limit=20`,
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
        console.warn("Similar astrologers fetch failed:", response.status);
        return;
      }

      const result = await response.json();
      let allAstrologers: any[] = [];
      
      if (result?.data?.list && Array.isArray(result.data.list)) {
        allAstrologers = result.data.list;
      } else if (result?.list && Array.isArray(result.list)) {
        allAstrologers = result.list;
      }

      // Filter astrologers with similar specializations (excluding current astrologer)
      const currentSpecializations = astrologer.specializations.map(spec => spec.toLowerCase());
      const similarAsts = allAstrologers
        .filter(ast => ast._id !== astrologerId) // Exclude current astrologer
        .filter(ast => {
          const astSpecializations = (ast.talksAbout || []).map((spec: string) => spec.toLowerCase());
          return astSpecializations.some((spec: string) => 
            currentSpecializations.some((currentSpec: string) => 
              spec.includes(currentSpec) || currentSpec.includes(spec)
            )
          );
        })
        .slice(0, 5) // Limit to 5 similar astrologers
        .map((ast: any) => ({
          _id: ast._id || ast.id || ast.numericId?.toString() || '',
          name: ast.name || "Unknown Astrologer",
          languages: Array.isArray(ast.language) 
            ? ast.language 
            : typeof ast.language === 'string' 
              ? ast.language.split(',').map((lang: string) => lang.trim())
              : ["Hindi"],
          specializations: ast.talksAbout || [],
          experience: ast.age?.toString() || "0",
          callsCount: ast.calls || 0,
          rating: ast.rating?.avg || ast.rating || 5,
          profileImage: ast.avatar || "",
          hasVideo: ast.isVideoCallAllowed || false,
          rpm: ast.rpm || 15,
          videoRpm: ast.videoRpm || 20
        }));

      setSimilarAstrologers(similarAsts);
    } catch (error) {
      console.error("Error fetching similar astrologers:", error);
    } finally {
      setSimilarLoading(false);
    }
  };

  const fetchAstrologerProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        console.error("❌ No authentication token found");
        clearAuthData();
        router.push("/");
        return;
      }

      // First try to get specific astrologer by ID if there's a specific endpoint
      let foundAstrologer = null;
      
      try {
        // Try specific astrologer endpoint first
        const specificResponse = await fetch(
          `${getApiBaseUrl()}/user/api/users/${astrologerId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: 'include',
          }
        );

        if (specificResponse.ok) {
          const specificResult = await specificResponse.json();
          if (specificResult?.data) {
            foundAstrologer = specificResult.data;
          } else if (specificResult && specificResult._id) {
            foundAstrologer = specificResult;
          }
        }
      } catch (specificError) {
        console.log("Specific endpoint not available, falling back to search");
      }

      // If specific endpoint didn't work, search through the listing endpoint.
      // Use /user/api/users-list (the actual listing path on this backend);
      // /user/api/users returns 4xx and was the cause of "Failed to fetch astrologer profile".
      if (!foundAstrologer) {
        let currentSkip = 0;
        const limit = 50;
        let searchCompleted = false;

        while (!searchCompleted && !foundAstrologer) {
          let astrologers: any[] = [];
          try {
            const response = await fetch(
              `${getApiBaseUrl()}/user/api/users-list?skip=${currentSkip}&limit=${limit}`,
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
              const result = await response.json();
              if (result?.data?.list && Array.isArray(result.data.list)) {
                astrologers = result.data.list;
              } else if (result?.list && Array.isArray(result.list)) {
                astrologers = result.list;
              }
            } else {
              console.warn(`Listing endpoint returned ${response.status}, stopping search.`);
            }
          } catch (listErr) {
            console.warn("Listing fetch failed:", listErr);
          }

          foundAstrologer = astrologers.find(ast =>
            ast._id === astrologerId ||
            ast.id === astrologerId ||
            ast.numericId?.toString() === astrologerId
          );

          if (foundAstrologer || astrologers.length < limit) {
            searchCompleted = true;
          } else {
            currentSkip += limit;
          }
        }
      }

      if (!foundAstrologer) {
        throw new Error("Astrologer not found in the system");
      }

      console.log("✅ Found astrologer:", foundAstrologer.name);
      console.log("Astrologer details:", {
        id: foundAstrologer._id || foundAstrologer.id || foundAstrologer.numericId,
        name: foundAstrologer.name,
        searchedFor: astrologerId
      });

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
        priority: foundAstrologer.priority,
        role: foundAstrologer.role,
        rpm: foundAstrologer.rpm,
        status: foundAstrologer.status,
        talksAbout: foundAstrologer.talksAbout,
        videoRpm: foundAstrologer.videoRpm
      };

      setAstrologer(normalizedAstrologer);
    } catch (error) {
      console.error("Error fetching astrologer profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
      
      if (errorMessage.includes("not found")) {
        setError(`Astrologer with ID "${astrologerId}" was not found. Please check the URL or try browsing our astrologers.`);
      } else {
        setError(errorMessage);
      }
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
      if (!token) {
        console.log('No auth token found for wallet balance');
        return;
      }

      // Use simple API function (works same in dev and production)
      console.log('Fetching wallet balance in astrologer profile...');
      const balance = await simpleFetchWalletBalance();
      setWalletBalance(balance);
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
        console.log('Profile page - Call history response:', callHistory);
        
        // Check if user has ANY previous calls (with any astrologer)
        const totalCalls = callHistory.data?.list?.length || 0;
        console.log('Profile page - Total calls found:', totalCalls);
        
        if (totalCalls > 0) {
          console.log('Profile page - User has call history, hiding free call option');
          setHasCompletedFreeCall(true);
          setUserHasCalledBefore(true);
          // Mark globally that user has used free call
          localStorage.setItem('userHasCalledBefore', 'true');
        } else {
          console.log('Profile page - No call history found, checking localStorage');
          // Also check localStorage as fallback
          const hasCalledBefore = localStorage.getItem('userHasCalledBefore');
          console.log('Profile page - localStorage userHasCalledBefore:', hasCalledBefore);
          if (hasCalledBefore === 'true') {
            setHasCompletedFreeCall(true);
            setUserHasCalledBefore(true);
          }
        }
      } else {
        console.log('Profile page - Call history API failed with status:', response.status);
        // Fallback to localStorage if API fails
        const hasCalledBefore = localStorage.getItem('userHasCalledBefore');
        if (hasCalledBefore === 'true') {
          setHasCompletedFreeCall(true);
          setUserHasCalledBefore(true);
        }
      }
    } catch (error) {
      console.error('Error checking call history:', error);
      // Fallback to localStorage if API fails
      const hasCalledBefore = localStorage.getItem('userHasCalledBefore');
      if (hasCalledBefore === 'true') {
        setHasCompletedFreeCall(true);
        setUserHasCalledBefore(true);
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
        receiverUserId: astrologer?._id,
        giftId: gift._id,
        amount: gift.price,
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
        let errorMessage = 'Failed to send gift';
        try {
          const errorData = await response.json();
          console.error('🎁 Gift API error:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('🎁 Failed to parse gift error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
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

      // Mark free call as used globally
      localStorage.setItem('userHasCalledBefore', 'true');
      setUserHasCalledBefore(true);
      
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
    if (!partner || !partner._id) return;
    
    try {
      setIsAudioCallProcessing(true);
      setCurrentCallType('audio');
      
      const audioRpm = partner?.rpm || 15;
      const avatarUrl = partner?.avatar || partner?.profileImage || '';

      await initiateCall({
        astrologerId: partner._id,
        astrologerName: partner.name,
        callType: 'audio',
        avatarUrl,
        rpm: audioRpm
      });
      
    } catch (error: any) {
      setIsAudioCallProcessing(false);
      setCurrentCallType(null);
      
      if (error.message === 'DONT_HAVE_ENOUGH_BALANCE') {
        const audioRpm = partner?.rpm || 15;
        setInsufficientBalanceData({
          requiredAmount: Number(audioRpm) * 2,
          serviceType: 'call'
        });
        setShowInsufficientBalanceModal(true);
      } else {
        // Already alerted in utility
      }
    }
  };

  const fetchWalletPageData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Use Next.js API route instead of calling backend directly to avoid CORS
      const response = await fetch('/api/wallet-balance', {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const balance = data.data?.balance || 0;
        setWalletBalance(balance);
        return balance;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      return 0;
    }
  };

  // Rename astrologer to partner for consistency
  const partner = astrologer;

  const handleAudioCallClick = () => {
    // Check if user is authenticated
    const isAuthValid = isAuthenticated();
    
    if (isAuthValid) {
      // If authenticated, directly initiate audio call
      handleAudioCall();
    } else {
      // If not authenticated, store call type and astrologer ID, then go through call flow
      localStorage.setItem('selectedAstrologerId', astrologer?._id || '');
      localStorage.setItem('callType', 'audio');
      console.log('User not authenticated, redirecting to call flow for audio call');
      router.push('/calls/call1?astrologerId=' + (astrologer?._id || ''));
    }
  };

  const handleVideoCallClick = () => {
    // Check if user is authenticated
    const isAuthValid = isAuthenticated();
    
    if (isAuthValid) {
      // If authenticated, directly initiate video call
      handleVideoCall();
    } else {
      // If not authenticated, store call type and astrologer ID, then go through call flow
      localStorage.setItem('selectedAstrologerId', astrologer?._id || '');
      localStorage.setItem('callType', 'video');
      console.log('User not authenticated, redirecting to call flow for video call');
      router.push('/calls/call1?astrologerId=' + (astrologer?._id || ''));
    }
  };

  const handleVideoCall = async () => {
    if (!partner || !partner._id) return;

    try {
      setIsVideoCallProcessing(true);
      setCurrentCallType('video');
      
      const videoRpm = partner?.videoRpm || 20;
      const avatarUrl = partner?.avatar || partner?.profileImage || '';

      await initiateCall({
        astrologerId: partner._id,
        astrologerName: partner.name,
        callType: 'video',
        avatarUrl,
        rpm: videoRpm
      });
      
    } catch (error: any) {
      setIsVideoCallProcessing(false);
      setCurrentCallType(null);
      
      if (error.message === 'DONT_HAVE_ENOUGH_BALANCE') {
        const videoRpm = partner?.videoRpm || 20;
        setInsufficientBalanceData({
          requiredAmount: Number(videoRpm) * 2,
          serviceType: 'call'
        });
        setShowInsufficientBalanceModal(true);
      } else {
        // Already alerted in utility
      }
    }
  };

  const getRatingDisplay = (rating: number | { avg: number; count: number; max: number; min: number }) => {
    return typeof rating === 'number' ? rating : rating.avg;
  };

  const getRatingCount = (rating: number | { avg: number; count: number; max: number; min: number }) => {
    return typeof rating === 'number' ? 0 : rating.count;
  };

  // Dakshina modal scroll lock
  useEffect(() => {
    if (showGiftModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showGiftModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#F7971E' }} />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !astrologer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {error?.includes("not found") ? "Astrologer Not Found" : "Something Went Wrong"}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || "The astrologer you're looking for could not be found. They may have been removed or the URL might be incorrect."}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/astrologers')}
              className="w-full text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: '#F7971E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8850B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7971E'}
            >
              Browse All Astrologers
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> If you believe this is an error, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CallInitiatedModal visible={showCallInitiatedModal} onClose={() => setShowCallInitiatedModal(false)} />
      <div className="min-h-screen bg-white">
        {/* Extended Cosmic Background Header */}
        <div 
          className="h-40 relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/cosmic%20image.png')"
          }}
        >
          {/* Back button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFB366'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>

          {/* Profile Image positioned in cosmic section - Centered on mobile, left on md+ */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-48 md:translate-x-0 transform translate-y-1/2">
            <div className="relative">
              <img
                src={astrologer?.avatar || astrologer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer?.name || 'Astrologer')}&background=f97316&color=fff&size=144`}
                alt={astrologer?.name || 'Astrologer'}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover shadow-lg"
                style={{ 
                  borderColor: astrologer?.status === 'online' ? '#22C55E' : astrologer?.status === 'busy' ? '#F59E0B' : '#EF4444'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer?.name || 'Astrologer')}&background=f97316&color=fff&size=144`;
                }}
              />
              {/* Status indicator positioned on the image */}
              <div 
                className="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: astrologer?.status === 'online' ? '#22C55E' : astrologer?.status === 'busy' ? '#F59E0B' : '#EF4444'
                }}
              >
                <div 
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-12">
            {/* Enhanced Profile Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Left Column - Main Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                           {/* Basic Info */}
                 <div className="bg-white rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-3 mb-3">
                     <h1 className="text-3xl font-bold text-gray-900">{astrologer?.name}</h1>
                     
                     {/* Blue verification tick - Instagram style */}
                     {/* <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                       <path 
                         d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                         fill="#1DA1F2"
                       />
                     </svg> */}

                     <img src="/orange_tick.png" alt="Orange Tick" className="w-5 h-5" />
                     
                     {/* Status indicator */}
                     {/* <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                       style={{
                         backgroundColor: astrologer?.status === 'online' ? '#22C55E' : astrologer?.status === 'busy' ? '#F59E0B' : '#EF4444',
                         color: 'white'
                       }}
                     >
                       <div 
                         className="w-2 h-2 rounded-full animate-pulse"
                         style={{ backgroundColor: 'white' }}
                       />
                       <span>
                         {astrologer?.status === 'online' ? 'Online' : astrologer?.status === 'busy' ? 'Busy' : 'Offline'}
                       </span>
                     </div> */}
                   </div>
                  <p className="text-gray-600 text-lg mb-1">
                    {astrologer?.specializations?.join(', ')}
                  </p>
                  <p className="text-gray-500 mb-1">
                    {astrologer?.languages?.join(', ')}
                  </p>
                  <p className="text-gray-500 mb-3">
                    Exp:- {astrologer?.experience} years
                  </p>
                  <p className="font-bold text-2xl mb-4" style={{ color: '#F7971E' }}>
                    ₹ {astrologer?.rpm || 15}/ min
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(getRatingDisplay(astrologer?.rating || 5)) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-gray-600 font-medium ml-2">
                      Rating {getRatingDisplay(astrologer?.rating || 5).toFixed(1)}
                    </span>
                  </div>

                  {/* Action Buttons - Dakshina, Phone, Video, and Follow side by side */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      onClick={() => setShowGiftModal(true)}
                      className="text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
                      style={{ backgroundColor: '#F7971E' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8850B'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7971E'}
                    >
                      Dakshina
                    </button>
                    <button
                      onClick={() => handleAudioCallClick()}
                      disabled={isAudioCallProcessing}
                      className="bg-white border-2 text-black px-6 py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-sm flex items-center gap-2 hover:shadow-lg hover:scale-105"
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
                      <Phone className="w-4 h-4" />
                      {isAudioCallProcessing ? 'Connecting...' : 'Audio Call'}
                    </button>
                    <button
                      onClick={() => handleVideoCallClick()}
                      disabled={isVideoCallProcessing}
                      className="bg-white border-2 text-black px-6 py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-sm flex items-center gap-2 hover:shadow-lg hover:scale-105"
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
                      <Video className="w-4 h-4" />
                      {isVideoCallProcessing ? 'Connecting...' : 'Video Call'}
                    </button>

                  </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {astrologer?.about || `Astrologer ${astrologer?.name} is a renowned expert in ${astrologer?.specializations?.join(', ')}, and spiritual guidance. With years of experience, he provides deep insights into love, career, health, and life challenges. His accurate predictions and effective remedies have helped countless individuals find clarity and success. Whether you seek answers about your future or solutions to obstacles, ${astrologer?.name} offers personalized consultations to align your life with cosmic energies.`}
                  </p>
                </div>
              </div>

              {/* Right Column - Stats & Quick Info */}
              <div className="space-y-6">
                {/* Call and Message Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FDF4E6' }}>
                        <Phone className="h-5 w-5" style={{ color: '#F7971E' }} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Call</div>
                        <div className="font-semibold text-gray-900">{astrologer?.callsCount || 1}k mins</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FDF4E6' }}>
                        <MessageCircle className="h-5 w-5" style={{ color: '#F7971E' }} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Message</div>
                        <div className="font-semibold text-gray-900">488k mins</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Card */}
               
              </div>
            </div>

            {/* Similar Astrologers Section - Centered */}
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-bold mb-8" style={{ color: '#745802', fontFamily: 'EB Garamond, serif' }}>
                Check Similar {astrologer?.specializations?.[0] || 'Astrology'} Experts
              </h2>
              
              {similarLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#F7971E' }} />
                  <span className="ml-3 text-gray-600">Loading similar astrologers...</span>
                </div>
              ) : (
                <div className="relative">
                  {/* Left Arrow */}
                  {similarAstrologers.length > 0 && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                      style={{ marginLeft: '-24px' }}
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                  )}

                  {/* Scrollable Container */}
                  <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" id="similar-astrologers-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {similarAstrologers.length > 0 ? similarAstrologers.map((ast, index) => (
                      <div key={ast._id || index} className="flex-shrink-0 w-56 bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                            <img 
                              src={ast.avatar || ast.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name)}&background=f97316&color=fff&size=80`} 
                              alt={ast.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name)}&background=f97316&color=fff&size=80`;
                              }}
                            />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-base">{ast.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{ast.specializations?.slice(0, 2).join(', ')}</p>
                          <p className="text-sm text-gray-500 mb-4">Exp: {ast.experience} years</p>
                          <button 
                            onClick={() => router.push(`/astrologers/${ast._id}`)}
                            className="w-full text-white py-3 rounded-lg text-sm font-semibold transition-colors"
                            style={{ backgroundColor: '#F7971E' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8850B'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7971E'}
                          >
                            {userHasCalledBefore ? `₹${ast.rpm || 15}/min` : 'OFFER: FREE 1st call'}
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="w-full text-center py-12">
                        <p className="text-gray-500 text-lg">No similar astrologers found</p>
                      </div>
                    )}
                  </div>

                  {/* Right Arrow */}
                  {similarAstrologers.length > 0 && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                      style={{ marginRight: '-24px' }}
                    >
                      <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Reviews</h3>
              
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#F7971E' }} />
                  <span className="ml-3 text-gray-600">Loading reviews...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.slice(0, 3).map((review, index) => (
                    <div key={review._id || index} className="flex items-start gap-6 pb-8 border-b border-gray-100 last:border-b-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#F7971E' }}>
                        {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900 text-lg">{review.userName || 'Anonymous'}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < (review.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment || 'No comment provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No reviews yet</p>
                </div>
              )}
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
        onClose={() => {
          console.log('❌ Audio call confirmation dialog closed');
          setShowAudioCallConfirm(false);
        }}
        onConfirm={() => {
          console.log('✅ Audio call confirmation dialog confirmed - initiating call');
          handleAudioCall();
        }}
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

      {/* Gift Selection Modal - Astrology Themed */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeInScale">
            {/* Themed header */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-2 text-5xl">🙏</div>
                <div className="absolute bottom-0 left-2 text-3xl">✨</div>
                <div className="absolute top-1 left-1/2 w-20 h-20 border border-white/20 rounded-full animate-rotate-slow" />
              </div>
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">🙏 Send Dakshina</h2>
                  <p className="text-white/80 text-xs mt-1">Offer divine blessings to {astrologer?.name}</p>
                </div>
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Wallet balance bar */}
              <div className="flex items-center justify-between mb-5 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-sm">💰</span>
                  </div>
                  <span className="text-sm text-gray-600">Wallet Balance</span>
                </div>
                <span className="font-bold text-lg" style={{ color: '#F7971E' }}>₹{walletBalance}</span>
              </div>

              {gifts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {gifts.map((gift) => (
                    <button
                      key={gift._id}
                      onClick={() => {
                        setSelectedGift(gift);
                        setShowGiftConfirm(true);
                        setShowGiftModal(false);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        selectedGift?._id === gift._id 
                          ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.02]' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                      } ${walletBalance < gift.price ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.03]'}`}
                      disabled={walletBalance < gift.price}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-2">
                          <img src={gift.icon} alt={gift.name} className="w-12 h-12" />
                          {selectedGift?._id === gift._id && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{gift.name}</h3>
                        <p className="font-bold text-sm" style={{ color: '#F7971E' }}>₹{gift.price}</p>
                        {walletBalance < gift.price && (
                          <p className="text-red-500 text-[10px] mt-1 font-medium">Low balance</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500">No gifts available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift Confirmation Dialog */}
      {showGiftConfirm && selectedGift && (
        <GiftConfirmationDialog
          isOpen={showGiftConfirm}
          onClose={() => {
            setShowGiftConfirm(false);
            setSelectedGift(null);
          }}
          onConfirm={async () => {
            await handleSendGift(selectedGift);
          }}
          giftName={selectedGift.name}
          giftIcon={selectedGift.icon}
          giftPrice={selectedGift.price}
          isLoading={isSendingGift}
        />
      )}
    </>
  );
}