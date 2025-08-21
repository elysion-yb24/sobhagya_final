"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call8() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Language options as shown in the design - 12 languages in 3x4 grid
  const languageOptions = [
    "Hindi", "English", "Telugu", "Marathi",
    "Tamil", "Gujarati", "Urdu", "Punjabi", 
    "Malayalam", "Kannada", "Bengali", "Odia"
  ];

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call8: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call8: No stored astrologer ID found');
    }
  }, []);

  const handleLanguageToggle = (language) => {
    console.log('Toggling language:', language);
    setSelectedLanguages(prev => {
      const newSelection = prev.includes(language) 
        ? prev.filter(lang => lang !== language)
        : [...prev, language];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleNext = () => {
    console.log('Next clicked, selected languages:', selectedLanguages);
    if (selectedLanguages.length > 0) {
      // Store the selected languages in localStorage for the next step
      localStorage.setItem('userLanguages', JSON.stringify(selectedLanguages));
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call9");
      }, 100);
    } else {
      console.log('No languages selected, cannot proceed');
    }
  };

  const handleBack = () => {
    router.push("/calls/call7");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call8-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] min-h-[500px] sm:h-[550px] md:h-[600px] bg-[#FCF4E9] rounded-lg p-4 sm:p-6 md:p-8 shadow-lg flex flex-col"
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
              className="font-semibold font-['Poppins'] text-center text-gray-800 text-xl sm:text-2xl mb-3 sm:mb-5 md:mb-6 mt-2 sm:mt-3 md:mt-4"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-5 sm:mb-7"
            >
              <div className="h-1 bg-gray-300 w-full rounded-full">
                <motion.div
                  className="h-1 bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
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
                      index < 8 ? "bg-[#F7971D]" : "bg-gray-300"
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
              className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-5 sm:mb-6 mt-4 sm:mt-6 px-2"
            >
              Select your Language
            </motion.h2>

            {/* Language Selection Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-4 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 mb-8 sm:mb-10 mt-2 sm:mt-4 max-w-3xl mx-auto px-4 sm:px-0 flex-1 justify-items-center"
            >
              {languageOptions.map((language, index) => (
                <motion.button
                  key={language}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                  onClick={() => handleLanguageToggle(language)}
                  className={`w-[20px] h-[20px] sm:w-24 sm:h-14 rounded-lg font-medium text-gray-700 transition-all duration-300 hover:shadow-md text-xs sm:text-sm flex items-center justify-center ${
                    selectedLanguages.includes(language)
                      ? "bg-[#F7971D] text-white shadow-lg scale-105"
                      : "bg-white hover:bg-orange-50 border-2 border-gray-200"
                  }`}
                >
                  {language}
                </motion.button>
              ))}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center mt-auto pt-4 pb-2"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedLanguages.length === 0}
                className={`w-[185px] h-[62px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${
                  selectedLanguages.length > 0
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