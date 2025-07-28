"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call5() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [knowBirthTime, setKnowBirthTime] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  // Check for astrologer ID from query params or localStorage
  useEffect(() => {
    const astrologerId = searchParams.get('astrologerId');
    if (astrologerId) {
      console.log('Call5: Found astrologer ID in query params:', astrologerId);
      localStorage.setItem('selectedAstrologerId', astrologerId);
    } else {
      // Check localStorage as fallback
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      if (storedAstrologerId) {
        console.log('Call5: Found stored astrologer ID:', storedAstrologerId);
      } else {
        console.log('Call5: No astrologer ID found');
      }
    }
  }, [searchParams]);

  const handleOptionChange = (option) => {
    setKnowBirthTime(option);
  };

  const handleNext = () => {
    if (knowBirthTime !== null) {
      setIsExiting(true);
      setTimeout(() => {
        // Check if we have a stored astrologer ID and pass it to the next step
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        if (storedAstrologerId) {
          console.log('Call5: Passing astrologer ID to next step:', storedAstrologerId);
          if (knowBirthTime === "yes") {
            router.push(`/calls/call6?astrologerId=${storedAstrologerId}`);
          } else {
            router.push(`/calls/call7?astrologerId=${storedAstrologerId}`);
          }
        } else {
          if (knowBirthTime === "yes") {
            router.push("/calls/call6");
          } else {
            router.push("/calls/call7");
          }
        }
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
            key="call5-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Premium Card Container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 
                         px-6 sm:px-8 md:px-10 lg:px-12 
                         py-8 sm:py-10 md:py-12
                         bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200/50 
                         flex flex-col relative overflow-hidden"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl"></div>
              
            {/* Title */}
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-bold text-center text-gray-800 
                          mb-8 sm:mb-10 
                          text-2xl sm:text-3xl md:text-4xl
                          relative z-10"
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
                    animate={{ width: "57.1%" }}
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
                      className={`w-3 h-3 rounded-full shadow-sm ${
                        index < 4 ? "bg-orange-500" : "bg-gray-300"
                    }`}
                    ></motion.div>
                ))}
              </div>
              </motion.div>

              <form className="flex flex-col flex-grow items-center justify-center relative z-10">
                <motion.h2 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-2xl sm:text-3xl font-semibold text-center text-gray-700 mb-12"
                >
                Do you know your time of Birth?
                </motion.h2>

                {/* Enhanced Radio Buttons */}
                <div className="flex flex-wrap justify-center gap-16 mb-12">
                  {["yes", "no"].map((option, index) => (
                    <motion.label
                      key={option}
                      initial={{ x: index === 0 ? -20 : 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      className="flex items-center cursor-pointer group"
                    >
                  <input
                    type="radio"
                    className="hidden"
                    name="birthTime"
                        value={option}
                        checked={knowBirthTime === option}
                        onChange={() => handleOptionChange(option)}
                  />
                  <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm ${
                          knowBirthTime === option
                            ? "border-orange-500 scale-110 shadow-md"
                            : "border-gray-400 group-hover:border-orange-300"
                    }`}
                  >
                        {knowBirthTime === option && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-orange-500"
                          ></motion.div>
                    )}
                  </div>
                      <span className="text-lg sm:text-xl font-medium text-gray-700 ml-4 group-hover:text-orange-600 transition-colors capitalize">
                        {option}
                      </span>
                    </motion.label>
                  ))}
              </div>

                {/* Enhanced Note Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="flex justify-center mb-12"
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 max-w-2xl">
                    <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed">
                      <span className="font-semibold text-orange-600">Note:</span> Accurate predictions are possible even without birth time—astrology can
                  reveal up to 80% of your life's key insights and guidance.
                </p>
              </div>
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
                  disabled={knowBirthTime === null}
                    className={`w-full sm:w-72 px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                    knowBirthTime !== null
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-105 active:scale-95"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
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