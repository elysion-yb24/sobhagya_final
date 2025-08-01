'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/app/config/api';
import { isAuthenticated } from '@/app/utils/auth-utils';

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
}

const AstrologerCarousel = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

 
  // Test API accessibility
  

  // Fetch astrologers from API
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        setLoading(true);
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
          setAstrologers(data.data.list);
        } else {
          console.warn('API response format unexpected:', data);
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Error fetching astrologers:', error);
        // Fallback to static data if API fails
        setAstrologers([
          {
            _id: "1",
            name: "Pt. Shashtri Ji",
            avatar: "/image (11).png",
            talksAbout: ["KP", "Vedic", "Vastu"],
            rating: { avg: 4.5, count: 10 },
            calls: 50,
            callMinutes: 1200,
            rpm: 20,
            status: "online",
            isLive: false
          },
          {
            _id: "2",
            name: "Sahil Mehta",
            avatar: "/Sahil-Mehta.png",
            talksAbout: ["Tarot reading", "Pranic healing"],
            rating: { avg: 4.8, count: 15 },
            calls: 75,
            callMinutes: 1800,
            rpm: 25,
            status: "online",
            isLive: false
          },
          {
            _id: "3",
            name: "Acharaya Ravi",
            avatar: "/Acharya-Ravi.png",
            talksAbout: ["Vedic", "Vastu"],
            rating: { avg: 4.6, count: 12 },
            calls: 60,
            callMinutes: 1500,
            rpm: 22,
            status: "online",
            isLive: false
          },
          {
            _id: "4",
            name: "Naresh",
            avatar: "/Naresh.png",
            talksAbout: ["Tarot reading", "Vedic", "KP", "Psychics"],
            rating: { avg: 4.7, count: 18 },
            calls: 80,
            callMinutes: 2000,
            rpm: 28,
            status: "online",
            isLive: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAstrologers();
  }, []);

  const nextSlide = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const maxIndex = isMobile ? astrologers.length - 1 : Math.max(0, astrologers.length - 4);
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const maxIndex = isMobile ? astrologers.length - 1 : Math.max(0, astrologers.length - 4);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
  };

  // Auto-play functionality
  useEffect(() => {
    if (astrologers.length === 0) return;
    
    const interval = setInterval(() => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const maxIndex = isMobile ? astrologers.length - 1 : Math.max(0, astrologers.length - 4);
      setCurrentIndex((prevIndex) => 
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [astrologers.length]);

  // Handle astrologer card click
  const handleAstrologerClick = (astrologerId: string) => {
    // Check if user is authenticated
    const isAuthValid = isAuthenticated();
    
    if (isAuthValid) {
      // If authenticated, go directly to astrologer profile
      router.push(`/astrologers/${astrologerId}`);
    } else {
      // If not authenticated, go to call flow with astrologer ID
      router.push(`/calls/call1?astrologerId=${astrologerId}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12 relative" style={{
        backgroundImage: "url('/image.png')",
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-white text-5xl md:text-4xl font-bold mb-10" style={{
            fontFamily:'EB Garamond',
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
      className="w-full py-12"
        style={{
          backgroundImage: "url('/image.png')",
          position: "relative",
        }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-center text-white text-5xl md:text-4xl font-bold mb-10"
          style={{ fontFamily: "EB Garamond" }}
        >
          Consult with <em>India's</em> best Astrologers
        </h2>
        
        {/* Slider container */}
        <div className="relative overflow-hidden">
          {/* Previous button */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Previous astrologer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Slider track */}
          <div className="flex transition-transform duration-300 ease-out">
            {astrologers.map((astrologer, index) => (
              <div 
                key={astrologer._id} 
                className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-1 md:px-2"
                style={{ 
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 300ms ease-out'
                }}
              >
                <div 
                  className="bg-white rounded-lg shadow-lg flex flex-col items-center w-56 h-64 p-4 mx-auto border-2 border-[#F7971E] cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleAstrologerClick(astrologer._id)}
                  style={{ minHeight: '256px' }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#F7971E] mb-3 shadow-md flex items-center justify-center" style={{ borderRadius: '50%' }}>
                    <img
                      src={astrologer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=f97316&color=fff&size=96`}
                      alt={astrologer.name}
                      className="w-full h-full object-cover rounded-full"
                      style={{ borderRadius: '50%' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=f97316&color=fff&size=96`;
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-base text-center text-gray-800 mb-2 truncate max-w-full" style={{ fontFamily: "Poppins" }}>
                    {astrologer.name.split(' ').length > 2 
                      ? `${astrologer.name.split(' ')[0]} ${astrologer.name.split(' ').slice(-1)[0]}`
                      : astrologer.name
                    }
                  </h3>
                  <p className="text-center text-sm text-gray-600 mb-2 truncate max-w-full" style={{ fontFamily: "Poppins" }}>
                    {astrologer.talksAbout?.slice(0, 2).join(", ") || "Astrology Expert"}
                  </p>
                  <p className="text-center text-xs text-gray-500 mb-4 truncate max-w-full" style={{ fontFamily: "Poppins" }}>
                    Exp: {Math.floor(astrologer.callMinutes / 60)} hours
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAstrologerClick(astrologer._id);
                    }}
                    className="bg-[#F7971E] hover:bg-[#F7971E] text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-200 mt-auto cursor-pointer"
                    style={{ fontFamily: "Poppins" }}
                  >
                    OFFER: FREE 1st call
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Next button */}
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Next astrologer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Dots indicator - only show on mobile */}
          <div className="flex justify-center mt-4 md:hidden space-x-2">
            {astrologers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstrologerCarousel;