"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call1() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get astrologer ID from query parameters
  const astrologerId = searchParams.get('astrologerId');
  
  // Store astrologer ID in localStorage for use in subsequent call flow steps
  useEffect(() => {
    if (astrologerId) {
      localStorage.setItem('selectedAstrologerId', astrologerId);
      console.log('Stored astrologer ID for call flow:', astrologerId);
    }
    
    // Check if we're coming from astrologers page (callSource is 'astrologerCard')
    const callSource = localStorage.getItem('callSource');
    if (callSource === 'astrologerCard') {
      console.log('Coming from astrologers page, bypassing call form');
      // Clear the call source to prevent future bypasses
      localStorage.removeItem('callSource');
      // Redirect to login page
      router.push('/login');
      return;
    }
  }, [astrologerId, router]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call2");
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call1-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] min-h-[400px] sm:h-[450px] md:h-[500px] bg-[#FCF4E9] rounded-lg p-4 sm:p-6 md:p-8 shadow-lg"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Title */}
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-medium font-['Poppins'] text-center text-gray-800 text-xl sm:text-2xl mb-4 sm:mb-6 md:mb-8 mt-[20px] sm:mt-[30px] md:mt-[50px]"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-6 sm:mb-8 md:mb-10"
            >
              <div className="h-1 bg-gray-300 w-full rounded-full">
                <motion.div 
                  className="h-1 bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "12.5%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>

              <div className="flex justify-between absolute w-full top-0 transform -translate-y-1/2">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      index === 0 ? "bg-[#F7971D]" : "bg-gray-300"
                    }`}
                  ></motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Question */}
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-6 sm:mb-8 md:mb-10 mt-8 sm:mt-12 md:mt-16 px-2"
            >
              Who Are You Seeking Guidance For?
            </motion.h2>

            {/* Radio Button Options */}
            <div className="flex justify-center gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-12 md:mb-16 mt-4 sm:mt-6 md:mt-8">
              {["myself", "someone_else"].map((option, index) => (
                <motion.label
                  key={option}
                  initial={{ x: index === 0 ? -20 : 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="guidance"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => handleOptionChange(option)}
                  />
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedOption === option
                        ? "border-[#F7971D]"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedOption === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F7971D]"
                      ></motion.div>
                    )}
                  </div>
                  <span className="text-base sm:text-lg font-medium text-gray-700 ml-3 sm:ml-4">
                    {option === "myself" ? "Myself" : "Someone Else"}
                  </span>
                </motion.label>
              ))}
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedOption}
                className={`w-[185px] h-[62px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${
                  selectedOption
                    ? "bg-[#F7971D] hover:bg-[#E88A1A]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
