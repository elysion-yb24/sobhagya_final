"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getApiBaseUrl } from "../../../config/api";
import { getAuthToken, isAuthenticated, getUserDetails, hasUserCalledBefore } from "../../../utils/auth-utils";
import { motion } from "framer-motion";
import { getRandomAstrologerBackground } from "../../../utils/randomBackground";

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
    calls?: number;
    rpm?: number;
    videoRpm?: number;
    talksAbout?: string[];
    status?: string;
}

interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function CallAstrologerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const astrologerId = params?.id as string;
    const [randomBackground, setRandomBackground] = useState<string>('');

    const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
    const [similarAstrologers, setSimilarAstrologers] = useState<Astrologer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCallOptions, setShowCallOptions] = useState(false);
    const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<Astrologer | null>(null);
    const [userHasCalledBefore, setUserHasCalledBefore] = useState(false);

    useEffect(() => {
        if (astrologerId) {
            fetchAstrologerProfile();
            //   fetchReviews();
        }
    }, [astrologerId]);

    // Check user call status
    useEffect(() => {
        const checkUserCallStatus = () => {
            const hasCalled = hasUserCalledBefore();
            setUserHasCalledBefore(hasCalled);
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
            console.log('Fetching astrologer profile for ID:', astrologerId);

            // First try the specific user endpoint
            let response = await fetch(`${getApiBaseUrl()}/user/api/users/${astrologerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            let data = null;
            if (response.ok) {
                data = await response.json();
                console.log('Response from specific user endpoint:', data);
            }

            // If specific endpoint doesn't work or doesn't return data, try the users-list endpoint
            if (!data || !data.success || !data.data) {
                console.log('Trying users-list endpoint...');
                response = await fetch(`${getApiBaseUrl()}/user/api/users-list?limit=10`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const listData = await response.json();
                    console.log('Response from users-list endpoint:', listData);

                    if (listData.success && listData.data?.list) {
                        // Find the astrologer by ID in the list
                        const foundAstrologer = listData.data.list.find((user: any) => user._id === astrologerId);
                        if (foundAstrologer) {
                            console.log('Found astrologer in list:', foundAstrologer);
                            setAstrologer(foundAstrologer);
                            return;
                        }
                    }
                }
            } else if (data.success && data.data) {
                console.log('Setting astrologer from specific endpoint:', data.data);
                setAstrologer(data.data);
                return;
            }

            // If we reach here, astrologer was not found
            console.log('Astrologer not found in any endpoint');
            setError("Astrologer not found");
        } catch (err) {
            console.error("Error fetching astrologer:", err);
            setError("Failed to load astrologer profile");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSimilarAstrologers = async () => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/user/api/users-list?limit=10`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
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
            console.error("Error fetching similar astrologers:", err);
        }
    };

    //   const fetchReviews = async () => {
    //     // Mock reviews data
    //     const mockReviews: Review[] = [
    //       {
    //         _id: "1",
    //         userId: "user1",
    //         userName: "Naresh",
    //         rating: 4.5,
    //         comment: "I had an amazing session with Astrologer Sahil Mehta! His insights were incredibly accurate, and his guidance gave me clarity on my career and relationships.",
    //         createdAt: new Date().toISOString(),
    //       },
    //       {
    //         _id: "2",
    //         userId: "user2",
    //         userName: "Pooja Bhatia",
    //         rating: 5,
    //         comment: "The remedies he suggested have truly made a difference in my life. Highly recommended for anyone seeking astrological advice!",
    //         createdAt: new Date().toISOString(),
    //       },
    //       {
    //         _id: "3",
    //         userId: "user3",
    //         userName: "Ram Charan",
    //         rating: 4.5,
    //         comment: "I had an amazing session with Astrologer Sahil Mehta! His insights were incredibly accurate, and his guidance gave me clarity on my career and relationships. The remedies he suggested have truly made a difference in my life. Highly recommended for anyone seeking astrological advice!",
    //         createdAt: new Date().toISOString(),
    //       },
    //     ];
    //     setReviews(mockReviews);
    //   };



    const handleCall = () => {
        
        setSelectedCallAstrologer(astrologer);
        setShowCallOptions(true);
    };

    const handleCallTypeSelection = (callType: 'audio' | 'video') => {
        // Get the selected astrologer ID from localStorage or use current astrologer
        const selectedId = localStorage.getItem("selectedAstrologerId") || astrologerId;
        
        // Redirect to login with call intent
        localStorage.setItem("selectedAstrologerId", selectedId);
        localStorage.setItem("callIntent", callType);
        localStorage.setItem("callSource", "callWithAstrologer");
        setShowCallOptions(false);
        router.push("/login");
    };

    const scrollSimilarLeft = () => {
        const container = document.getElementById('similar-container');
        if (container) {
            container.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollSimilarRight = () => {
        const container = document.getElementById('similar-container');
        if (container) {
            container.scrollBy({ left: 200, behavior: 'smooth' });
        }
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
                        className="w-5 h-5"
                    />
                );
            } else if (i === fullStars && hasHalfStar) {
                // Half star
                return (
                    <img
                        key={i}
                        src="/Star 161.svg"
                        alt="Half star"
                        className="w-5 h-5"
                    />
                );
            } else {
                // Empty star
                return (
                    <img
                        key={i}
                        src="/Star 210.svg"
                        alt="Empty star"
                        className="w-5 h-5"
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
                    <div className="max-w-5xl mx-auto">
                        {/* Profile Card */}
                        <motion.div
                            className="mb-6 sm:mb-8 relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                        {/* Mobile Layout - Stacked */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 md:gap-12">
                            {/* Avatar with Online Status and Rating */}
                            <div className="flex flex-col items-center flex-shrink-0">
                                <img
                                    src={
                                        (astrologer.avatar && astrologer.avatar.startsWith('http')) ||
                                            (astrologer.profileImage && astrologer.profileImage.startsWith('http'))
                                            ? astrologer.avatar || astrologer.profileImage
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                astrologer.name
                                            )}&background=FF6B35&color=fff&size=120`
                                    }
                                    alt={astrologer.name}
                                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-[180px] md:h-[180px] lg:w-[209px] lg:h-[209px] rounded-full object-cover border-[2.5px] border-[#F7971E] shadow-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            astrologer.name
                                        )}&background=FF6B35&color=fff&size=120`;
                                    }}
                                />

                                {/* Online Status */}
                                <div className="mt-2 sm:mt-3 text-[#399932] text-xs sm:text-sm font-medium italic leading-relaxed">
                                    Online
                                </div>

                                {/* Rating */}
                                <div className="flex flex-col items-center mt-1 sm:mt-2">
                                    <div className="flex items-center gap-1">
                                        {renderStars(getRatingValue(astrologer.rating))}
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-600 mt-1">Rating {getRatingValue(astrologer.rating).toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center sm:text-left pt-0 sm:pt-4 md:pt-16">
                                {/* Name */}
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 mb-2 sm:mb-3" style={{
                                    fontFamily: 'Poppins'
                                }}>{astrologer.name}</h1>

                                {/* Specializations */}
                                <p className="text-[#373737] mb-1 text-sm sm:text-base md:text-lg">
                                    {astrologer.talksAbout?.slice(0, 3).join(", ") ||
                                        astrologer.specializations?.join(", ") ||
                                        "Tarrot reading, Pranic healing, Vedic, Horoscope Readings"}
                                </p>

                                {/* Languages */}
                                <p className="text-[#636161] mb-1 text-sm sm:text-base">
                                    {(astrologer.languages || []).join(", ") || "Hindi, Sanskrit, English"}
                                </p>

                                {/* Experience */}
                                <div className="text-[#373737] mb-1 text-sm sm:text-base">
                                    Exp:- {astrologer.age || astrologer.experience || "2"}years
                                </div>

                                {/* Pricing */}
                                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#373737] mb-2 sm:mb-3">
                                    ₹ {astrologer.rpm || 108}/min
                                </div>

                                {/* Call & Message Stats */}
                                <div className="flex items-center justify-center sm:justify-start gap-8 sm:gap-12 md:gap-20 my-2 sm:my-3 py-2 sm:py-3">
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-[1px] border-[#F7971E] rounded-full flex items-center justify-center bg-white">
                                            <img src="/phone.svg" alt="Call" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <p className="text-mono font-normal text-[#636161]-700 text-xs sm:text-sm">Call</p>
                                            <p className="text-mono font-normal text-[#636161] text-xs sm:text-sm">{astrologer.callsCount || astrologer.calls || "580"}k mins</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border-[1px] border-[#F7971E] rounded-full flex items-center justify-center bg-white">
                                            <img src="/Group 13365.svg" alt="Message" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <p className="text-mono font-normal text-[#6316161] text-xs sm:text-sm">Message</p>
                                            <p className="text-mono font-normal text-[#636161] text-xs sm:text-sm">{Math.floor((astrologer.callsCount || 488) * 0.84)}k mins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 w-full">
                            {astrologer.about ||
                                `Astrologer ${astrologer.name} is a renowned expert in ${(astrologer.talksAbout?.slice(0, 3) || astrologer.specializations || ["Tarrot reading", "Pranic healing", "Vedic astrology"]).join(", ")}, and spiritual guidance. With years of experience, he provides deep insights into love, career, health, and life challenges. His accurate predictions and effective remedies have helped countless individuals find clarity and success. Whether you seek answers about your future or solutions to obstacles, ${astrologer.name} offers personalized consultations to align your life with cosmic energies.`}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
                            <button className="pt-[5px] pb-[5px] pr-[20px] pl-[20px] sm:pr-[28px] sm:pl-[28px] md:pr-[36px] md:pl-[36px] border border-[#f7971e] text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors">
                                Follow
                            </button>
                            <button className="pt-[5px] pb-[5px] pr-[20px] pl-[20px] sm:pr-[28px] sm:pl-[28px] md:pr-[36px] md:pl-[36px] bg-[#f7971e] text-black rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors">
                                Dakshina
                            </button>
                            <button
                                onClick={handleCall}
                                className="pt-[5px] pb-[5px] pr-[20px] pl-[20px] sm:pr-[28px] sm:pl-[28px] md:pr-[36px] md:pl-[36px] bg-[#f7971e] text-black rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors"
                            >
                                {userHasCalledBefore ? `₹${astrologer?.rpm || 15}/min` : 'OFFER: FREE 1st call'}
                            </button>
                        </div>
                        </motion.div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-[2px] sm:h-[4px] md:h-[6px] bg-[#d9d9d9] my-3"></div>

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
                                    className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors shadow-md"
                                >
                                    <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" />
                                </button>

                                 <div
                                     id="similar-container"
                                     className="flex gap-3 sm:gap-4 md:gap-4 overflow-x-auto scrollbar-hide -ml-5 pr-6 sm:pr-8 md:pr-10"
                                     style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                 >
                                     {similarAstrologers.map((similar) => (
                                         <div
                                             key={similar._id}
                                             className="flex-shrink-0 w-[221px] sm:w-[221px] md:w-[220px] lg:w-[210px] bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
                                             onClick={() => router.push(`/call-with-astrologer/profile/${similar._id}`)}
                                         >
                                             {/* Profile Picture */}
                                             <div className="mb-3">
                                                 <img
                                                     src={
                                                         (similar.avatar && similar.avatar.startsWith('http')) ||
                                                             (similar.profileImage && similar.profileImage.startsWith('http'))
                                                             ? similar.avatar || similar.profileImage
                                                             : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                 similar.name
                                                             )}&background=FF6B35&color=fff&size=120`
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
                                                         target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                             similar.name
                                                         )}&background=FF6B35&color=fff&size=120`;
                                                     }}
                                                 />
                                             </div>
                                             
                                             {/* Name */}
                                             <h3 className="font-bold text-base text-gray-900 mb-0.5">{similar.name}</h3>
                                             
                                             {/* Language */}
                                             <p className="text-sm text-gray-600 mb-0.5">
                                                 {(similar.languages || []).join(", ") || "Hindi"}
                                             </p>
                                             
                                             {/* Expertise */}
                                             <p className="text-sm text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center">
                                                 {similar.talksAbout?.join(", ") || similar.specializations?.join(", ") || "Kp, Vedic, Vastu"}
                                             </p>
                                             
                                             {/* Experience */}
                                             <p className="text-sm text-gray-600 mb-2">
                                                 Exp:- {similar.age || similar.experience || "2"}years
                                             </p>
                                             
                                             {/* Call Button */}
                                             <div className="flex justify-center">
                                                 <button
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         localStorage.setItem("selectedAstrologerId", similar._id);
                                                         setSelectedCallAstrologer(similar);
                                                         setShowCallOptions(true);
                                                     }}
                                                     className="w-[171px] h-[30px] bg-[#F7971E] text-black text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                                                 >
                                                     {userHasCalledBefore ? `₹${similar?.rpm || 15}/min` : 'OFFER: FREE 1st call'}
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>

                                <button
                                    onClick={scrollSimilarRight}
                                    className="absolute right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors shadow-md"
                                >
                                    <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-[2px] sm:h-[4px] md:h-[6px] bg-[#d9d9d9] my-3"></div>

                <div className="px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                    {/* Reviews */}
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
                                className="w-full bg-[#F7971E] text-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                            >
                                <img src="/phone.svg" alt="Audio Call" className="w-4 h-4 sm:w-5 sm:h-5" />
                                Audio Call
                            </button>
                            
                            <button
                                onClick={() => handleCallTypeSelection('video')}
                                className="w-full bg-[#F7971E] text-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6C3 4.89543 3.89543 4 5 4H12C13.1046 4 14 4.89543 14 6V18C14 19.1046 13.1046 20 12 20H5C3.89543 20 3 19.1046 3 18V6Z" fill="currentColor"/>
                                    <path d="M14 8.5L19 6V18L14 15.5V8.5Z" fill="currentColor"/>
                                </svg>
                                Video Call
                            </button>
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
