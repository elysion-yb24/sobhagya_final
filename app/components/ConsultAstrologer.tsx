'use client'
import React, { useState, useEffect } from 'react';

const AstrologerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);

  
  const astrologers = [
    {
      id: 1,
      name: "Pt. Shashtri Ji",
      expertise: "KP, Vedic, Vastu",
      experience: "Exp: 7 years",
      image: "./image (11).png"
    },
    {
      id: 2,
      name: "Sahil Mehta",
      expertise: "Tarot reading, Pranic healing",
      experience: "Exp: 2 years",
      image: "./Sahil-Mehta.png"
    },
    {
      id: 3,
      name: "Acharaya Ravi",
      expertise: "Vedic, vastu",
      experience: "Exp: 5 years",
      image: "./Acharya-Ravi.png"
    },
    {
      id: 4,
      name: "Naresh",
      expertise: "Tarot reading, Vedic, KP, Psychics",
      experience: "Exp: 2 years",
      image: "Naresh.png"
    },
    
  ];


  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= astrologers.length - visibleCards ? 0 : prevIndex + 1
    );
  };


  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? astrologers.length - visibleCards : prevIndex - 1
    );
  };

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(3);
      } else {
        setVisibleCards(4);
      }
    };
    
    
    handleResize();
    
    
    window.addEventListener('resize', handleResize);
    
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full py-12 relative" style={{
      backgroundImage: "url('./image.png')",
    }}>
        <div className="absolute top-0 left-0 w-40 h-40 opacity-20">
        <img 
          src="./Group 13362.png" 
          alt="" 
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
      
      
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-20">
        <img 
          src="./Group 13362 (1).png" 
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
        
        {/* Carousel container */}
        <div className="relative overflow-hidden ">
          {/* Previous button */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-[4px] w-10 h-10 flex items-center justify-center shadow-md"
            aria-label="Previous astrologer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-4"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              width: `${astrologers.length * (100 / visibleCards)}%`
            }}
          >
            {astrologers.map((astrologer) => (
              <div 
                key={astrologer.id} 
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / astrologers.length}%` }}
              >
                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-orange-300  mb-3">
                    <img
                      src={astrologer.image}
                      alt={astrologer.name}
                      className="w-full h-100 object-cover "
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-center">{astrologer.name}</h3>
                  <p className="text-center text-sm text-[#373737] mt-1">{astrologer.expertise}</p>
                  <p className="text-center text-sm text-[#373737] mt-1">{astrologer.experience}</p>
                  <button className="mt-3 bg-[#F7971E] text-black rounded px-1 py-1 text-sm font-medium w-[171px]">
                    OFFER: FREE 1st call
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            aria-label="Next astrologer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AstrologerCarousel;