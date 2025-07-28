'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const AstrologerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  
  const astrologers = [
    {
      id: 1,
      name: "Pt. Shashtri Ji",
      expertise: "KP, Vedic, Vastu",
      experience: "Exp: 7 years",
      image: "/image (11).png"
    },
    {
      id: 2,
      name: "Sahil Mehta",
      expertise: "Tarot reading, Pranic healing",
      experience: "Exp: 2 years",
      image: "/Sahil-Mehta.png"
    },
    {
      id: 3,
      name: "Acharaya Ravi",
      expertise: "Vedic, vastu",
      experience: "Exp: 5 years",
      image: "/Acharya-Ravi.png"
    },
    {
      id: 4,
      name: "Naresh",
      expertise: "Tarot reading, Vedic, KP, Psychics",
      experience: "Exp: 2 years",
      image: "/Naresh.png"
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= astrologers.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? astrologers.length - 1 : prevIndex - 1
    );
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= astrologers.length - 1 ? 0 : prevIndex + 1
      );
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [astrologers.length]);

  return (
    <div className="w-full py-12 relative" style={{
      backgroundImage: "url('/image.png')",
    }}>
        <div className="absolute top-0 left-0 w-40 h-40 opacity-20">
        <img 
          src="/Group 13362.png" 
          alt="" 
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
      
      
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-20">
        <img 
          src="/Group 13362 (1).png" 
          alt="" 
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-white text-5xl md:text-4xl font-bold mb-10" style={{
          fontFamily:'EB Garamond',
        }}>
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
                key={astrologer.id} 
                className="w-full flex-shrink-0 px-4"
                style={{ 
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 300ms ease-out'
                }}
              >
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center max-w-sm mx-auto">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-3 border-orange-300 mb-4 shadow-md">
                    <img
                      src={astrologer.image}
                      alt={astrologer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl text-center text-gray-800 mb-2">{astrologer.name}</h3>
                  <p className="text-center text-sm text-gray-600 mb-1">{astrologer.expertise}</p>
                  <p className="text-center text-sm text-gray-500 mb-4">{astrologer.experience}</p>
                  <Link href="calls/call1" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-2 text-sm font-semibold transition-colors duration-200">
                    OFFER: FREE 1st call
                  </Link>
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
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
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