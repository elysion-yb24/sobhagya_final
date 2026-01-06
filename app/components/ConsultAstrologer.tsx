'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '@/app/config/api';
import { isAuthenticated, hasUserCalledBefore } from '@/app/utils/auth-utils';
import { Video } from 'lucide-react';

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
  isLive: boolean;
  languages?: string[];
}

const AstrologerCarousel = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<Astrologer | null>(null);
  const [userHasCalledBefore, setUserHasCalledBefore] = useState(false);

  // Check if user has called before
  useEffect(() => {
    const checkCallStatus = () => {
      if (isAuthenticated()) {
        const hasCalled = hasUserCalledBefore() || localStorage.getItem("userHasCalledBefore") === "true";
        setUserHasCalledBefore(hasCalled);
      } else {
        setUserHasCalledBefore(false);
      }
    };

    checkCallStatus();

    // Listen for call status changes
    const handleCallStatusChange = () => {
      checkCallStatus();
    };

    window.addEventListener('user-call-status-changed', handleCallStatusChange);
    return () => {
      window.removeEventListener('user-call-status-changed', handleCallStatusChange);
    };
  }, []);




  // Fetch astrologers from API
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        setLoading(true);
        setHasError(false);
        const baseUrl = getApiBaseUrl();
        const apiUrl = `${baseUrl}/user/api/users-list`;

        console.log('Fetching from:', apiUrl);


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
          // Filter astrologers: show only online partners
          const onlineAstrologers = data.data.list.filter((astrologer: Astrologer) => astrologer.status === "online");

          setAstrologers(onlineAstrologers);
        } else {
          console.warn('API response format unexpected:', data);
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Failed to fetch astrologers:', error);
        setHasError(true);
        setAstrologers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAstrologers();
  }, []);

  const nextSlide = () => {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    let maxIndex;
    if (isSmallScreen) {
      maxIndex = astrologers.length - 1; // 1 card at a time
    } else if (isTablet) {
      maxIndex = Math.max(0, astrologers.length - 2); // 2 cards at a time
    } else {
      maxIndex = Math.max(0, astrologers.length - 4); // 4 cards at a time
    }

    setCurrentIndex((prevIndex) =>
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    let maxIndex;
    if (isSmallScreen) {
      maxIndex = astrologers.length - 1; // 1 card at a time
    } else if (isTablet) {
      maxIndex = Math.max(0, astrologers.length - 2); // 2 cards at a time
    } else {
      maxIndex = Math.max(0, astrologers.length - 4); // 4 cards at a time
    }

    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
  };

  // Auto-play functionality disabled - carousel only moves when user clicks arrows

  // Handle astrologer card click
  const handleAstrologerClick = (astrologerId: string) => {
    // Go to the new design profile page
    router.push(`/call-with-astrologer/profile/${astrologerId}`);
  };

  // Handle call button click
  const handleCallClick = (astrologer: Astrologer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCallAstrologer(astrologer);
    setShowCallOptions(true);
  };

  // Handle call type selection
  const handleCallTypeSelection = (callType: 'audio' | 'video') => {
    if (selectedCallAstrologer) {
      localStorage.setItem("selectedAstrologerId", selectedCallAstrologer._id);
      localStorage.setItem("callIntent", callType);
      localStorage.setItem("callSource", "consultAstrologer");
      setShowCallOptions(false);
      router.push("/login");
    }
  };

  // Helper function to render astrologer card
  const renderAstrologerCard = (astrologer: Astrologer, cardWidth?: string) => {
    const ratingValue = typeof astrologer.rating === 'object' ? astrologer.rating.avg : astrologer.rating || 4.5;
    const experience = Math.floor((astrologer.callMinutes || 0) / 60) || 1;
    const callsCount = astrologer.calls || 0;

    return (
      <div
        className="relative bg-white rounded-xl border pt-3 px-3 pb-2 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col w-full overflow-hidden"
        style={{
          borderColor: "#F7971E",
          boxShadow: "0 4px 16px rgba(247,151,30,0.15)",
          width: cardWidth || '100%',
          height: '200px',
        }}
        onClick={() => handleAstrologerClick(astrologer._id)}
      >
        {/* Free Call Banner - Show for non-logged-in users OR new logged-in users who haven't called */}
        {(!isAuthenticated() || (isAuthenticated() && !userHasCalledBefore)) && (
          <div
            className="absolute top-3 -right-10 w-[160px] bg-[#F7971E] text-white text-[11px] text-center font-bold py-[2px] rotate-[45deg] flex items-center justify-center shadow-md z-10 whitespace-normal leading-tight"
            style={{ transformOrigin: "center" }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1st Free Call
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-2.5 relative z-10 h-full">
          {/* Avatar Section */}
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src={
                (astrologer.avatar && astrologer.avatar.startsWith('http'))
                  ? astrologer.avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=F7971E&color=fff&size=60`
              }
              alt={astrologer.name}
              className="w-[60px] h-[60px] rounded-full object-cover border-2"
              style={{
                borderColor: astrologer.status === "online"
                  ? "#10B981"
                  : astrologer.status === "busy"
                    ? "#F97316"
                    : astrologer.status === "offline"
                      ? "#EF4444"
                      : "#F7971E",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=F7971E&color=fff&size=60`;
              }}
            />

            {/* Rating */}
            <div className="mt-1 flex items-center justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-[10px] ${i < Math.floor(ratingValue) ? "text-yellow-400" : "text-gray-300"}`}>
                  ★
                </span>
              ))}
            </div>

            {/* Experience & Orders */}
            <div className="mt-1 space-y-0.5 text-center">
              <div className="text-[10px] text-gray-600 whitespace-nowrap">
                <span className="font-semibold">{experience}</span> {experience === 1 ? 'Yr' : 'Yrs'}
              </div>
              <div className="text-[10px] text-gray-600 whitespace-nowrap">
                <span className="font-semibold">{callsCount || 0}</span> Orders
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Name & Verified */}
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-base font-bold text-gray-900 truncate">{astrologer.name}</h3>
                <img src="/orange_tick.png" alt="Verified" className="w-3.5 h-3.5 flex-shrink-0" />
              </div>

              {/* Status */}
              {astrologer.status && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${astrologer.status === "online"
                      ? "bg-green-500"
                      : astrologer.status === "busy"
                        ? "bg-orange-500"
                        : astrologer.status === "offline"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-600 capitalize truncate">{astrologer.status}</span>
                </div>
              )}

              {/* Expertise */}
              <div className="mb-1">
                <p className="text-xs text-gray-700 truncate">
                  {astrologer.talksAbout?.slice(0, 3).join(", ") || "Numerology, Vedic, Vastu"}
                </p>
              </div>

              {/* Languages */}
              <div className="mb-1">
                <p className="text-xs text-gray-600 truncate">
                  {(astrologer.languages || []).join(", ") || "Hindi, Bhojpuri"}
                </p>
              </div>
            </div>

            {/* Price - Always visible in one line */}
            <div className="mt-auto pt-1">
              <div className="text-sm font-bold text-orange-600 whitespace-nowrap">
                {isAuthenticated() && userHasCalledBefore ? `₹ ${astrologer?.rpm || 18}/min` : 'FREE 1st Call'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Don't render anything if there's an error
  if (hasError) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full py-12 relative" style={{
        backgroundImage: "url('/consult-home.jpg')",
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-white text-5xl md:text-4xl font-bold mb-10" style={{
            fontFamily: 'EB Garamond',
          }}>
            Consult with <em>India's</em> best Astrologers
          </h2>
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center max-w-sm mx-auto animate-pulse">
              <div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-48 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full py-6 relative"
      style={{
        backgroundImage: "url('/consult-home.jpg')",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-center text-white text-5xl md:text-4xl font-bold mb-6"
          style={{ fontFamily: "EB Garamond" }}
        >
          Consult with <em>India's</em> best Astrologers
        </h2>
      </div>

      {/* Slider container with arrows inside */}
      <div className="relative max-w-6xl mx-auto px-2">
        {/* Previous button - positioned inside */}
        <button
          onClick={prevSlide}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Previous astrologer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Slider track - responsive card display */}
        <div className="flex justify-center gap-2.5 px-6 sm:px-8">
          {/* Small screens: Show 1 card */}
          <div className="block md:hidden">
            {astrologers.slice(currentIndex, currentIndex + 1).map((astrologer) => (
              <div key={astrologer._id} className="flex-shrink-0 w-[280px]">
                {renderAstrologerCard(astrologer, '280px')}
              </div>
            ))}
          </div>

          {/* Tablets: Show 2 cards */}
          <div className="hidden md:flex lg:hidden gap-2.5">
            {astrologers.slice(currentIndex, currentIndex + 2).map((astrologer) => (
              <div key={astrologer._id} className="flex-shrink-0 w-[240px]">
                {renderAstrologerCard(astrologer, '240px')}
              </div>
            ))}
          </div>

          {/* Desktop: Show 4 cards */}
          <div className="hidden lg:flex gap-2.5">
            {astrologers.slice(currentIndex, currentIndex + 4).map((astrologer) => (
              <div key={astrologer._id} className="flex-shrink-0 w-[221px]">
                {renderAstrologerCard(astrologer, '221px')}
              </div>
            ))}
          </div>
        </div>

        {/* Next button - positioned inside */}
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Next astrologer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots indicator - limited to maximum 5 dots */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="hidden md:flex justify-center mt-10 space-x-1">
          {astrologers.length > 0 && Array.from({ length: Math.min(5, Math.max(1, Math.ceil(astrologers.length / 4))) }).map((_, index) => {
            const totalSlides = Math.ceil(astrologers.length / 4);
            const slideIndex = index;
            const currentSlide = Math.floor(currentIndex / 4);
            const isActive = currentSlide === slideIndex;

            return (
              <button
                key={index}
                onClick={() => {
                  const targetIndex = Math.min(slideIndex * 4, Math.max(0, astrologers.length - 4));
                  setCurrentIndex(targetIndex);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: "Poppins" }}>
              Choose Call Type
            </h3>
            <p className="text-gray-600 text-center mb-6" style={{ fontFamily: "Poppins" }}>
              How would you like to connect with {selectedCallAstrologer?.name}?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleCallTypeSelection('audio')}
                className="w-full bg-[#F7971E] text-black py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-3"
              >
                <img src="/phone.svg" alt="Audio Call" className="w-5 h-5" />
                Audio Call
              </button>

              <button
                onClick={() => handleCallTypeSelection('video')}
                className="w-full bg-[#F7971E] text-black py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6C3 4.89543 3.89543 4 5 4H12C13.1046 4 14 4.89543 14 6V18C14 19.1046 13.1046 20 12 20H5C3.89543 20 3 19.1046 3 18V6Z" fill="currentColor" />
                  <path d="M14 8.5L19 6V18L14 15.5V8.5Z" fill="currentColor" />
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
  );
};

export default AstrologerCarousel;