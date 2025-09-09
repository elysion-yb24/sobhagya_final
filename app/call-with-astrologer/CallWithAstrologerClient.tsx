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

  // 🔒 Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/astrologers");
    }
  }, [router]);

  const [astrologers, setAstrologers] = useState<Astrologer[]>(initialAstrologers || []);
  const [skip, setSkip] = useState(initialAstrologers?.length || 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

  // 📜 Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchMoreAstrologers();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchMoreAstrologers]);

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
            src="/call.png"
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
              />
              {isLoadingMore && <EnhancedLoader />}
            </motion.div>
          )}
        </div>
      </div>
    </WalletBalanceProvider>
  );
};

export default CallWithAstrologerClient;
