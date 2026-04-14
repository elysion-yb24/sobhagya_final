"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import AstrologerList from "../components/astrologers/AstrologerList";
import { WalletBalanceProvider } from "../components/astrologers/WalletBalanceContext";
import { getApiBaseUrl } from "../config/api";
import { isAuthenticated, getAuthToken, getUserDetails } from "../utils/auth-utils";

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
}

interface CallWithAstrologerClientProps {
  initialAstrologers: Astrologer[];
  error: string | null;
}

const EnhancedLoader = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-32"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200 rounded-full animate-pulse"></div>
    </div>
    <motion.p
      className="mt-4 text-gray-600 font-medium"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Loading astrologers...
    </motion.p>
  </motion.div>
);

const CallWithAstrologerClient: React.FC<CallWithAstrologerClientProps> = ({
  initialAstrologers,
  error,
}) => {
  const router = useRouter();

  // 🔒 Optional redirect if already logged in (commented out for better performance)
  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     router.replace("/astrologers");
  //   }
  // }, [router]);

  const [astrologers, setAstrologers] = useState<Astrologer[]>(initialAstrologers || []);
  const [skip, setSkip] = useState(initialAstrologers?.length || 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<Astrologer | null>(null);

  const fetchMoreAstrologers = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const baseUrl = getApiBaseUrl();
      const limit = 10;
      const apiUrl = `${baseUrl}/user/api/users-list?skip=${skip}&limit=${limit}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success && data.data?.list) {
        const newBatch = data.data.list;
        setAstrologers((prev) => [...prev, ...newBatch]);
        setSkip((prev) => prev + limit);
        setHasMore(newBatch.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more astrologers:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [skip, isLoadingMore, hasMore]);

  // 📜 Infinite scroll with throttling for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            fetchMoreAstrologers();
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchMoreAstrologers]);

  // Handle call modal
  const handleCallModalOpen = (astrologer: Astrologer) => {
    setSelectedCallAstrologer(astrologer);
    setShowCallOptions(true);
  };

  // Direct call initiation for authenticated users
  const initiateDirectCall = async (astrologer: Astrologer, callType: 'audio' | 'video') => {
    try {
      const token = getAuthToken();
      const user = getUserDetails();
      if (!token || !user?.id) {
        localStorage.setItem("selectedAstrologerId", astrologer._id);
        localStorage.setItem("callIntent", callType);
        localStorage.setItem("callSource", "callWithAstrologer");
        router.push("/login");
        return;
      }

      if (user.role === 'friend') {
        alert('You Are a Partner At Sobhagya, So Call Cannot Be Initiated');
        return;
      }

      const channelId = Date.now().toString();
      const livekitUrl = `/api/calling/call-token-livekit?channel=${encodeURIComponent(channelId)}`;
      const body = {
        receiverUserId: astrologer._id,
        type: callType === 'audio' ? 'call' : 'video',
        appVersion: '1.0.0'
      };

      const response = await fetch(livekitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok || !data?.data?.token || !data?.data?.channel) {
        throw new Error(data?.message || 'Failed to initiate call');
      }

      localStorage.setItem('lastAstrologerId', astrologer._id);
      localStorage.setItem('callSource', 'callWithAstrologer');

      const dest = callType === 'audio'
        ? `/audio-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologer.name)}&astrologerId=${encodeURIComponent(astrologer._id)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`
        : `/video-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologer.name)}&astrologerId=${encodeURIComponent(astrologer._id)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`;

      router.push(dest);
    } catch (err) {
      console.error('\u274c Direct call initiation failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to initiate call');
    }
  };

  const handleCallTypeSelection = (callType: 'audio' | 'video') => {
    if (selectedCallAstrologer) {
      setShowCallOptions(false);
      if (isAuthenticated()) {
        initiateDirectCall(selectedCallAstrologer, callType);
      } else {
        localStorage.setItem("selectedAstrologerId", selectedCallAstrologer._id);
        localStorage.setItem("callIntent", callType);
        localStorage.setItem("callSource", "callWithAstrologer");
        router.push("/login");
      }
    }
  };

  return (
    <WalletBalanceProvider>
      <div className="w-full bg-white min-h-screen">
        {/* 🟠 Hero Section */}
        <motion.div
          className="relative h-[160px] sm:h-[180px] md:h-[200px] overflow-hidden mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/call.svg"
            alt="call-image"
            fill
            className="brightness-75 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          <div className="relative flex flex-col items-center justify-center h-full text-center px-6">
            <motion.h1
              className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
              style={{ fontFamily: "EB Garamond" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Call with Astrologer
            </motion.h1>

          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.p
            className="text-base sm:text-lg font-light mb-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Our astrology experts are ready to assist you! Whether you need a consultation or have inquiries, get immediate answers to your life's questions.
          </motion.p>
          <motion.p
            className="text-base sm:text-lg font-light text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-black font-medium">Connect with skilled Astrologers </span>for personalized insights on love, career, health, and beyond.
          </motion.p>
        </div>


        {/* 🟠 Astrologers */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          {error ? (
            <motion.div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load Astrologers
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
              <AstrologerList
                astrologers={astrologers}
                isLoading={isLoadingMore}
                hasError={!!error}
                compactButtons={false}
                showVideoButton={true}
                source="callWithAstrologer"
                onCallModalOpen={handleCallModalOpen}
              />
              {isLoadingMore && <EnhancedLoader />}
            </motion.div>
          )}
        </div>

        {/* Call Options Modal */}
        {showCallOptions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Header with icon */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08C7.85 2 8.54 2.51 8.71 3.27C8.95 4.33 9.3 5.36 9.75 6.33C9.97 6.82 9.83 7.4 9.42 7.73L8.09 9.06C9.51 11.41 11.59 13.49 13.94 14.91L15.27 13.58C15.6 13.17 16.18 13.03 16.67 13.25C17.64 13.7 18.67 14.05 19.73 14.29C20.49 14.46 21 15.15 21 15.92V16.92" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  Choose Call Type
                </h3>
                <p className="text-gray-500 text-center text-sm mt-1">
                  Connect with <span className="font-semibold text-gray-700">{selectedCallAstrologer?.name}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleCallTypeSelection('audio')}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-5 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08C7.85 2 8.54 2.51 8.71 3.27" />
                    <path d="M15 5V9M13 7H17" />
                  </svg>
                  Audio Call
                </button>
                
                <button
                  onClick={() => handleCallTypeSelection('video')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 px-5 rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  Video Call
                </button>
              </div>
              
              <button
                onClick={() => setShowCallOptions(false)}
                className="w-full mt-4 text-gray-500 py-2.5 px-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </WalletBalanceProvider>
  );
};

export default CallWithAstrologerClient;
