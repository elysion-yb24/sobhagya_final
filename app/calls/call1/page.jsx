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

  const astrologerId = searchParams.get("astrologerId");

  useEffect(() => {
    if (astrologerId) {
      localStorage.setItem("selectedAstrologerId", astrologerId);
      console.log("Stored astrologer ID for call flow:", astrologerId);
    }

    const callSource = localStorage.getItem("callSource");
    if (callSource === "astrologerCard") {
      localStorage.removeItem("callSource");
      router.push("/login");
      return;
    }
  }, [astrologerId, router]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption) {
      localStorage.setItem("guidanceFor", selectedOption);
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call2");
      }, 100);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 md:px-9 overflow-hidden">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call1-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1100px] bg-[#FCF4E9] rounded-lg p-6 sm:p-8 md:p-20 shadow-md h-[512px] flex flex-col justify-between"
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
              className="font-medium font-['Poppins'] text-center text-gray-800 text-xl sm:text-2xl"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-[70%] mx-auto"
            >
              <div className="h-[1px] bg-[#F7971D] w-[110%] -ml-[5%] rounded-full mx-auto relative">
                <motion.div
                  className="h-[1px] bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "14%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>

              <div className="flex justify-between absolute w-[90%] left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                {[...Array(7)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      index === 0 ? "bg-[#F7971D]" : "bg-gray-300"
                    }`}
                  ></motion.div>
                ))}
              </div>
            </motion.div>

            {/* Question */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg sm:text-xl text-center text-[#373737]"
            >
              Who Are You Seeking Guidance For?
            </motion.h2>

            {/* Options */}
            <div className="flex justify-center gap-12">
              {["myself", "someone_else"].map((option) => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="hidden"
                    name="guidance"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => handleOptionChange(option)}
                  />
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedOption === option
                        ? "border-[#F7971D]"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedOption === option && (
                      <div className="w-3 h-3 rounded-full bg-[#F7971D]"></div>
                    )}
                  </div>
                  <span className="text-lg text-gray-700 ml-3">
                    {option === "myself" ? "Myself" : "Someone else"}
                  </span>
                </label>
              ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedOption}
                className={`w-[185px] h-[55px] text-white font-semibold rounded-md text-lg transition-all duration-300 ${
                  selectedOption
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
