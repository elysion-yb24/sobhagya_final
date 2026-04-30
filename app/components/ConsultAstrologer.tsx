"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Lock,
  PhoneCall,
  X,
} from 'lucide-react';

import { getApiBaseUrl } from '@/app/config/api';
import {
  isAuthenticated,
  getAuthToken,
  getUserDetails,
} from '@/app/utils/auth-utils';

interface Astrologer {
  _id: string;
  name: string;
  avatar: string;
  talksAbout: string[];
  rating: {
    avg: number;
    count: number;
  };
  calls: number;
  callMinutes: number;
  rpm: number;
  status: string;
  age?: number;
  experience?: number | string;
}

const COLORS = {
  primary: '#F79A18',
  gold: '#EDB000',
  cream: '#F8F4EC',
  soft: '#EFE6D5',
  dark: '#3A3A3A',
  text: '#666666',
  white: '#FFFFFF',
};

const AstrologerCarousel = () => {
  const router = useRouter();

  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [showCallOptions, setShowCallOptions] = useState(false);
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);

  // Same source of truth as AstrologerCard / profile page — never disagree on
  // whether the user has already used their free first consultation.
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
  const [selectedCallAstrologer, setSelectedCallAstrologer] =
    useState<Astrologer | null>(null);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/user/api/users-list`
        );
        const data = await res.json();

        if (data.success) {
          setAstrologers(data.data.list || []);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAstrologers();
  }, []);

  const visibleCards = isMobile ? 1 : 4;

  const maxIndex = useMemo(() => {
    return Math.max(0, astrologers.length - visibleCards);
  }, [astrologers.length, visibleCards]);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= maxIndex ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? maxIndex : prev - 1
    );
  };

  useEffect(() => {
    if (!astrologers.length) return;

    const timer = setInterval(nextSlide, 3500);
    return () => clearInterval(timer);
  }, [astrologers.length, maxIndex]);

  const handleProfile = (id: string) => {
    router.push(`/consult-astrologer/profile/${id}`);
  };

  const handleCallClick = (
    astro: Astrologer,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedCallAstrologer(astro);
    setShowCallOptions(true);
  };

  const chooseCallType = (
    type: 'audio' | 'video'
  ) => {
    if (!selectedCallAstrologer) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    router.push(
      type === 'audio'
        ? '/audio-call'
        : '/video-call'
    );

    setShowCallOptions(false);
  };

  const getSafeTags = (tags: string[] = []) => {
    return tags.slice(0, 3);
  };

  if (loading) {
    return (
      <div
        className="py-20"
        style={{ background: COLORS.cream }}
      >
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[460px] rounded-[28px] bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  // Main return block
  return (
    <div
      className="section-spacing overflow-hidden"
      style={{ background: COLORS.cream }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-4">

        {/* Heading */}
        <div className="text-center mb-14">
          <p
            className="font-semibold tracking-wider text-sm"
            style={{ color: COLORS.primary }}
          >
            TRUSTED GUIDANCE
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mt-3 text-black leading-tight">
            Consult with India's{' '}
            <span style={{ color: COLORS.primary }}>
              Best Astrologers
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-[#555]">
            <span className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                color={COLORS.gold}
              />
              Verified Experts
            </span>

            <span className="flex items-center gap-2">
              <Star
                size={16}
                fill={COLORS.gold}
                color={COLORS.gold}
              />
              4.8+ Rating
            </span>

            <span className="flex items-center gap-2">
              <Phone
                size={16}
                color={COLORS.gold}
              />
              Instant Connect
            </span>

            <span className="flex items-center gap-2">
              <Lock
                size={16}
                color={COLORS.gold}
              />
              Confidential
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">

          {/* Prev */}
          <button
            onClick={prevSlide}
            className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform min-h-0"
            style={{
              background: COLORS.primary,
              color: COLORS.white,
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next */}
          <button
            onClick={nextSlide}
            className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform min-h-0"
            style={{
              background: COLORS.primary,
              color: COLORS.white,
            }}
          >
            <ChevronRight size={20} />
          </button>

          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{
                x: `-${currentIndex * (100 / visibleCards)}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 18,
              }}
            >
              {astrologers.map((astro) => {
                const tags = getSafeTags(
                  astro.talksAbout || []
                );

                return (
                  <div
                    key={astro._id}
                    className="w-full md:w-1/4 shrink-0 p-3"
                  >
                    {/* FIXED CARD */}
                    <motion.div
                      whileHover={{
                        y: -8,
                        scale: 1.01,
                      }}
                      onClick={() =>
                        handleProfile(astro._id)
                      }
                      className="bg-white rounded-[28px] p-5 border border-orange-100 shadow-premium hover:shadow-xl cursor-pointer h-[470px] flex flex-col hover:border-orange-200"
                    >

                      {/* TOP AREA */}
                      <div>

                        {/* PERFECT CIRCLE IMAGE */}
                        <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#f2e2c2]">
                          <Image
                            src={
                              astro.avatar?.startsWith(
                                'http'
                              )
                                ? astro.avatar
                                : `https://ui-avatars.com/api/?name=${astro.name}`
                            }
                            alt={astro.name}
                            fill
                            className="object-cover"
                          />

                          
                        </div>

                        {/* FIXED NAME HEIGHT */}
                        <h3 className="text-[20px] font-bold text-center mt-5 leading-tight h-[56px] line-clamp-2 flex items-center justify-center">
                          {astro.name}
                        </h3>

                        {/* FIXED SUBTITLE HEIGHT */}
                        <p className="text-center text-[#666] mt-1 h-[28px]">
                          Hindi • {astro.age || astro.experience || 1} Years Exp.
                        </p>

                        {/* TAG SECTION FIXED */}
                        <div className="mt-4 h-[92px] flex flex-wrap justify-center content-start gap-2 overflow-hidden">
                          {tags.length > 0 ? (
                            tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 h-9 inline-flex items-center rounded-full text-sm whitespace-nowrap max-w-full truncate"
                                style={{
                                  background:
                                    COLORS.soft,
                                  color:
                                    COLORS.dark,
                                }}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span
                              className="px-3 h-9 inline-flex items-center rounded-full text-sm"
                              style={{
                                background:
                                  COLORS.soft,
                                color:
                                  COLORS.dark,
                              }}
                            >
                              Vedic
                            </span>
                          )}
                        </div>
                      </div>

                      {/* BOTTOM PUSHED SAME LEVEL */}
                      <div className="mt-auto">
                        <div className="flex justify-between border-t pt-4 text-sm text-[#555]">
                          <span className="flex items-center gap-1">
                            <Star
                              size={16}
                              fill={COLORS.gold}
                              color={COLORS.gold}
                            />
                            {astro.rating?.avg ||
                              4.8}
                          </span>

                          <span>
                            {astro.calls || 0} Calls
                          </span>
                        </div>

                        <button
                          onClick={(e) =>
                            handleCallClick(
                              astro,
                              e
                            )
                          }
                          className="w-full h-12 rounded-2xl mt-4 font-semibold flex items-center justify-center gap-2"
                          style={{
                            background:
                              COLORS.primary,
                            color:
                              COLORS.white,
                          }}
                        >
                          <Phone size={16} />
                          {hasCompletedFreeCall
                            ? `Call • ₹${astro.rpm || 15}/min`
                            : 'FREE 1st Call'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({
              length: maxIndex + 1,
            }).map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  setCurrentIndex(i)
                }
                className="h-2 rounded-full min-h-0"
                style={{
                  width:
                    i === currentIndex
                      ? 24
                      : 10,
                  background:
                    i === currentIndex
                      ? COLORS.primary
                      : '#dbc7a2',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showCallOptions && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center px-4 font-['Inter']"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-[24px] p-6 w-full max-w-[320px] shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <button 
                onClick={() => setShowCallOptions(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Header with icon */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3 text-[#F7941D]">
                  <PhoneCall size={24} strokeWidth={2.5} />
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
                  onClick={() => chooseCallType('audio')}
                  className="w-full bg-[#F7941D] hover:bg-[#e8891a] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-orange-500/10 transition-all duration-200"
                >
                  <Phone size={16} strokeWidth={2.5} />
                  <span className="text-sm">Audio Call</span>
                </button>

                <button
                  onClick={() => chooseCallType('video')}
                  className="w-full bg-[#333333] hover:bg-[#222222] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-gray-900/10 transition-all duration-200"
                >
                  <Video size={16} strokeWidth={2.5} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AstrologerCarousel;