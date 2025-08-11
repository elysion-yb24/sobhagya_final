"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call5() {
  const [knowBirthTime, setKnowBirthTime] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call5: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call5: No stored astrologer ID found');
    }
  }, []);

  const handleOptionChange = (option) => {
    setKnowBirthTime(option);
  };

  const handleNext = () => {
    if (knowBirthTime !== null) {
      // Store the user's choice in localStorage
      localStorage.setItem('knowBirthTime', knowBirthTime);
      setIsExiting(true);
      setTimeout(() => {
        if (knowBirthTime === "yes") {
          // If they know birth time, go to time input page
          router.push("/calls/call6");
        } else {
          // If they don't know birth time, skip to place of birth
          router.push("/calls/call7");
        }
      }, 100);
    }
  };

  const handleBack = () => {
    router.push("/calls/call4");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call5-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] h-[600px] bg-[#FCF4E9] rounded-lg p-8 shadow-lg"
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
              className="font-medium font-['Poppins'] text-center text-gray-800 text-2xl mb-8 mt-[50px]"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-10"
            >
              <div className="h-1 bg-gray-300 w-full rounded-full">
                <motion.div 
                  className="h-1 bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "62.5%" }}
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
                    className={`w-3 h-3 rounded-full ${
                      index < 5 ? "bg-[#F7971D]" : "bg-gray-300"
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
              className="text-xl font-normal text-center text-[#373737] mb-10 mt-16"
            >
              Do you know your time of Birth ?
            </motion.h2>

            {/* Radio Button Options */}
            <div className="flex justify-center gap-16 mb-12 mt-8">
              {["yes", "no"].map((option, index) => (
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
                    name="birthTime"
                    value={option}
                    checked={knowBirthTime === option}
                    onChange={() => handleOptionChange(option)}
                  />
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      knowBirthTime === option
                        ? "border-[#F7971D]"
                        : "border-gray-400"
                    }`}
                  >
                    {knowBirthTime === option && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-[#F7971D]"
                      ></motion.div>
                    )}
                  </div>
                  <span className="text-lg font-medium text-gray-700 ml-4 capitalize">
                    {option}
                  </span>
                </motion.label>
              ))}
            </div>

            {/* Note Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center mb-12"
            >
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 max-w-2xl">
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  <span className="font-semibold text-orange-600">Note:</span> Accurate predictions are possible even without birth time—astrology can
                  reveal up to 80% of your life's key insights and guidance.
                </p>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex justify-center gap-4"
            >
              <button
                type="button"
                onClick={handleBack}
                className="w-[120px] px-6 py-3 text-[#F7971D] font-semibold rounded-lg border-2 border-[#F7971D] transition-all duration-300 hover:bg-[#F7971D] hover:text-white"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={knowBirthTime === null}
                className={`w-[203px] px-8 py-4 text-white font-semibold rounded-lg h-[72px] text-[25px] transition-all duration-300 ${
                  knowBirthTime !== null
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