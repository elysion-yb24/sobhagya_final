'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '@/app/config/api';
import { isAuthenticated } from '@/app/utils/auth-utils';
import { getSampleAstrologersResponse } from '@/app/data/sampleAstrologers';

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
          // Filter astrologers: show all online, but limit offline to 3
          const onlineAstrologers = data.data.list.filter((astrologer: Astrologer) => astrologer.status === "online");
          const offlineAstrologers = data.data.list.filter((astrologer: Astrologer) => astrologer.status === "offline").slice(0, 3);
          const otherAstrologers = data.data.list.filter((astrologer: Astrologer) => astrologer.status !== "online" && astrologer.status !== "offline");
          
          setAstrologers([...onlineAstrologers, ...offlineAstrologers, ...otherAstrologers]);
        } else {
          console.warn('API response format unexpected:', data);
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('API failed, using sample data:', error);
        
        // Use sample data when API fails
        try {
          const sampleResponse = getSampleAstrologersResponse(0, 10);
          const sampleAstrologers = sampleResponse.data.list;
          
          // Convert sample data to match the expected format
          const formattedAstrologers = sampleAstrologers.map((astrologer: any) => ({
            ...astrologer,
            avatar: astrologer.profileImage,
            status: astrologer.isOnline ? "online" : "offline",
            talksAbout: astrologer.specializations,
            rating: {
              avg: astrologer.rating,
              count: astrologer.totalReviews
            },
            calls: astrologer.totalReviews || 0,
            callMinutes: astrologer.totalReviews * 10 || 0,
            rpm: astrologer.audioRpm || 0
          }));
          
          setAstrologers(formattedAstrologers);
          setHasError(false); // Clear error since we have sample data
        } catch (sampleErr) {
          console.error('Sample data also failed:', sampleErr);
          setHasError(true);
          setAstrologers([]);
        }
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

  // Auto-play functionality
  useEffect(() => {
    if (astrologers.length === 0) return;

    const interval = setInterval(() => {
      const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
      const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
      
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
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [astrologers.length]);

  // Handle astrologer card click
  const handleAstrologerClick = (astrologerId: string) => {
    // Go to the dedicated ConsultAstrologer profile page
    router.push(`/consult-astrologer/profile/${astrologerId}`);
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

  // Don't render anything if there's an error
  if (hasError) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full py-12 relative" style={{
        backgroundImage: "url('/consult-home.gif')",
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
      className="w-full py-12 relative"
      style={{
        backgroundImage: "url('/consult-home.gif')",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-center text-white text-5xl md:text-4xl font-bold mb-10"
          style={{ fontFamily: "EB Garamond" }}
        >
          Consult with <em>India's</em> best Astrologers
        </h2>
      </div>

      {/* Slider container with arrows inside */}
      <div className="relative max-w-6xl mx-auto px-4">
        {/* Previous button - positioned inside */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Previous astrologer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Slider track - responsive card display */}
        <div className="flex justify-center gap-4 px-8 sm:px-12">
          {/* Small screens: Show 1 card */}
          <div className="block md:hidden">
            {astrologers.slice(currentIndex, currentIndex + 1).map((astrologer, index) => (
              <div
                key={astrologer._id}
                className="flex-shrink-0"
              >
                <div
                  className="bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 w-[280px]"
                  onClick={() => handleAstrologerClick(astrologer._id)}
                >
                  {/* Profile Picture */}
                  <div className="mb-3">
                    <img
                      src={
                        (astrologer.avatar && astrologer.avatar.startsWith('http'))
                          ? astrologer.avatar
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=FF6B35&color=fff&size=120`
                      }
                      alt={astrologer.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2"
                      style={{
                        borderColor: astrologer.status === "online" 
                          ? "#399932" 
                          : astrologer.status === "offline" 
                          ? "#EF4444" 
                          : "#F7971E"
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=FF6B35&color=fff&size=120`;
                      }}
                    />
                  </div>
                  
                  {/* Name */}
                  <div className="mb-0.5 h-6 flex items-center justify-center overflow-hidden relative">
                    <h3 
                      className={`font-semibold text-gray-900 whitespace-nowrap ${astrologer.name.length > 15 ? 'scrolling-text' : ''}`}
                      style={{ 
                        fontFamily: "Poppins", 
                        fontSize: "18px"
                      }}
                    >
                      {astrologer.name}
                    </h3>
                  </div>
                  
                  {/* Language */}
                  <p className="text-gray-600 mb-0.5" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    {(astrologer.languages || []).join(", ") || "Hindi"}
                  </p>
                  
                  {/* Expertise */}
                  <p className="text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    {astrologer.talksAbout?.join(", ") || "Kp, Vedic, Vastu"}
                  </p>
                  
                  {/* Experience */}
                  <p className="text-gray-600 mb-2" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    Exp:- {Math.floor(astrologer.callMinutes / 60)}years
                  </p>
                  
                  {/* Call Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => handleCallClick(astrologer, e)}
                      className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                    >
                      OFFER: FREE 1st call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablets: Show 2 cards */}
          <div className="hidden md:flex lg:hidden gap-4">
            {astrologers.slice(currentIndex, currentIndex + 2).map((astrologer, index) => (
              <div
                key={astrologer._id}
                className="flex-shrink-0"
              >
                <div
                  className="bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 w-[240px]"
                  onClick={() => handleAstrologerClick(astrologer._id)}
                >
                  {/* Profile Picture */}
                  <div className="mb-3">
                    <img
                      src={
                        (astrologer.avatar && astrologer.avatar.startsWith('http'))
                          ? astrologer.avatar
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=FF6B35&color=fff&size=120`
                      }
                      alt={astrologer.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2"
                      style={{
                        borderColor: astrologer.status === "online" 
                          ? "#399932" 
                          : astrologer.status === "offline" 
                          ? "#EF4444" 
                          : "#F7971E"
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=FF6B35&color=fff&size=120`;
                      }}
                    />
                  </div>
                  
                  {/* Name */}
                  <div className="mb-0.5 h-6 flex items-center justify-center overflow-hidden relative">
                    <h3 
                      className={`font-semibold text-gray-900 whitespace-nowrap ${astrologer.name.length > 15 ? 'scrolling-text' : ''}`}
                      style={{ 
                        fontFamily: "Poppins", 
                        fontSize: "18px"
                      }}
                    >
                      {astrologer.name}
                    </h3>
                  </div>
                  
                  {/* Language */}
                  <p className="text-gray-600 mb-0.5" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    {(astrologer.languages || []).join(", ") || "Hindi"}
                  </p>
                  
                  {/* Expertise */}
                  <p className="text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    {astrologer.talksAbout?.join(", ") || "Kp, Vedic, Vastu"}
                  </p>
                  
                  {/* Experience */}
                  <p className="text-gray-600 mb-2" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    Exp:- {Math.floor(astrologer.callMinutes / 60)}years
                  </p>
                  
                  {/* Call Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => handleCallClick(astrologer, e)}
                      className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                    >
                      OFFER: FREE 1st call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Show 4 cards */}
          <div className="hidden lg:flex gap-4">
            {astrologers.slice(currentIndex, currentIndex + 4).map((astrologer, index) => (
              <div
                key={astrologer._id}
                className="flex-shrink-0"
              >
                <div
                  className="bg-white rounded-lg border border-[#F7971E] p-3 text-center cursor-pointer hover:shadow-lg transition-all duration-200 w-[221px]"
                  onClick={() => handleAstrologerClick(astrologer._id)}
                >
                  {/* Profile Picture */}
                  <div className="mb-3">
                    <div 
                      className="relative w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center mx-auto"
                      style={{
                        borderColor: astrologer.status === "online" 
                          ? "#399932" 
                          : astrologer.status === "offline" 
                          ? "#EF4444" 
                          : "#F7971E"
                      }}
                    >
                      <Image
                        src={
                          astrologer.avatar && astrologer.avatar.startsWith('http')
                            ? astrologer.avatar
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                astrologer.name
                              )}&background=FF6B35&color=fff&size=120`
                        }
                        alt={astrologer.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            astrologer.name
                          )}&background=FF6B35&color=fff&size=120`;
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "Poppins", fontSize: "18px" }}>
                    {astrologer.name.split(' ').length > 2
                      ? `${astrologer.name.split(' ')[0]} ${astrologer.name.split(' ').slice(-1)[0]}`
                      : astrologer.name
                    }
                  </h3>
                  
                  {/* Language */}
                  <p className="text-gray-600 mb-0.5" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    Hindi
                  </p>
                  
                  {/* Expertise */}
                  <p className="text-gray-600 mb-0.5 line-clamp-2 h-8 flex items-center justify-center text-center" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    {astrologer.talksAbout?.slice(0, 3).join(", ") || "Kp, Vedic, Vastu"}
                  </p>
                  
                  {/* Experience */}
                  <p className="text-gray-600 mb-2" style={{ fontFamily: "Poppins", fontSize: "10px" }}>
                    Exp:- {Math.floor(astrologer.callMinutes / 60)}years
                  </p>
                  
                  {/* Call Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => handleCallClick(astrologer, e)}
                      className="w-[171px] h-[30px] bg-[#F7971E] text-white text-[10px] font-medium hover:bg-orange-600 transition-colors uppercase flex items-center justify-center rounded-md"
                    >
                      OFFER: FREE 1st call
                    </button>
                  </div>
                </div>
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

      {/* Dots indicator - dynamic based on scrollable cards */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="hidden md:flex justify-center mt-10 space-x-1">
            {Array.from({ length: Math.max(0, astrologers.length - 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
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
  );
};

export default AstrologerCarousel;