"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import AstrologerList from "../components/astrologers/AstrologerList";
import { WalletBalanceProvider } from "../components/astrologers/WalletBalanceContext";
import { getApiBaseUrl } from "../config/api";
import { isAuthenticated } from "../utils/auth-utils";

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

  const handleCallTypeSelection = (callType: 'audio' | 'video') => {
    if (selectedCallAstrologer) {
      localStorage.setItem("selectedAstrologerId", selectedCallAstrologer._id);
      localStorage.setItem("callIntent", callType);
      localStorage.setItem("callSource", "callWithAstrologer");
      setShowCallOptions(false);
      router.push("/login");
    }
  };

  return (
    <WalletBalanceProvider>
      <div className="w-full bg-white min-h-screen">
        {/* 🟠 Hero Section */}
        <motion.div
          className="relative h-[200px] overflow-hidden mb-8"
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
              className="text-white text-6xl sm:text-4xl md:text-6xl font-bold mb-2"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Choose Call Type
              </h3>
              <p className="text-gray-600 text-center mb-6">
                How would you like to connect with {selectedCallAstrologer?.name}?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleCallTypeSelection('audio')}
                  className="w-full bg-[#F7971E] text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" fill="currentColor"/>
                  </svg>
                  Audio Call
                </button>
                
                <button
                  onClick={() => handleCallTypeSelection('video')}
                  className="w-full bg-[#F7971E] text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6C3 4.89543 3.89543 4 5 4H12C13.1046 4 14 4.89543 14 6V18C14 19.1046 13.1046 20 12 20H5C3.89543 20 3 19.1046 3 18V6Z" fill="currentColor"/>
                    <path d="M14 8.5L19 6V18L14 15.5V8.5Z" fill="currentColor"/>
                  </svg>
                  Video Call
                </button>
              </div>
              
              <button
                onClick={() => setShowCallOptions(false)}
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
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
