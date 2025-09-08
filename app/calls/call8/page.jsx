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

  // Language options
  const languageOptions = [
    "Hindi", "English", "Telugu", "Marathi",
    "Tamil", "Gujarati", "Urdu", "Punjabi",
    "Malayalam", "Kannada", "Bengali",
  ];

  useEffect(() => {
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call8: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call8: No stored astrologer ID found');
    }
  }, []);

  const handleLanguageToggle = (language) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  const handleNext = () => {
    if (selectedLanguages.length > 0) {
      localStorage.setItem('userLanguages', JSON.stringify(selectedLanguages));
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call9");
      }, 100);
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
            className="relative w-full max-w-[1141px] min-h-[600px] sm:h-[550px] md:h-[400px] bg-[#FCF4E9] rounded-lg p-4 sm:p-6 md:p-8 shadow-lg flex flex-col"
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
                  animate={{ width: "100%" }}
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
                    className={`w-3 h-3 rounded-full ${index < 8 ? "bg-[#F7971D]" : "bg-gray-300"
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
              Select your Language
            </motion.h2>

            
            {/* Language Selection Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 
             px-4 sm:px-6 md:px-8 
             max-w-4xl mx-auto 
             overflow-y-auto flex-grow pb-24"
            >
              {languageOptions.map((language, index) => (
                <motion.button
                  key={language}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                  onClick={() => handleLanguageToggle(language)}
                  className={`px-3 py-3 sm:px-6 sm:py-4 
                  rounded-full font-medium text-[#757474] 
                  transition-all duration-300 hover:shadow-md 
                  text-sm sm:text-base 
                  flex items-center justify-center
                  ${selectedLanguages.includes(language)
                      ? "bg-[#F7971D] text-white shadow-lg scale-105"
                      : "bg-white hover:bg-orange-50 border"
                    }`}
                >
                  {language}
                </motion.button>
              ))}
            </motion.div>


            {/* Next Button - fixed bottom inside card */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedLanguages.length === 0}
                className={`w-[185px] h-[50px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${selectedLanguages.length > 0
                  ? "bg-[#F7971D] hover:bg-[#E88A1A]"
                  : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
