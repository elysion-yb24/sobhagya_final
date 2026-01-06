"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Video, MessageCircle } from "lucide-react";
import { getApiBaseUrl } from "../../../config/api";
import { getAuthToken, isAuthenticated, getUserDetails, hasUserCalledBefore } from "../../../utils/auth-utils";
import { shouldShowDevBanner, shouldShowDebugLogs } from "../../../config/development";
import DevModeBanner from "../../../components/DevModeBanner";
import { motion } from "framer-motion";
import { getRandomAstrologerBackground } from "../../../utils/randomBackground";
import { toast } from 'react-hot-toast';
import { initiateCall } from "../../../utils/call-utils";

interface Astrologer {
    _id: string;
    name: string;
    languages: string[];
    specializations: string[];
    experience: string | number;
    callsCount?: number;
    rating: number | { avg: number; count: number; max: number; min: number };
    profileImage: string;
    hasVideo?: boolean;
    about?: string;
    bio?: string;
    age?: number;
    avatar?: string;
    calls?: number;
    rpm?: number;
    videoRpm?: number;
    talksAbout?: string[];
    status?: string;
    isOnline?: boolean;
    totalReviews?: number;
}

interface Review {
    _id: string;
    userId?: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt?: string;
    date?: string;
    callType?: string;
}

