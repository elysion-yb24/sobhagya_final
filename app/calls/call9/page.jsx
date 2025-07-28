"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

// Remove the import of the full login page - we'll handle navigation differently 

export default function Call9() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [isExiting, setIsExiting] = useState(false);

  const challengeOptions = [
    "Love & Marriage",
    "Career & Business",
    "Financial Problem",
    "Family & Children",
    "Kundli & Dosha Solutions",
    "Health Concerns",
  ];

  const handleToggleChallenge = (challenge) => {
    setSelectedChallenges((prevSelected) => {
      if (prevSelected.includes(challenge)) {
        return prevSelected.filter((item) => item !== challenge);
      } else {
        return [...prevSelected, challenge];
      }
    });
  };

  // Check for astrologer ID from query params or localStorage
  useEffect(() => {
    const astrologerId = searchParams.get('astrologerId');
    if (astrologerId) {
      console.log('Call9: Found astrologer ID in query params:', astrologerId);
      localStorage.setItem('selectedAstrologerId', astrologerId);
    } else {
      // Check localStorage as fallback
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      if (storedAstrologerId) {
        console.log('Call9: Found stored astrologer ID:', storedAstrologerId);
      } else {
        console.log('Call9: No astrologer ID found');
      }
    }
  }, [searchParams]);

  const handleNext = () => {
    if (selectedChallenges.length > 0) {
      // Store selected challenges in sessionStorage for later use
      sessionStorage.setItem('selectedChallenges', JSON.stringify(selectedChallenges));
      
      // Log the astrologer ID that will be used after login
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      if (storedAstrologerId) {
        console.log('Call9: Astrologer ID will be used after login:', storedAstrologerId);
      }
      
      // Navigate to the login page instead of opening a modal
      setIsExiting(true);
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/50 to-white"></div>
      {/* Subtle Astrology Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-20 w-16 h-16 bg-orange-300 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-orange-200 rounded-full blur-md"></div>
      </div>

      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call9-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            {/* Premium Card Container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl px-6 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-10 md:py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200/50 flex flex-col relative overflow-hidden"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl"></div>
            {/* Title */}
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-bold text-center text-gray-800 mb-8 sm:mb-10 text-2xl sm:text-3xl md:text-4xl relative z-10"
              >
              Enter Your Details
              </motion.h1>
              {/* Enhanced Progress Bar */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mb-10 flex items-center"
              >
                <div className="h-2 bg-gray-200 w-full rounded-full shadow-inner">
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  ></motion.div>
              </div>
                <div className="flex justify-between absolute w-full top-1 transform -translate-y-1/2">
                {[...Array(7)].map((_, index) => (
                    <motion.div
                    key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className={`w-3 h-3 rounded-full shadow-sm bg-orange-500`}
                    ></motion.div>
                ))}
              </div>
              </motion.div>
              <form className="flex flex-col flex-grow items-center justify-center relative z-10">
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-lg sm:text-xl md:text-2xl font-semibold text-center text-gray-700 mb-8"
                >
                  What Life Challenge Are You Facing?
                </motion.h2>
                {/* Challenge Pills - Responsive Grid */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10 w-full"
                >
                  {challengeOptions.map((challenge, index) => (
                    <motion.button
                      key={challenge}
                      type="button"
                      onClick={() => handleToggleChallenge(challenge)}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm md:text-base font-medium shadow-sm hover:shadow-md w-full ${
                          selectedChallenges.includes(challenge)
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 scale-105 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        }`}
                    >
                      {challenge}
                    </motion.button>
                  ))}
                </motion.div>
                {/* Enhanced Next Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="flex justify-center w-full"
                >
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={selectedChallenges.length === 0}
                    className={`w-full sm:w-72 px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                      selectedChallenges.length > 0
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-105 active:scale-95"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                   Proceed to Login
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}