"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DakshinaModal from '../../../components/calling/ui/DakshinaModal';
import {
    ArrowLeft, CheckCircle, Share2, Heart, Award, Languages, Phone, Gift,
    ChevronLeft, ChevronRight, X, PhoneCall, Video, Star, MessageSquare
} from 'lucide-react';
import { getApiBaseUrl } from "../../../config/api";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../../utils/auth-utils";
import { findOrFetchAstrologer, appendAstrologers, getAllCachedAstrologers } from "../../../utils/astrologer-cache";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { initiateCall } from "../../../utils/calling-utils";
import { fetchWalletBalance as simpleFetchWalletBalance } from "../../../utils/production-api";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionManager } from "../../../components/astrologers/SessionManager";

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

    const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
    const [similarAstrologers, setSimilarAstrologers] = useState<Astrologer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCallOptions, setShowCallOptions] = useState(false);
    const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<Astrologer | null>(null);
    const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);

    // Dakshina/Gift states
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [gifts, setGifts] = useState<{_id: string; name: string; icon: string; price: number}[]>([]);
    const [selectedGift, setSelectedGift] = useState<{_id: string; name: string; icon: string; price: number} | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isSendingGift, setIsSendingGift] = useState(false);
    const [giftSentSuccess, setGiftSentSuccess] = useState(false);

    // Share / Favorite (like) states
    const [isFavorited, setIsFavorited] = useState(false);
    const [shareToast, setShareToast] = useState<string | null>(null);

    // Hydrate favorite state from localStorage on mount / id change.
    useEffect(() => {
        if (typeof window === 'undefined' || !astrologerId) return;
        try {
            const raw = localStorage.getItem('favoriteAstrologers');
            const list: string[] = raw ? JSON.parse(raw) : [];
            setIsFavorited(Array.isArray(list) && list.includes(astrologerId));
        } catch {
            setIsFavorited(false);
        }
    }, [astrologerId]);

    const showFlashToast = (msg: string) => {
        setShareToast(msg);
        window.setTimeout(() => setShareToast(null), 2000);
    };

    const handleToggleFavorite = () => {
        if (typeof window === 'undefined' || !astrologerId) return;
        try {
            const raw = localStorage.getItem('favoriteAstrologers');
            const list: string[] = raw ? JSON.parse(raw) : [];
            const has = list.includes(astrologerId);
            const next = has ? list.filter((id) => id !== astrologerId) : [...list, astrologerId];
            localStorage.setItem('favoriteAstrologers', JSON.stringify(next));
            setIsFavorited(!has);
            showFlashToast(has ? 'Removed from favorites' : 'Added to favorites');
        } catch (e) {
            console.warn('favorite toggle failed', e);
        }
    };

    const handleShare = async () => {
        if (typeof window === 'undefined') return;
        const shareUrl = window.location.href;
        const shareData = {
            title: `${astrologer?.name || 'Astrologer'} on Sobhagya`,
            text: `Consult ${astrologer?.name || 'this astrologer'} on Sobhagya for trusted astrology guidance.`,
            url: shareUrl,
        };
        try {
            if (typeof navigator !== 'undefined' && (navigator as any).share) {
                await (navigator as any).share(shareData);
                return;
            }
        } catch (e) {
            // User cancelled or share unavailable — fall through to clipboard.
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
            showFlashToast('Profile link copied');
        } catch {
            showFlashToast('Could not copy link');
        }
    };

    useEffect(() => {
        if (astrologerId) {
            fetchAstrologerProfile();
            fetchGifts();
            fetchWalletBalance();
        }
    }, [astrologerId]);

    // Check free-call eligibility — same source of truth as AstrologerCard
    // (localStorage cache + /api/calling/call-log lookup), so the listing
    // and profile pages can never disagree.
    useEffect(() => {
        const checkCallHistory = async () => {
            try {
                const token = getAuthToken();
                const userDetails = getUserDetails();
                if (!token || !userDetails?.id) return;

                const response = await fetch(`/api/calling/call-log?skip=0&limit=10&role=user`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    let totalCalls = 0;
                    if (data.data?.list && Array.isArray(data.data.list)) totalCalls = data.data.list.length;
                    else if (data.list && Array.isArray(data.list)) totalCalls = data.list.length;
                    else if (Array.isArray(data.data)) totalCalls = data.data.length;
                    else if (Array.isArray(data)) totalCalls = data.length;

                    if (totalCalls > 0) {
                        setHasCompletedFreeCall(true);
                        localStorage.setItem('userHasCalledBefore', 'true');
                    }
                }
            } catch {
                const cached = localStorage.getItem('userHasCalledBefore');
                if (cached === 'true') setHasCompletedFreeCall(true);
            }
        };

        const runCheck = () => {
            if (!isAuthenticated()) {
                setHasCompletedFreeCall(false);
                return;
            }
            const cached = localStorage.getItem('userHasCalledBefore');
            const lastCheckTime = localStorage.getItem('lastCallHistoryCheck');
            const now = Date.now();
            if (cached === 'true') {
                setHasCompletedFreeCall(true);
            } else if (!lastCheckTime || now - parseInt(lastCheckTime) > 300000) {
                checkCallHistory();
                localStorage.setItem('lastCallHistoryCheck', now.toString());
            }
        };

        runCheck();
        window.addEventListener('user-auth-changed', runCheck);
        window.addEventListener('user-call-status-changed', runCheck);
        return () => {
            window.removeEventListener('user-auth-changed', runCheck);
            window.removeEventListener('user-call-status-changed', runCheck);
        };
    }, []);

    // Fetch similar astrologers after main astrologer data is loaded
    useEffect(() => {
        if (astrologer && ((astrologer.talksAbout?.length ?? 0) > 0 || (astrologer.specializations?.length ?? 0) > 0)) {
            fetchSimilarAstrologers();
        }
    }, [astrologer]);

    const fetchAstrologerProfile = async () => {
        try {
            const found = await findOrFetchAstrologer(astrologerId);
            if (found) {
                setAstrologer(found as unknown as Astrologer);
                return;
            }
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
            // Prefer the shared cache — anything the list page (or this profile's
            // own pagination walk) already loaded is reused without a network hit.
            let pool = getAllCachedAstrologers() as unknown as Astrologer[];

            if (pool.length < 10) {
                const response = await fetch(`${getApiBaseUrl()}/user/api/users-list?limit=50`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const list: Astrologer[] = data?.data?.list || data?.data || data?.users || [];
                    appendAstrologers(list as unknown as { _id: string; name: string }[]);
                    pool = getAllCachedAstrologers() as unknown as Astrologer[];
                }
            }

            if (pool.length > 0) {
                const currentSpecializations = [
                    ...(astrologer?.talksAbout || []),
                    ...(astrologer?.specializations || [])
                ].map(spec => spec.toLowerCase());

                const filtered = pool
                    .filter((a: Astrologer) => {
                        if (a._id === astrologerId) return false;
                        const astrologerSpecializations = [
                            ...(a.talksAbout || []),
                            ...(a.specializations || [])
                        ].map(spec => spec.toLowerCase());
                        return currentSpecializations.some(currentSpec =>
                            astrologerSpecializations.some(astSpec =>
                                astSpec.includes(currentSpec) || currentSpec.includes(astSpec)
                            )
                        );
                    })
                    .slice(0, 5);

                setSimilarAstrologers(filtered);
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



    const fetchGifts = async () => {
        const token = getAuthToken();
        if (!token) return;

        const tryEndpoint = async (url: string) => {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!res.ok) return null;
            const json = await res.json().catch(() => null);
            const list = Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json?.gifts)
                    ? json.gifts
                    : Array.isArray(json)
                        ? json
                        : [];
            return list.length > 0 ? list : null;
        };

        const endpoints = [
            `/api/calling/gift/get-gifts`,
            `${getApiBaseUrl()}/calling/api/gift/get-gifts`,
            `${getApiBaseUrl()}/api/gift/get-gifts`,
            `${getApiBaseUrl()}/gift/get-gifts`,
        ];

        for (const url of endpoints) {
            try {
                const list = await tryEndpoint(url);
                if (list) {
                    const normalized = list
                        .map((g: any) => ({ ...g, price: Math.round(Number(g.price) || 0) }))
                        .sort((a: any, b: any) => a.price - b.price);
                    setGifts(normalized);
                    return;
                }
            } catch (error) {
                console.warn('Error fetching gifts from', url, error);
            }
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;
            const balance = await simpleFetchWalletBalance();
            setWalletBalance(balance);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const handleSendGift = async (gift: any) => {
        const token = getAuthToken();
        if (!token) {
            router.push('/login');
            return;
        }

        if (typeof gift._id === 'string' && gift._id.startsWith('preset_')) {
            fetchGifts();
            throw new Error('Offerings not loaded yet. Please try again.');
        }

        const price = Math.round(Number(gift.price) || 0);
        if (walletBalance < price) {
            throw new Error('Insufficient wallet balance. Please recharge your wallet.');
        }

        try {
            const response = await fetch(`/api/calling/gift/send-gift`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: gift._id,
                    receiverUserId: astrologerId,
                }),
                credentials: 'include',
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok || data?.success === false) {
                throw new Error(data?.message || 'Failed to send Dakshina');
            }

            // Optimistic debit; server-side balance refresh reconciles below.
            setWalletBalance(prev => Math.max(0, prev - price));
            fetchWalletBalance();
            return true;
        } catch (error) {
            console.error('Error sending gift:', error);
            throw error;
        }
    };

    const { createOrJoinSession } = useSessionManager();
    const [isStartingChat, setIsStartingChat] = useState(false);

    const handleCall = () => {

        setSelectedCallAstrologer(astrologer);
        setShowCallOptions(true);
    };

    const handleChat = async () => {
        if (!astrologerId) return;
        if (!isAuthenticated()) {
            localStorage.setItem('selectedAstrologerId', astrologerId);
            localStorage.setItem('chatIntent', '1');
            router.push('/login');
            return;
        }
        if (isStartingChat) return;
        setIsStartingChat(true);
        try {
            const result = await createOrJoinSession(astrologerId);
            if (result.ok) {
                const qs = new URLSearchParams({ threadId: result.threadId });
                if (result.sessionId) qs.set('sessionId', result.sessionId);
                router.push(`/chat?${qs.toString()}`);
            } else {
                alert(result.message || 'Could not start chat. Please try again.');
            }
        } catch (err: any) {
            alert(err?.message || 'Could not start chat. Please try again.');
        } finally {
            setIsStartingChat(false);
        }
    };

    const initiateDirectCall = async (callType: 'audio' | 'video') => {
        try {
            const avatarUrl = (astrologer as any)?.avatar || (astrologer as any)?.profileImage || '';
            const rpm = callType === 'audio' ? ((astrologer as any)?.rpm || 15) : ((astrologer as any)?.videoRpm || 20);

            await initiateCall({
                astrologerId,
                astrologerName: astrologer?.name || 'Astrologer',
                callType,
                avatarUrl,
                rpm
            });
        } catch (err: any) {
            console.error('Direct call initiation failed:', err);
            // Already alerted in utility usually, but we can add specific handling if needed
        }
    };

    const handleCallTypeSelection = (callType: 'audio' | 'video') => {
        setShowCallOptions(false);
        if (isAuthenticated()) {
            initiateDirectCall(callType);
        } else {
            const selectedId = localStorage.getItem("selectedAstrologerId") || astrologerId;
            localStorage.setItem("selectedAstrologerId", selectedId);
            localStorage.setItem("callIntent", callType);
            localStorage.setItem("callSource", "callWithAstrologer");
            router.push("/login");
        }
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
                    src="/Astrologer profile Background.svg"
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
                        {/* Profile Card - Premium Glassmorphism */}
                        <motion.div
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="relative group">
                                        <img
                                            src={
                                                (astrologer.avatar && astrologer.avatar.startsWith('http')) ||
                                                    (astrologer.profileImage && astrologer.profileImage.startsWith('http'))
                                                    ? astrologer.avatar || astrologer.profileImage
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=F7941D&color=fff&size=200`
                                            }
                                            alt={astrologer.name}
                                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-3xl object-cover border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-1.5 whitespace-nowrap">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Online Now</span>
                                        </div>
                                    </div>

                                    {/* Ratings Summary */}
                                    <div className="mt-8 flex flex-col items-center">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-2xl font-black text-gray-900">{getRatingValue(astrologer.rating).toFixed(1)}</span>
                                            <div className="flex">
                                                {renderStars(getRatingValue(astrologer.rating))}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {astrologer.callsCount || "12k+"} Consultations
                                        </div>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Poppins' }}>
                                                {astrologer.name}
                                            </h1>
                                            <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleShare}
                                                aria-label="Share profile"
                                                title="Share profile"
                                                className="p-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-all"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={handleToggleFavorite}
                                                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                                aria-pressed={isFavorited}
                                                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                                className={`p-2.5 rounded-full border transition-all ${
                                                    isFavorited
                                                        ? 'bg-red-50 border-red-200 text-red-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'
                                                }`}
                                            >
                                                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/50 border border-orange-100/50">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Expertise</p>
                                                <p className="text-sm font-bold text-gray-700 line-clamp-1">{astrologer.specializations?.[0] || "Vedic Astrology"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Languages className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Languages</p>
                                                <p className="text-sm font-bold text-gray-700 line-clamp-1">{(astrologer.languages || []).slice(0, 2).join(", ") || "English, Hindi"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 italic">
                                        "{astrologer.about || `Astrologer ${astrologer.name} is a renowned expert in spiritual guidance and cosmic alignment, helping individuals find clarity and success through accurate predictions.`}"
                                    </p>

                                    <div className="flex items-baseline gap-2 mb-6">
                                        {hasCompletedFreeCall ? (
                                            <>
                                                <span className="text-3xl font-black text-gray-900">₹{astrologer?.rpm || 15}</span>
                                                <span className="text-sm text-gray-400 font-bold uppercase">/min</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-3xl font-black text-green-600">FREE</span>
                                                <span className="text-sm text-gray-500 font-bold">first consultation</span>
                                                <span className="ml-2 text-sm text-gray-400 line-through font-semibold">₹{astrologer?.rpm || 15}/min</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Row — Chat / Audio / Video */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        <button
                                            onClick={handleChat}
                                            disabled={isStartingChat}
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            {isStartingChat ? 'Starting…' : 'Chat'}
                                        </button>

                                        <div className="relative">
                                            {/* 1st Free Call ribbon — only on the audio call CTA */}
                                            {!hasCompletedFreeCall && (
                                                <div className="absolute -top-2 right-3 z-10 pointer-events-none">
                                                    <div className="bg-gradient-to-l from-orange-600 to-orange-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider border border-white/30">
                                                        <Star className="w-3 h-3 fill-white" />
                                                        1st Free
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleCallTypeSelection('audio')}
                                                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-[length:200%_auto] hover:bg-right text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all duration-500 flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <Phone className="w-5 h-5" />
                                                Audio Call
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleCallTypeSelection('video')}
                                            className="bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <Video className="w-5 h-5" />
                                            Video Call
                                        </button>
                                    </div>
                                </div>
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
                                Check Similar {astrologer.talksAbout?.[0].replace("tarrot reading","Card Reading") || astrologer.specializations?.[0] || 'Astrology'} Experts
                            </h2>

                            <div className="relative">
                                <button
                                    onClick={scrollSimilarLeft}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors shadow-md"
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
                                             className="flex-shrink-0 w-[221px] sm:w-[221px] md:w-[220px] lg:w-[210px] bg-white rounded-2xl border border-orange-100 p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-orange-200"
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
                                                 {similar.talksAbout?.join(", ").replace("tarrot reading","Card Reading") || similar.specializations?.join(", ").replace("tarrot reading","Card Reading") || "Kp, Vedic, Vastu"}
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
                                                     className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                                                 >
                                                     {hasCompletedFreeCall ? `₹${similar?.rpm || 15}/min` : 'OFFER: FREE 1st call'}
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

            {/* Dakshina Gift Modal */}
            <DakshinaModal
                isOpen={showGiftModal}
                onClose={() => setShowGiftModal(false)}
                onSend={handleSendGift}
                receiverName={astrologer?.name || 'Astrologer'}
                gifts={gifts}
                onFetchGifts={fetchGifts}
            />

            {showCallOptions && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-4 font-['Inter']">
                    <motion.div
                        className="bg-white rounded-[24px] p-6 max-w-[320px] w-full shadow-2xl border border-white/20 relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <button 
                            onClick={() => setShowCallOptions(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3 text-[#F7941D]">
                                <PhoneCall className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center tracking-tight">
                                Choose Call Type
                            </h3>
                            <p className="text-gray-500 text-center text-xs mt-1 font-medium leading-relaxed">
                                Connect with <span className="text-[#F7941D] font-semibold">{selectedCallAstrologer?.name}</span>
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => handleCallTypeSelection('audio')}
                                className="w-full bg-[#F7941D] hover:bg-[#e8891a] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-orange-500/10 transition-all duration-200"
                            >
                                <Phone className="w-4 h-4" strokeWidth={2.5} />
                                <span className="text-sm">Audio Call</span>
                            </button>
                            
                            <button
                                onClick={() => handleCallTypeSelection('video')}
                                className="w-full bg-[#333333] hover:bg-[#222222] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-gray-900/10 transition-all duration-200"
                            >
                                <Video className="w-4 h-4" strokeWidth={2.5} />
                                <span className="text-sm">Video Call</span>
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowCallOptions(false)}
                            className="w-full mt-5 text-gray-400 py-1 text-[11px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Share / Favorite toast */}
            <AnimatePresence>
                {shareToast && (
                    <motion.div
                        key="share-toast"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.18 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg"
                    >
                        {shareToast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