export default function CallAstrologerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = params?.id as string;
    const [randomBackground, setRandomBackground] = useState<string>('');

    // Add CSS animation for scrolling text
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scrollText {
                0% { transform: translateX(0); }
                25% { transform: translateX(0); }
                75% { transform: translateX(calc(-100% + 180px)); }
                100% { transform: translateX(calc(-100% + 180px)); }
            }
            .scrolling-text {
                animation: scrollText 4s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
    const [similarAstrologers, setSimilarAstrologers] = useState<Astrologer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCallOptions, setShowCallOptions] = useState(false);
    const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<Astrologer | null>(null);
    const [userHasCalledBefore, setUserHasCalledBefore] = useState(false);
    const [isAudioCallProcessing, setIsAudioCallProcessing] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasInitiatedCallRef = React.useRef(false);

    useEffect(() => {
        if (astrologerId) {
            fetchAstrologerProfile();
            fetchReviews();
        }
    }, [astrologerId]);

    // Auto-initiate call if callType is in URL or localStorage
    useEffect(() => {
        if (!astrologer || !isAuthenticated() || hasInitiatedCallRef.current) return;

        const callTypeFromUrl = searchParams?.get('callType');
        const callIntentFromStorage = localStorage.getItem('callIntent');
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');

        // Check if we should auto-initiate call
        if ((callTypeFromUrl || callIntentFromStorage) && storedAstrologerId === astrologerId) {
            // Mark as initiated to prevent multiple calls
            hasInitiatedCallRef.current = true;

            // Clear the stored values first
            const callType = (callTypeFromUrl || callIntentFromStorage) as 'audio' | 'video';
            localStorage.removeItem('callIntent');
            localStorage.removeItem('selectedAstrologerId');
            localStorage.removeItem('callSource');

            // Auto-initiate the call by calling handleCallTypeSelection
            if (callType === 'audio' || callType === 'video') {
                // Small delay to ensure page is fully loaded
                setTimeout(() => {
                    handleCallTypeSelection(callType);
                }, 500);
            }
        }
    }, [astrologer, astrologerId, searchParams]);

    // Check user call status
    useEffect(() => {
        const checkUserCallStatus = async () => {
            // First check localStorage for immediate response
            const cachedHasCalledBefore = localStorage.getItem("userHasCalledBefore");
            if (cachedHasCalledBefore === "true") {
                setUserHasCalledBefore(true);
                return;
            }

            // Then check using the function (which checks API)
            const hasCalled = hasUserCalledBefore();
            setUserHasCalledBefore(hasCalled);

            // Also check API directly for accuracy
            try {
                const token = getAuthToken();
                if (token) {
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
                        const totalCalls = callHistory.data?.list?.length || 0;
                        if (totalCalls > 0) {
                            setUserHasCalledBefore(true);
                            localStorage.setItem('userHasCalledBefore', 'true');
                        }
                    }
                }
            } catch (error) {
            }
        };

        checkUserCallStatus();

        // Listen for call status changes
        const handleCallStatusChange = () => {
            checkUserCallStatus();
        };

        window.addEventListener('user-call-status-changed', handleCallStatusChange);
        window.addEventListener('user-auth-changed', handleCallStatusChange);

        return () => {
            window.removeEventListener('user-call-status-changed', handleCallStatusChange);
            window.removeEventListener('user-auth-changed', handleCallStatusChange);
        };
    }, []);

    // Fetch similar astrologers after main astrologer data is loaded
    useEffect(() => {
        if (astrologer && ((astrologer.talksAbout?.length ?? 0) > 0 || (astrologer.specializations?.length ?? 0) > 0)) {
            fetchSimilarAstrologers();
        }
    }, [astrologer]);

    // Set random background on component mount
    useEffect(() => {
        setRandomBackground(getRandomAstrologerBackground());
    }, []);

    const fetchAstrologerProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);


            const token = getAuthToken();
            let foundAstrologer = null;

            // First try the specific user endpoint
            try {
                const specificResponse = await fetch(`${getApiBaseUrl()}/user/api/users/${astrologerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                    credentials: 'include',
                });

                if (specificResponse.ok) {
                    const specificResult = await specificResponse.json();

                    if (specificResult?.data) {
                        foundAstrologer = specificResult.data;
                    } else if (specificResult && (specificResult._id || specificResult.id)) {
                        foundAstrologer = specificResult;
                    }
                }
            } catch (specificError) {
            }

            // If specific endpoint didn't work, search through all astrologers
            if (!foundAstrologer) {
                let currentSkip = 0;
                const limit = 50; // Larger batch size for better performance
                let searchCompleted = false;

                while (!searchCompleted && !foundAstrologer) {

                    const response = await fetch(
                        `${getApiBaseUrl()}/user/api/users?skip=${currentSkip}&limit=${limit}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                ...(token && { "Authorization": `Bearer ${token}` }),
                            },
                            credentials: 'include',
                        }
                    );

                    if (!response.ok) {
                        // Try users-list endpoint as fallback
                        const listResponse = await fetch(
                            `${getApiBaseUrl()}/user/api/users-list?skip=${currentSkip}&limit=${limit}`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    ...(token && { "Authorization": `Bearer ${token}` }),
                                },
                                credentials: 'include',
                            }
                        );

                        if (!listResponse.ok) {
                            throw new Error("Failed to fetch astrologer profile");
                        }

                        const listResult = await listResponse.json();
                        let astrologers: any[] = [];

                        if (listResult?.data?.list && Array.isArray(listResult.data.list)) {
                            astrologers = listResult.data.list;
                        } else if (listResult?.list && Array.isArray(listResult.list)) {
                            astrologers = listResult.list;
                        }

                        // Search for the astrologer in current batch
                        foundAstrologer = astrologers.find((ast: any) =>
                            ast._id === astrologerId ||
                            ast.id === astrologerId ||
                            ast.numericId?.toString() === astrologerId
                        );

                        // If found or no more results, stop searching
                        if (foundAstrologer || astrologers.length < limit) {
                            searchCompleted = true;
                        } else {
                            currentSkip += limit;
                        }
                    } else {
                        const result = await response.json();
                        let astrologers: any[] = [];

                        if (result?.data?.list && Array.isArray(result.data.list)) {
                            astrologers = result.data.list;
                        } else if (result?.list && Array.isArray(result.list)) {
                            astrologers = result.list;
                        }

                        // Search for the astrologer in current batch
                        foundAstrologer = astrologers.find((ast: any) =>
                            ast._id === astrologerId ||
                            ast.id === astrologerId ||
                            ast.numericId?.toString() === astrologerId
                        );

                        // If found or no more results, stop searching
                        if (foundAstrologer || astrologers.length < limit) {
                            searchCompleted = true;
                        } else {
                            currentSkip += limit;
                        }
                    }
                }
            }

            if (!foundAstrologer) {
                throw new Error("Astrologer not found in the system");
            }

            // Normalize status field - ensure status is set correctly
            // If isOnline is provided but status is not, convert it
            if (foundAstrologer.isOnline !== undefined && !foundAstrologer.status) {
                foundAstrologer.status = foundAstrologer.isOnline ? "online" : "offline";
            }
            // If status is not provided, default to offline
            if (!foundAstrologer.status) {
                foundAstrologer.status = "offline";
            }


            setAstrologer(foundAstrologer);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load astrologer profile";

            if (errorMessage.includes("not found")) {
                setError(`Astrologer with ID "${astrologerId}" was not found. Please check the URL or try browsing our astrologers.`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSimilarAstrologers = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${getApiBaseUrl()}/user/api/users-list?limit=50`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.list) {
                    // Get current astrologer's specializations
                    const currentSpecializations = [
                        ...(astrologer?.talksAbout || []),
                        ...(astrologer?.specializations || [])
                    ].map(spec => spec.toLowerCase());

                    // Filter astrologers with matching specializations
                    const filtered = data.data.list
                        .filter((a: Astrologer) => {
                            // Exclude current astrologer
                            if (a._id === astrologerId) return false;

                            // Get astrologer's specializations
                            const astrologerSpecializations = [
                                ...(a.talksAbout || []),
                                ...(a.specializations || [])
                            ].map(spec => spec.toLowerCase());

                            // Check if any specialization matches
                            return currentSpecializations.some(currentSpec =>
                                astrologerSpecializations.some(astSpec =>
                                    astSpec.includes(currentSpec) || currentSpec.includes(astSpec)
                                )
                            );
                        })
                        .slice(0, 5); // Take only 5 similar astrologers

                    setSimilarAstrologers(filtered);
                }
            }
        } catch (err) {
            setSimilarAstrologers([]);
        }
    };

    const fetchReviews = async () => {
        try {
            const token = getAuthToken();
            // API call for reviews
            const response = await fetch(`${getApiBaseUrl()}/user/api/top-reviews?partnerId=${astrologerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();

                // Get reviews from response - handle different response formats
                let allReviews = [];
                if (data.data && Array.isArray(data.data)) {
                    allReviews = data.data;
                } else if (data.list && Array.isArray(data.list)) {
                    allReviews = data.list;
                } else if (Array.isArray(data)) {
                    allReviews = data;
                } else if (data.success && data.data) {
                    allReviews = Array.isArray(data.data) ? data.data : [];
                }

                // Filter reviews for this astrologer using the 'to' field
                const astrologerReviews = allReviews.filter((review: any) =>
                    review.to === astrologerId || review.astrologerId === astrologerId
                );

                // Transform reviews to match expected format
                const transformedReviews = astrologerReviews.map((review: any) => ({
                    _id: review._id || review.id,
                    userId: review.userId || review.by || review.userId,
                    userName: review.userName || review.name || 'Anonymous',
                    astrologerId: astrologerId,
                    rating: review.rating || 0,
                    comment: review.comment || review.message || '',
                    createdAt: review.createdAt || review.date || new Date().toISOString()
                }));

                setReviews(transformedReviews);
            } else {
                setReviews([]);
            }
        } catch (err) {
            setReviews([]);
        }
    };



    const handleCall = () => {

        setSelectedCallAstrologer(astrologer);
        setShowCallOptions(true);
    };

    const handleAudioCallClick = () => {
        setIsAudioCallProcessing(true);
        handleCallTypeSelection('audio');
        // Reset processing state after a delay (in case the call doesn't go through)
        setTimeout(() => {
            setIsAudioCallProcessing(false);
        }, 3000);
    };

    const handleCallTypeSelection = async (callType: 'audio' | 'video') => {
        // Get the selected astrologer ID from localStorage or use current astrologer
        const selectedId = localStorage.getItem("selectedAstrologerId") || astrologerId;

        setShowCallOptions(false);

        await initiateCall({
            astrologerId: selectedId,
            callType,
            router,
            setLoading: setIsAudioCallProcessing,
            onStatusOffline: () => {
                // Optionally update local state if status is tracked
                setAstrologer(prev => prev ? { ...prev, status: 'offline' } : prev);
            }
        });
    };

    const scrollSimilarLeft = () => {
        setCurrentIndex(prev => {
            // For small screens (1 card), move by 1
            // For tablets (2 cards), move by 2  
            // For desktop (4 cards), move by 4
            const isSmallScreen = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            const moveBy = isSmallScreen ? 1 : isTablet ? 2 : 4;
            return Math.max(0, prev - moveBy);
        });
    };

    const scrollSimilarRight = () => {
        setCurrentIndex(prev => {
            // For small screens (1 card), move by 1
            // For tablets (2 cards), move by 2
            // For desktop (4 cards), move by 4
            const isSmallScreen = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            const moveBy = isSmallScreen ? 1 : isTablet ? 2 : 4;
            return Math.min(similarAstrologers.length - moveBy, prev + moveBy);
        });
    };

    const getRatingValue = (rating: number | { avg: number; count: number; max: number; min: number }) => {
        return typeof rating === 'number' ? rating : rating?.avg || 4.5;
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return [...Array(5)].map((_, i) => {
            if (i < fullStars) {
                // Full star
                return (
                    <img
                        key={i}
                        src="/Star 165.svg"
                        alt="Full star"
                        className="w-8 h-8"
                    />
                );
            } else if (i === fullStars && hasHalfStar) {
                // Half star
                return (
                    <img
                        key={i}
                        src="/Star 161.svg"
                        alt="Half star"
                        className="w-8 h-8"
                    />
                );
            } else {
                // Empty star
                return (
                    <img
                        key={i}
                        src="/Star 210.svg"
                        alt="Empty star"
                        className="w-8 h-8"
                    />
                );
            }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !astrologer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
                    <p className="text-gray-600 mb-2">{error || "Failed to load astrologer profile"}</p>
                    <p className="text-sm text-gray-500 mb-6">Astrologer ID: {astrologerId}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.back()}
                            className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => {
                                setIsLoading(true);
                                setError(null);
                                fetchAstrologerProfile();
                            }}
                            className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {shouldShowDevBanner() && <DevModeBanner />}
            {/* Hero Background - Starry Night Theme */}
            <div
                className="relative h-32 sm:h-40 md:h-48 overflow-hidden w-full"
            >
                <img
                    src={randomBackground || "/Astrologer profile Background.svg"}
                    alt="Profile header background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>

                {/* Back Button */}
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-black/20 rounded-full text-white hover:bg-black/30 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Profile Content */}
            <div className="relative -mt-4 sm:-mt-6 md:-mt-8">
                <div className="px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Profile Card */}
                        <motion.div
                            className="mb-6 sm:mb-8 relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Two Column Layout */}
                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                                {/* Left Column - Profile Picture, Rating, Experience, Call, Message */}
                                <div className="flex flex-col items-center lg:items-start flex-shrink-0">
                                    {/* Profile Picture Container with Online Status */}
                                    <div className="flex flex-col items-center">
                                        {/* Profile Picture */}
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-[#F7971E] shadow-lg overflow-hidden mr-0 lg:mr-6">
                                            <img
                                                src={
                                                    (astrologer.avatar && astrologer.avatar.startsWith('http')) ||
                                                        (astrologer.profileImage && astrologer.profileImage.startsWith('http'))
                                                        ? astrologer.avatar || astrologer.profileImage
                                                        : `/sahil-mehta.svg`
                                                }
                                                alt={astrologer.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = `/sahil-mehta.svg`;
                                                }}
                                            />
                                        </div>

                                        {/* Online Status - Exactly Below Profile Picture */}
                                        <div className="mt-3 text-center text-sm font-medium">
                                            {astrologer.status === "online" ? (
                                                <span className="text-[#399932]">Online</span>
                                            ) : astrologer.status === "busy" ? (
                                                <span className="text-orange-600">Busy</span>
                                            ) : (
                                                <span className="text-red-600">Offline</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex flex-col items-center mt-2 ml-4">
                                        <div className="flex items-center gap-1">
                                            {renderStars(getRatingValue(astrologer.rating))}
                                        </div>
                                        <span className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>Rating {getRatingValue(astrologer.rating).toFixed(1)}</span>
                                    </div>

                                    {/* Very small screens only (800x800 and below): Three buttons in same row, All other sizes: Stacked vertically like web view */}
                                    <div className="mt-8">
                                        {/* Very small screens only: Row layout (800px and below) */}
                                        <div className="flex flex-row lg:hidden gap-4">
                                            {/* Experience - Very small screens */}
                                            <div className="flex items-center gap-2 flex-1">
                                                <img src="/experience.svg" alt="Experience" className="w-5 h-5" />
                                                <div>
                                                    <div className="font-semibold text-[#373737] text-xs whitespace-nowrap" style={{ fontSize: '12px' }}>
                                                        Experience
                                                    </div>
                                                    <div className="text-[#373737] text-xs whitespace-nowrap" style={{ fontSize: '14px' }}>
                                                        {astrologer.experience || "2"} years
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Call Stats - Very small screens */}
                                            <div className="flex items-center gap-2 flex-1">
                                                <img src="/phone.svg" alt="Call" className="w-5 h-5" />
                                                <div>
                                                    <div className="font-semibold text-[#373737] text-xs whitespace-nowrap" style={{ fontSize: '12px' }}>
                                                        Call
                                                    </div>
                                                    <div className="text-[#373737] text-xs whitespace-nowrap" style={{ fontSize: '14px' }}>
                                                        {astrologer.callsCount || "580"}k mins
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message Stats - Very small screens */}
                                            <div className="flex items-center gap-2 flex-1">
                                                <img src="/Group 13365.svg" alt="Message" className="w-5 h-5" />
                                                <div>
                                                    <div className="font-semibold text-[#373737] text-xs whitespace-nowrap" style={{ fontSize: '12px' }}>
                                                        Message
                                                    </div>
                                                    <div className="text-[#373737] text-xs whitespace-nowrap" style={{ fontSize: '14px' }}>
                                                        {Math.floor((astrologer.callsCount || 580) * 0.84)}k mins
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Large screens and above (801px+): Stacked vertically like web view */}
                                        <div className="hidden lg:block">
                                            {/* Experience - Large screens */}
                                            <div className="flex items-center gap-5">
                                                <img src="/experience.svg" alt="Experience" className="w-7 h-7" />
                                                <div>
                                                    <div className="font-semibold text-[#373737]" style={{ fontSize: '15px' }}>
                                                        Experience
                                                    </div>
                                                    <div className="text-[#373737]" style={{ fontSize: '17px' }}>
                                                        {astrologer.experience || "2"} years
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Call Stats - Large screens */}
                                            <div className="mt-7 flex items-center gap-5">
                                                <img src="/phone.svg" alt="Call" className="w-7 h-7" />
                                                <div>
                                                    <div className="font-semibold text-[#373737]" style={{ fontSize: '15px' }}>
                                                        Call
                                                    </div>
                                                    <div className="text-[#373737]" style={{ fontSize: '17px' }}>
                                                        {astrologer.callsCount || "580"}k mins
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message Stats - Large screens */}
                                            <div className="mt-7 flex items-center gap-5">
                                                <img src="/Group 13365.svg" alt="Message" className="w-7 h-7" />
                                                <div>
                                                    <div className="font-semibold text-[#373737]" style={{ fontSize: '15px' }}>
                                                        Message
                                                    </div>
                                                    <div className="text-[#373737]" style={{ fontSize: '17px' }}>
                                                        {Math.floor((astrologer.callsCount || 580) * 0.84)}k mins
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Right Column - Name, Specializations, Languages, About */}
                                <div className="flex-1 pt-4 lg:pt-16">
                                    {/* Name */}
                                    <h1 className="font-bold text-gray-900 mb-2 text-sm sm:text-lg md:text-xl lg:text-2xl" style={{
                                        fontFamily: 'EB Garamond'
                                    }}>
                                        {astrologer.name}
                                    </h1>

                                    {/* Specializations */}
                                    <div className="mb-2">
                                        <p className="text-[#373737] text-sm sm:text-base lg:text-lg" style={{
                                            fontFamily: 'Poppins',
                                            fontWeight: '400'
                                        }}>
                                            {(astrologer.specializations || ["Tarrot reading", "Pranic healing", "Vedic", "Horoscope Readings"]).join(", ")}
                                        </p>
                                    </div>

                                    {/* Languages */}
                                    <div className="mb-4">
                                        <p className="text-[#373737] text-sm sm:text-base" style={{
                                            fontFamily: 'Poppins'
                                        }}>
                                            {(astrologer.languages || ["Hindi", "Sanskrit", "English"]).join(", ")}
                                        </p>
                                    </div>

                                    {/* Pricing - Always show, but show different text based on call status */}
                                    <div className="mb-6">
                                        {userHasCalledBefore ? (
                                            <div className="text-xl sm:text-2xl font-bold text-[#F7971E]">
                                                ₹ {astrologer.rpm || 108}/min
                                            </div>
                                        ) : (
                                            <div className="text-xl sm:text-2xl font-bold text-[#F7971E]">
                                                FREE 1st Call
                                            </div>
                                        )}
                                    </div>

                                    {/* About Paragraph */}
                                    <div className="mb-6 pr-0 lg:pr-48">
                                        <h3 className="text-base sm:text-lg font-semibold text-[#373737] mb-3" style={{
                                            fontFamily: 'Poppins'
                                        }}>
                                            About
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-justify text-sm sm:text-base" style={{
                                            fontFamily: 'Poppins'
                                        }}>
                                            {astrologer.about || astrologer.bio || "Astrologer " + astrologer.name + " is a renowned expert in Tarrot reading, Pranic healing, Vedic astrology, horoscope readings, and spiritual guidance. With years of experience, he provides deep insights into love, career, health, and life challenges. His accurate predictions and effective remedies have helped countless individuals find clarity and success."}
                                        </p>
                                    </div>

                                    {/* Action Buttons - Conditional based on call status */}
                                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                        <button className="bg-white border-2 border-[#F7971E] text-[#F7971E] font-semibold py-2 px-4 rounded hover:bg-[#F7971E] hover:text-white transition-colors">
                                            Follow
                                        </button>
                                        <button className="bg-white border-2 border-[#F7971E] text-[#F7971E] font-semibold py-2 px-4 rounded hover:bg-[#F7971E] hover:text-white transition-colors">
                                            Dakshina
                                        </button>
                                        {userHasCalledBefore ? (
                                            <>
                                                <button
                                                    onClick={() => router.push(`/chat?astrologerId=${astrologerId}`)}
                                                    className="bg-[#F7971E] text-white font-semibold py-2 px-4 rounded hover:bg-[#E8850B] transition-colors flex items-center gap-2"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Message
                                                </button>
                                                <button
                                                    onClick={handleAudioCallClick}
                                                    disabled={isAudioCallProcessing}
                                                    className="bg-[#F7971E] text-white font-semibold py-2 px-4 rounded hover:bg-[#E8850B] transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isAudioCallProcessing ? (
                                                        "Connecting..."
                                                    ) : (
                                                        <>
                                                            <img src="/call-icon.svg" alt="Call" className="w-4 h-4" />
                                                            Call
                                                        </>
                                                    )}
                                                </button>
                                                {(astrologer.isVideoCallAllowed || astrologer.isVideoCallAllowedAdmin) && (
                                                    <button
                                                        onClick={() => handleCallTypeSelection('video')}
                                                        className="bg-[#F7971E] text-white font-semibold py-2 px-4 rounded hover:bg-[#E8850B] transition-colors flex items-center gap-2"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Video Call
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleAudioCallClick}
                                                disabled={isAudioCallProcessing}
                                                className="bg-[#F7971E] text-white font-semibold py-2 px-4 rounded hover:bg-[#E8850B] transition-colors disabled:opacity-50"
                                            >
                                                {isAudioCallProcessing ? "Connecting..." : "OFFER: FREE 1st call"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-[1px] bg-gray-200 my-16"></div>

                <div className="px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Similar Astrologers */}
                        {similarAstrologers.length > 0 && (
                            <motion.div
                                className="mb-6 sm:mb-8 bg-white rounded-lg p-3 sm:p-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <h2
                                    className="text-center mb-6 sm:mb-8 md:mb-12 text-[#745802] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
                                    style={{
                                        fontFamily: 'EB Garamond'
                                    }}
                                >
                                    Check Similar {astrologer.talksAbout?.[0] || astrologer.specializations?.[0] || 'Astrology'} Experts
                                </h2>

                                <div className="relative">
                                    <button
                                        onClick={scrollSimilarLeft}
                                        className="absolute -left-6 sm:-left-16 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors shadow-md"
                                    >
                                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                                    </button>

                                    <div
                                        id="similar-container"
                                        className="flex justify-center gap-4 px-4"
                                    >
                                        {/* Small screens: Show 1 card */}
                                        <div className="block md:hidden">
                                            {similarAstrologers.slice(currentIndex, currentIndex + 1).map((similar) => (
                                                <div
                                                    key={similar._id}
                                                    className="w-[280px] bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col h-[280px]"
                                                    onClick={() => router.push(`/call-with-astrologer/profile/${similar._id}`)}
                                                >
                                                    {/* Content Section */}
                                                    <div className="flex-1">
                                                        {/* Profile Picture */}
                                                        <div className="mb-3">
                                                            <img
                                                                src={
                                                                    (similar.avatar && similar.avatar.startsWith('http')) ||
                                                                        (similar.profileImage && similar.profileImage.startsWith('http'))
                                                                        ? similar.avatar || similar.profileImage
                                                                        : `/sahil-mehta.svg`
                                                                }
                                                                alt={similar.name}
                                                                className="w-24 h-24 rounded-full object-cover mx-auto border-2"
                                                                style={{
                                                                    borderColor: similar.status === "online"
                                                                        ? "#399932"
                                                                        : similar.status === "offline"
                                                                            ? "#EF4444"
                                                                            : "#F7971E"
                                                                }}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = `/sahil-mehta.svg`;
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Name */}
                                                        <div className="mb-0.5 h-6 flex items-center justify-center overflow-hidden relative">
                                                            <h3
                                                                className={`font-semibold text-gray-900 whitespace-nowrap ${similar.name.length > 15 ? 'scrolling-text' : ''}`}
                                                                style={{
                                                                    fontFamily: 'Poppins',
                                                                    fontSize: '18px'
                                                                }}
                                                            >
                                                                {similar.name}
                                                            </h3>
                                                        </div>

                                                        {/* Language */}
                                                        <p className="text-gray-600 mb-0.5" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            {(similar.languages || []).join(", ") || "Hindi"}
                                                        </p>

                                                        {/* Expertise */}
                                                        <p className="text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            {similar.talksAbout?.join(", ") || similar.specializations?.join(", ") || "Kp, Vedic, Vastu"}
                                                        </p>

                                                        {/* Experience */}
                                                        <p className="text-gray-600 mb-2" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            Exp: {similar.age || similar.experience || "2"} years
                                                        </p>
                                                    </div>

                                                    {/* Call Button - Always at Bottom */}
                                                    <div className="flex justify-center mt-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                localStorage.setItem("selectedAstrologerId", similar._id);
                                                                setSelectedCallAstrologer(similar);
                                                                setShowCallOptions(true);
                                                            }}
                                                            className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                                                        >
                                                            {userHasCalledBefore ? `₹${similar?.rpm || 15}/min` : 'OFFER: FREE 1st call'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tablets: Show 2 cards */}
                                        <div className="hidden md:flex lg:hidden gap-4">
                                            {similarAstrologers.slice(currentIndex, currentIndex + 2).map((similar) => (
                                                <div
                                                    key={similar._id}
                                                    className="flex-shrink-0 w-[240px] bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col h-[280px]"
                                                    onClick={() => router.push(`/call-with-astrologer/profile/${similar._id}`)}
                                                >
                                                    {/* Content Section */}
                                                    <div className="flex-1">
                                                        {/* Profile Picture */}
                                                        <div className="mb-3">
                                                            <img
                                                                src={
                                                                    (similar.avatar && similar.avatar.startsWith('http')) ||
                                                                        (similar.profileImage && similar.profileImage.startsWith('http'))
                                                                        ? similar.avatar || similar.profileImage
                                                                        : `/sahil-mehta.svg`
                                                                }
                                                                alt={similar.name}
                                                                className="w-24 h-24 rounded-full object-cover mx-auto border-2"
                                                                style={{
                                                                    borderColor: similar.status === "online"
                                                                        ? "#399932"
                                                                        : similar.status === "offline"
                                                                            ? "#EF4444"
                                                                            : "#F7971E"
                                                                }}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = `/sahil-mehta.svg`;
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Name */}
                                                        <div className="mb-0.5 h-6 flex items-center justify-center overflow-hidden relative">
                                                            <h3
                                                                className={`font-semibold text-gray-900 whitespace-nowrap ${similar.name.length > 15 ? 'scrolling-text' : ''}`}
                                                                style={{
                                                                    fontFamily: 'Poppins',
                                                                    fontSize: '18px'
                                                                }}
                                                            >
                                                                {similar.name}
                                                            </h3>
                                                        </div>

                                                        {/* Language */}
                                                        <p className="text-gray-600 mb-0.5" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            {(similar.languages || []).join(", ") || "Hindi"}
                                                        </p>

                                                        {/* Expertise */}
                                                        <p className="text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            {similar.talksAbout?.join(", ") || similar.specializations?.join(", ") || "Kp, Vedic, Vastu"}
                                                        </p>

                                                        {/* Experience */}
                                                        <p className="text-gray-600 mb-2" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            Exp: {similar.age || similar.experience || "2"} years
                                                        </p>
                                                    </div>

                                                    {/* Call Button - Always at Bottom */}
                                                    <div className="flex justify-center mt-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                localStorage.setItem("selectedAstrologerId", similar._id);
                                                                setSelectedCallAstrologer(similar);
                                                                setShowCallOptions(true);
                                                            }}
                                                            className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                                                        >
                                                            {userHasCalledBefore ? `₹${similar?.rpm || 15}/min` : 'OFFER: FREE 1st call'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop: Show 4 cards */}
                                        <div className="hidden lg:flex gap-4">
                                            {similarAstrologers.slice(currentIndex, currentIndex + 4).map((similar) => (
                                                <div
                                                    key={similar._id}
                                                    className="flex-shrink-0 w-[221px] md:w-[220px] lg:w-[210px] bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col h-[280px]"
                                                    onClick={() => router.push(`/call-with-astrologer/profile/${similar._id}`)}
                                                >
                                                    {/* Content Section */}
                                                    <div className="flex-1">
                                                        {/* Profile Picture */}
                                                        <div className="mb-3">
                                                            <img
                                                                src={
                                                                    (similar.avatar && similar.avatar.startsWith('http')) ||
                                                                        (similar.profileImage && similar.profileImage.startsWith('http'))
                                                                        ? similar.avatar || similar.profileImage
                                                                        : `/sahil-mehta.svg`
                                                                }
                                                                alt={similar.name}
                                                                className="w-24 h-24 rounded-full object-cover mx-auto border-2"
                                                                style={{
                                                                    borderColor: similar.status === "online"
                                                                        ? "#399932"
                                                                        : similar.status === "offline"
                                                                            ? "#EF4444"
                                                                            : "#F7971E"
                                                                }}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = `/sahil-mehta.svg`;
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Name */}
                                                        <div className="mb-0.5 h-6 flex items-center justify-center overflow-hidden relative">
                                                            <h3
                                                                className={`font-semibold text-gray-900 whitespace-nowrap ${similar.name.length > 15 ? 'scrolling-text' : ''}`}
                                                                style={{
                                                                    fontFamily: 'Poppins',
                                                                    fontSize: '18px'
                                                                }}
                                                            >
                                                                {similar.name}
                                                            </h3>
                                                        </div>

                                                        {/* Language */}
                                                        <p className="text-gray-600 mb-0.5" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            {(similar.languages || []).join(", ") || "Hindi"}
                                                        </p>

                                                        {/* Expertise */}
                                                        <p className="text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            {similar.talksAbout?.join(", ") || similar.specializations?.join(", ") || "Kp, Vedic, Vastu"}
                                                        </p>

                                                        {/* Experience */}
                                                        <p className="text-gray-600 mb-2" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>
                                                            Exp: {similar.age || similar.experience || "2"} years
                                                        </p>
                                                    </div>

                                                    {/* Call Button - Always at Bottom */}
                                                    <div className="flex justify-center mt-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                localStorage.setItem("selectedAstrologerId", similar._id);
                                                                setSelectedCallAstrologer(similar);
                                                                setShowCallOptions(true);
                                                            }}
                                                            className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                                                        >
                                                            {userHasCalledBefore ? `₹${similar?.rpm || 15}/min` : 'OFFER: FREE 1st call'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={scrollSimilarRight}
                                        className="absolute -right-6 sm:-right-16 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors shadow-md"
                                    >
                                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Divider Line - Only show if reviews exist */}
                {reviews && reviews.length > 0 && (
                    <div className="w-full h-[1px] bg-gray-200 my-16"></div>
                )}

                <div className="px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Reviews - Only show if reviews exist */}
                        {reviews && reviews.length > 0 && (
                            <motion.div
                                className="mb-6 sm:mb-8 bg-white rounded-lg p-4 sm:p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Reviews</h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-0">
                                            <div className="flex items-start gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gray-700 text-xs sm:text-sm font-semibold">
                                                        {review.userName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{review.userName}</h4>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Call Options Modal */}
            {showCallOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
                            Choose Call Type
                        </h3>
                        <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                            How would you like to connect with {selectedCallAstrologer?.name}?
                        </p>

                        <div className="space-y-2 sm:space-y-3">
                            <button
                                onClick={() => handleCallTypeSelection('audio')}
                                className="w-full bg-[#F7971E] text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                            >
                                <img src="/phone.svg" alt="Audio Call" className="w-4 h-4 sm:w-5 sm:h-5" />
                                Audio Call
                            </button>

                            {(selectedCallAstrologer?.isVideoCallAllowed || selectedCallAstrologer?.isVideoCallAllowedAdmin) && (
                                <button
                                    onClick={() => handleCallTypeSelection('video')}
                                    className="w-full bg-[#F7971E] text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6C3 4.89543 3.89543 4 5 4H12C13.1046 4 14 4.89543 14 6V18C14 19.1046 13.1046 20 12 20H5C3.89543 20 3 19.1046 3 18V6Z" fill="currentColor" />
                                        <path d="M14 8.5L19 6V18L14 15.5V8.5Z" fill="currentColor" />
                                    </svg>
                                    Video Call
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowCallOptions(false)}
                            className="w-full mt-3 sm:mt-4 bg-gray-200 text-gray-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
