"use client";

import React, { useEffect, useState } from 'react';
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
import SectionHeader from "./ui/SectionHeader";

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

  const total = astrologers.length;
  const maxIndex = Math.max(0, total - 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (total ? (prev + 1) % total : 0));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (total ? (prev - 1 + total) % total : 0));
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
              className="h-[360px] rounded-[20px] bg-white"
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

        {/* Standardized Heading */}
        <SectionHeader
          tag="Trusted Guidance"
          title={
            <>
              Consult with India's{' '}
              <span className="text-[#F7971E]">Best Astrologers</span>
            </>
          }
          subtitle={
            <div className="flex flex-wrap justify-center gap-6 mt-2 text-sm text-[#555]">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#EDB000]" />
                Verified Experts
              </span>
              <span className="flex items-center gap-2">
                <Star size={16} className="text-[#EDB000] fill-[#EDB000]" />
                4.8+ Rating
              </span>
              <span className="flex items-center gap-2">
                <Phone size={16} className="text-[#EDB000]" />
                Instant Connect
              </span>
              <span className="flex items-center gap-2">
                <Lock size={16} className="text-[#EDB000]" />
                Confidential
              </span>
            </div>
          }
          center
        />

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

          <div
            className="relative h-[400px] flex items-center justify-center select-none"
            style={{ perspective: '1800px' }}
          >
            {astrologers.map((astro, i) => {
                const tags = getSafeTags(astro.talksAbout || []);
                const isOnline = astro.status === 'online' || astro.status === 'available';
                const rating = astro.rating?.avg || 4.8;
                const exp = astro.age || astro.experience || 1;
                const rpm = astro.rpm || 15;

                // Wrap the offset so the carousel feels circular
                let offset = i - currentIndex;
                const len = total;
                if (len > 0) {
                  if (offset > len / 2) offset -= len;
                  if (offset < -len / 2) offset += len;
                }
                const abs = Math.abs(offset);
                const visibleSide = isMobile ? 1 : 2;
                const isVisible = abs <= visibleSide;

                const stepX = isMobile ? 150 : 240;
                const translateX = offset * stepX;
                const rotateY = offset * (isMobile ? -22 : -28);
                const translateZ = abs === 0 ? 0 : -abs * 140;
                const scale = abs === 0 ? 1 : Math.max(0.78, 1 - abs * 0.1);
                const opacity = isVisible ? (abs === 0 ? 1 : 0.85 - abs * 0.18) : 0;
                const zIndex = 30 - abs;
                const isFocused = abs === 0;

                return (
                  <motion.div
                    key={astro._id}
                    className="absolute top-1/2 left-1/2 w-[260px] md:w-[290px]"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center center',
                      pointerEvents: isVisible ? 'auto' : 'none',
                      filter: isFocused ? 'none' : `blur(${Math.min(abs * 1.2, 3)}px)`,
                    }}
                    initial={false}
                    animate={{
                      x: `calc(-50% + ${translateX}px)`,
                      y: '-50%',
                      rotateY,
                      z: translateZ,
                      scale,
                      opacity,
                      zIndex,
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 0.8 }}
                    onClick={() => {
                      if (!isFocused) setCurrentIndex(i);
                      else handleProfile(astro._id);
                    }}
                  >
                    {/* COMPACT PREMIUM CARD */}
                    <motion.div
                      whileHover={isFocused ? { y: -4 } : undefined}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`group relative bg-white rounded-[20px] border border-[#F1E4CE] cursor-pointer h-[360px] flex flex-col overflow-hidden transition-shadow ${
                        isFocused
                          ? 'shadow-[0_30px_60px_-20px_rgba(247,154,24,0.45)] ring-1 ring-[#F79A18]/30'
                          : 'shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)]'
                      }`}
                    >
                      {/* Top hero strip */}
                      <div
                        className="relative h-[92px] flex items-start justify-between px-3 pt-3"
                        style={{
                          background:
                            'linear-gradient(135deg, #FFE7BD 0%, #FFF4DC 55%, #FFFBF3 100%)',
                        }}
                      >
                        <div className="flex items-center gap-1 px-1.5 py-[3px] rounded-md bg-white/80 backdrop-blur border border-[#EDB000]/30">
                          <ShieldCheck size={10} className="text-[#EDB000]" />
                          <span className="text-[9px] font-bold tracking-wide text-[#3A3A3A] uppercase leading-none">Verified</span>
                        </div>

                        {isOnline ? (
                          <div className="flex items-center gap-1 px-1.5 py-[3px] rounded-md bg-emerald-50 border border-emerald-200">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide leading-none">Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-1.5 py-[3px] rounded-md bg-gray-100 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide leading-none">Busy</span>
                          </div>
                        )}
                      </div>

                      {/* Avatar overlapping hero */}
                      <div className="relative -mt-[44px] flex justify-center">
                        <div
                          className="relative w-[84px] h-[84px] rounded-full p-[2.5px]"
                          style={{
                            background:
                              'conic-gradient(from 180deg, #F79A18, #EDB000, #F79A18)',
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-white p-[2px]">
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#F8F4EC]">
                              <Image
                                src={
                                  astro.avatar?.startsWith('http')
                                    ? astro.avatar
                                    : `https://ui-avatars.com/api/?name=${astro.name}&background=F8F4EC&color=3A3A3A`
                                }
                                alt={astro.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          {/* Rating chip */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white px-2 py-[3px] rounded-full shadow-md border border-[#F1E4CE]">
                            <Star size={10} fill={COLORS.gold} color={COLORS.gold} />
                            <span className="text-[10px] font-bold text-[#3A3A3A] leading-none">
                              {rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="px-4 pt-3 pb-4 flex flex-col">
                        {/* Name */}
                        <h3 className="text-[15px] font-bold text-center leading-tight text-[#1F1F1F] h-[36px] line-clamp-2 flex items-center justify-center px-1">
                          {astro.name}
                        </h3>

                        {/* Meta row */}
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#777] mt-0.5">
                          <span className="font-semibold text-[#3A3A3A]">Hindi</span>
                          <span className="w-[3px] h-[3px] rounded-full bg-[#D9C7A6]" />
                          <span>
                            <span className="font-semibold text-[#3A3A3A]">{exp}</span> yrs
                          </span>
                          <span className="w-[3px] h-[3px] rounded-full bg-[#D9C7A6]" />
                          <span>
                            <span className="font-semibold text-[#3A3A3A]">{astro.calls || 0}</span> calls
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="mt-2.5 h-[28px] flex flex-nowrap justify-center items-center gap-1 overflow-hidden">
                          {(tags.length > 0 ? tags : ['Vedic']).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 h-[22px] inline-flex items-center rounded-md text-[10px] font-semibold whitespace-nowrap border border-[#EDD9B0]/70 capitalize shrink-0"
                              style={{ background: '#FBF3E2', color: '#7A5A1F' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Price strip */}
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#FFFAF0] border border-[#F1E4CE] px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#9C7B3A] leading-none">
                              {hasCompletedFreeCall ? 'Per minute' : 'First call'}
                            </span>
                            <span className="text-[14px] font-extrabold text-[#3A3A3A] leading-tight mt-0.5">
                              {hasCompletedFreeCall ? `₹${rpm}` : 'FREE'}
                              {hasCompletedFreeCall && (
                                <span className="text-[10px] font-medium text-[#888] ml-0.5">/min</span>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#9C7B3A] leading-none block">Connects</span>
                            <span className="text-[11px] font-bold text-emerald-600 leading-tight mt-0.5 block">~Instantly</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={(e) => handleCallClick(astro, e)}
                          className="relative w-full h-11 mt-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-white overflow-hidden group/btn shadow-[0_6px_16px_-6px_rgba(247,154,24,0.6)] hover:shadow-[0_10px_22px_-6px_rgba(247,154,24,0.75)] transition-shadow"
                          style={{
                            background:
                              'linear-gradient(135deg, #F79A18 0%, #EDB000 100%)',
                          }}
                        >
                          <span className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover/btn:translate-x-[110%] transition-transform duration-700 skew-x-12" />
                          <Phone size={14} strokeWidth={2.75} />
                          <span className="text-[13px] tracking-tight">
                            {hasCompletedFreeCall ? 'Call Now' : 'Start Free Call'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
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