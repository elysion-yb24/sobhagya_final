"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../utils/auth-utils';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Clock, 
  Phone, 
  Video, 
  Users, 
  Award, 
  Languages, 
  Zap,
  Gift,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Shield,
  Heart,
  MessageCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { getApiBaseUrl } from "../config/api";
import AstrologerList from "../components/astrologers/AstrologerList";
import { useWalletBalance, WalletBalanceProvider } from '../components/astrologers/WalletBalanceContext';

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

const AstrologerCallPage = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [allAstrologers, setAllAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users to /astrologers, else fetch all astrologers
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      router.replace('/astrologers');
      return;
    }
    const fetchAllAstrologers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = getApiBaseUrl();
        const apiUrl = `${baseUrl}/user/api/users-list`;
        
        console.log('Fetching astrologers from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Response is not JSON:', contentType);
          // Try to get the response text for debugging
          const text = await response.text();
          console.error('Response text:', text.substring(0, 200));
          throw new Error('Response is not JSON');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data?.list) {
          setAllAstrologers(data.data.list);
        } else {
          console.warn('API response format unexpected:', data);
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Error fetching astrologers:', err);
        setError("Failed to fetch astrologers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAstrologers();
  }, []);

  // No extra auth logs

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <EnhancedLoader />
      </div>
    );
  }

  return (
    <WalletBalanceProvider>
      <div className="w-full bg-white min-h-screen">
        {/* Enhanced Header banner */}
        <motion.div 
          className="relative h-[200px] overflow-hidden mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 w-full h-[200px]">
            <Image 
              src="/Call with Astrologer.svg" 
              alt="call-image" 
              fill
              className="brightness-75 object-cover"
            />
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
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

        {/* Enhanced Astrologers section */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-gray-800 text-lg mb-6 leading-relaxed">
              Our astrology experts are ready to assist you! Whether you need a consultation or have inquiries, get immediate answers to your life's questions.
            </p>
            <p className="text-gray-800 text-lg leading-relaxed">
              <span className="font-semibold">Connect with skilled Astrologers</span> for personalized insights on love, career, health, and beyond.
            </p>
          </motion.div>

          {isLoading ? (
            <EnhancedLoader />
          ) : error ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load Astrologers
                </h3>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <AstrologerList 
                astrologers={allAstrologers} 
                isLoading={isLoading}
                hasError={!!error}
                compactButtons={false}
                showVideoButton={true}
                source="callWithAstrologer"
              />
            </motion.div>
          )}

          {/* Stats section */}
          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            {[
              { icon: Users, number: "50,000+", label: "Happy Clients" },
              { icon: MessageCircle, number: "1M+", label: "Consultations" },
              { icon: TrendingUp, number: "98%", label: "Success Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h4>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </WalletBalanceProvider>
  );
};

export default AstrologerCallPage;
