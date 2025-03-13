"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call8() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const languageOptions = [
    "Hindi",
    "English",
    "Telugu",
    "Marathi",
    "Tamil",
    "Gujarati",
    "Urdu",
    "Punjabi",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Others"
  ];

  // Toggle language selection
  const handleToggleLanguage = (lang) => {
    setSelectedLanguages((prevSelected) =>
      prevSelected.includes(lang)
        ? prevSelected.filter((item) => item !== lang)
        : [...prevSelected, lang]
    );
  };

  const handleNext = () => {
    if (selectedLanguages.length > 0) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call9");
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-screen flex items-center justify-center p-4"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {/*  Container */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-6xl 
                         h-auto md:h-auto lg:h-auto
                         px-4 sm:px-6 md:px-8 lg:px-16 
                         py-6 sm:py-8 md:py-10
                         bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 
                         flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] 
                          mb-6 sm:mb-8 md:mb-10 
                          text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Enter Your Details
            </h1>

            {/* Progress Bar */}
            <div className="relative mb-8 sm:mb-10 flex items-center">
              {/* Progress bar container */}
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                {/* Progress bar fill */}
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[85.71%]"></div>
              </div>

              {/* Dots container - perfectly centered vertically with the bar */}
              <div className="flex justify-between absolute w-full top-[0.5px] transform -translate-y-1/2">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      index < 6 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form className="flex flex-col flex-grow items-center justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-center text-[#373737] mb-4 sm:mb-6 md:mb-8">
                Select your Language
              </h2>

              {/* Language Selection Grid - Responsive grid columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 w-full">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleToggleLanguage(lang)}
                    className={`px-2 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-full border transition-all 
                               text-xs sm:text-sm md:text-base
                               ${
                                 selectedLanguages.includes(lang)
                                   ? "bg-[#F7971E] text-white border-[#F7971E]"
                                   : "bg-white text-[#373737] border-gray-300 hover:bg-gray-100"
                               }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Next Button - Responsive width */}
              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedLanguages.length === 0}
                  className={`w-full sm:w-auto sm:min-w-40 md:min-w-48 lg:min-w-64
                            px-6 sm:px-8 md:px-12 py-2 sm:py-2.5 md:py-3 
                            text-white font-medium rounded-md transition-all
                            text-sm sm:text-base
                            ${
                              selectedLanguages.length > 0
                                ? "bg-[#F7971E] hover:bg-[#d99845]"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}