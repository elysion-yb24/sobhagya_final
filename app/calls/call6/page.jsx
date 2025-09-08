"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Call6() {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'hour', 'minute', or null
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call6: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call6: No stored astrologer ID found');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleNext = () => {
    if (hour && minute) {
      // Combine hour and minute into time format
      const timeOfBirth = `${hour}:${minute}`;
      // Store the time of birth in localStorage for the next step
      localStorage.setItem('userTimeOfBirth', timeOfBirth);
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call7");
      }, 100);
    }
  };

  const handleBack = () => {
    router.push("/calls/call5");
  };

  const toggleDropdown = (dropdownType) => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };

  const selectOption = (dropdownType, value) => {
    if (dropdownType === 'hour') setHour(value);
    if (dropdownType === 'minute') setMinute(value);
    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call6-card"
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

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-10 sm:mb-12 w-[70%] mx-auto"
            >
              <div className="h-[1px] bg-gray-300 w-[110%] -ml-[5%] rounded-full relative">
                <motion.div
                  className="h-[1px] bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              <div className="flex justify-between absolute w-full left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${index < 6 ? "bg-[#F7971D]" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Question */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-6 sm:mb-8 mt-6 sm:mt-8 px-2"
            >
              What is your time of birth?
            </motion.h2>

            {/* Time Input Blocks */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 md:mb-20 mt-6 sm:mt-8"
            >
              {/* Hour Dropdown */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown('hour')}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${
                    hour ? 'border-[#F7971D] text-gray-700' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <span>{hour || 'Hour'}</span>
                  {openDropdown === 'hour' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'hour' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                    >
                      {[...Array(24)].map((_, i) => (
                        <button
                          key={`hour-${i}`}
                          onClick={() => selectOption('hour', i.toString().padStart(2, '0'))}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {i.toString().padStart(2, '0')}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Separator */}
              <div className="flex items-center text-2xl font-bold text-gray-400">
                :
              </div>

              {/* Minute Dropdown */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown('minute')}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${
                    minute ? 'border-[#F7971D] text-gray-700' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <span>{minute || 'Minute'}</span>
                  {openDropdown === 'minute' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'minute' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                    >
                      {[...Array(60)].map((_, i) => (
                        <button
                          key={`minute-${i}`}
                          onClick={() => selectOption('minute', i.toString().padStart(2, '0'))}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {i.toString().padStart(2, '0')}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Next Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center mt-2 sm:mt-4"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!hour || !minute}
                className={`w-[185px] h-[62px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${
                  hour && minute
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
