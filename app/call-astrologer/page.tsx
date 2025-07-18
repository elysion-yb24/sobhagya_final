"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";


// End call icon
const EndCallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
    <line x1="23" y1="1" x2="1" y2="23"></line>
  </svg>
);

export default function CallAstrologerPage() {
  const router = useRouter();
  // Use default values for server-side rendering
  const [radius, setRadius] = useState(80);
  const [circumference, setCircumference] = useState(2 * Math.PI * 80);
  
  // Handle responsive timer sizing - only runs on client
  useEffect(() => {
    // This code only runs in the browser
    const handleResize = () => {
      let newRadius;
      
      // Adjust radius based on screen width
      if (window.innerWidth < 640) { // Mobile
        newRadius = 60;
      } else if (window.innerWidth < 1024) { // Tablet
        newRadius = 70;
      } else { // Desktop
        newRadius = 80;
      }
      
      setRadius(newRadius);
      setCircumference(2 * Math.PI * newRadius);
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchParams = useSearchParams();
  const astrologerId = searchParams?.get("id") || "ASTRO_001";
  const astrologerName = searchParams?.get("astrologer") || "Astrologer";
  

  // Generate a random experience value between 5-15 years
  const experience = Math.floor(Math.random() * 10) + 5;
  
  // Call states
  const [timeLeft, setTimeLeft] = useState(120);
  const [offset, setOffset] = useState(0);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, active, ended
  
  // Connection animation
  const [connectionDots, setConnectionDots] = useState(".");
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setConnectionDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 500);
    
    // Simulate connection established after 2 seconds
    const connectionTimer = setTimeout(() => {
      setCallStatus("active");
      clearInterval(dotInterval);
    }, 2000);
    
    return () => {
      clearInterval(dotInterval);
      clearTimeout(connectionTimer);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (callStatus !== "ended") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCallStatus("ended");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callStatus]);

  // Circle animation effect
  useEffect(() => {
    const fraction = timeLeft / 120;
    const newOffset = circumference * (1 - fraction);
    setOffset(newOffset);
  }, [timeLeft, circumference]);

  // Time formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Rating state
  const [selectedRating, setSelectedRating] = useState(0);
  
  // Handle end call
  const handleEndCall = () => {
    setCallStatus("ended");
    // You could add navigation or other effects here
  };
  
  // Handle star rating
  const handleRatingSelect = (rating: React.SetStateAction<number>) => {
    setSelectedRating(rating);
  };
  
  // Handle submit rating
  const handleSubmitRating = () => {
    // Here you would typically submit the rating to your backend
    if (typeof window !== 'undefined') {
      // Show brief feedback message (optional)
      alert(`Rating of ${selectedRating} stars submitted successfully!`);
      
      // Redirect to astrologers page
      router.push('/astrologers');
    }
  };
  
  // Handle go back
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      // Redirect to astrologers page
      router.push('/astrologers');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white p-4">
      {/* Card container - responsive width for different screen sizes */}
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg text-center">
        
        {/* Status bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm font-medium text-gray-700 order-2 sm:order-1">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 sm:mr-2 ${callStatus === "active" ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}></span>
            {callStatus === "connecting" ? `Connecting${connectionDots}` : 
             callStatus === "active" ? "Call in progress" : "Call ended"}
          </div>
          <div className="bg-orange-50 text-orange-600 px-2 sm:px-3 py-1 rounded-full text-xs font-medium order-1 sm:order-2 w-full sm:w-auto">
            Balance: 120 mins
          </div>
        </div>
        
        {/* Astrologer info */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="relative inline-block">
            {/* Astrologer avatar with pulsing border during connecting state */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-2 mb-2 sm:mb-3 
              ${callStatus === "connecting" ? "border-yellow-400 animate-pulse" : 
                callStatus === "active" ? "border-green-400" : "border-red-400"}`}>
              <img 
                src={"/api/placeholder/100/100"} 
                alt={astrologerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologerName)}&background=random`;
                }}
              />
            </div>
            
            {/* Online indicator */}
            {callStatus === "active" && (
              <div className="absolute bottom-2 sm:bottom-3 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
            {astrologerName}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mb-1">
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 rounded-full text-orange-600 text-xs">
              Vedic Astrologer
            </div>
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 rounded-full text-purple-600 text-xs">
              {experience} Yrs Exp
            </div>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            Hindi, English
          </p>
        </div>
        
        {/* Circular timer - responsive sizing */}
        <div className="relative flex justify-center items-center w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto my-4 sm:my-6 md:my-8">
          {/* Light glow behind timer */}
          <div className="absolute inset-0 bg-orange-100 rounded-full opacity-50 filter blur-md"></div>
          
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Background track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#f1f5f9" /* slate-100 */
              strokeWidth={12}
              fill="transparent"
            />
            
            {/* Timer progress */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#f97316" /* orange-500 */
              strokeWidth={12}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Central content */}
          <div className="flex flex-col items-center z-10">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1">{formattedTime}</span>
            <span className="text-xs sm:text-sm text-gray-500">
              {callStatus === "active" ? "Time Remaining" : 
               callStatus === "connecting" ? "Connecting..." : "Call Ended"}
            </span>
          </div>
        </div>
        
        {/* End call button */}
        <button
          onClick={handleEndCall}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-transform transform hover:scale-105"
        >
          <EndCallIcon />
          <span>End Call</span>
        </button>
        
        {/* Call rating - shown when call ends */}
        {callStatus === "ended" && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
            <h3 className="text-gray-800 text-sm sm:text-base font-medium mb-2">Rate your experience</h3>
            <div className="flex justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  className={`text-xl sm:text-2xl ${selectedRating >= star ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none transition-colors`}
                  onClick={() => handleRatingSelect(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <button 
              onClick={selectedRating > 0 ? handleSubmitRating : () => typeof window !== 'undefined' && window.history.back()}
              className={`w-full ${selectedRating > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'} py-1.5 sm:py-2 rounded-lg text-white text-sm sm:text-base font-medium transition-colors`}
            >
              {selectedRating > 0 ? 'Submit' : 'Go Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}