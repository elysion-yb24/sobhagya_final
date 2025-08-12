"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call2() {
  const [selectedGender, setSelectedGender] = useState("female");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call2: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call2: No stored astrologer ID found');
    }
  }, []);

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
  };

  const handleNext = () => {
    if (selectedGender) {
      // Store the gender in localStorage for the next step
      localStorage.setItem('userGender', selectedGender);
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call3");
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call2-card"
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
              className="font-semibold font-['Poppins'] text-center text-gray-800 text-xl sm:text-2xl mb-4 sm:mb-6 md:mb-8 mt-[20px] sm:mt-[30px] md:mt-[50px]"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-6 sm:mb-8"
            >
              <div className="h-1 bg-gray-300 w-full rounded-full">
                <motion.div
                  className="h-1 bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "25%" }}
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
                      index < 2 ? "bg-[#F7971D]" : "bg-gray-300"
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
              className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-6 sm:mb-8 mt-6 sm:mt-8 px-2"
            >
              Choose Your Gender
            </motion.h2>

            {/* Gender Selection Options */}
            <div className="flex justify-center gap-8 sm:gap-16 md:gap-56 mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8">
              {[
                { value: "female", label: "Female", icon: "/Vector 92.png", color: "text-[#F7971D]" },
                { value: "male", label: "Male", icon: "/Vector 93.png", color: "text-gray-700" },
                { value: "other", label: "Other", icon: "/Group 13400.png", color: "text-gray-700" }
              ].map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleGenderChange(option.value)}
                >
                  <div className={`mb-2 ${option.color}`}>
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                    />
                  </div>
                  <span className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                    {option.label}
                  </span>
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedGender === option.value
                        ? "border-[#F7971D]"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedGender === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F7971D]"
                      ></motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

                               {/* Navigation Buttons */}
                   <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ duration: 0.6, delay: 0.9 }}
                     className="flex justify-center mt-6 sm:mt-8"
                   >
                     <button
                       type="button"
                       onClick={handleNext}
                       disabled={!selectedGender}
                       className={`w-full sm:w-[203px] px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold rounded-lg h-[60px] sm:h-[72px] text-lg sm:text-xl md:text-[25px] transition-all duration-300 ${
                         selectedGender
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