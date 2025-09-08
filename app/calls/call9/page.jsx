"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call9() {
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const challengeOptions = [
    "Love & Marriage",
    "Career & Business", 
    "Financial Problem",
    "Family & Children",
    "Kundli & Dosha Solutions",
    "Health Concerns"
  ];

  useEffect(() => {
    const storedAstrologerId = localStorage.getItem("selectedAstrologerId");
    if (storedAstrologerId) {
      console.log("Call9: Found stored astrologer ID:", storedAstrologerId);
    } else {
      console.log("Call9: No stored astrologer ID found");
    }
  }, []);

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleNext = () => {
    if (selectedChallenge) {
      localStorage.setItem("userLifeChallenge", selectedChallenge);

      const formData = {
        astrologerId: localStorage.getItem("selectedAstrologerId"),
        guidanceFor: localStorage.getItem("guidanceFor"),
        gender: localStorage.getItem("userGender"),
        name: localStorage.getItem("userName"),
        dateOfBirth: localStorage.getItem("userDateOfBirth"),
        timeOfBirth: localStorage.getItem("userTimeOfBirth"),
        knowBirthTime: localStorage.getItem("knowBirthTime"),
        placeOfBirth: localStorage.getItem("userPlaceOfBirth"),
        languages: localStorage.getItem("userLanguages"),
        lifeChallenge: selectedChallenge,
      };

      console.log("Complete form data:", formData);

      setIsExiting(true);
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }
  };

  const handleBack = () => {
    router.push("/calls/call8");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call9-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] min-h-[500px] sm:h-[450px] md:h-[500px] 
                       bg-[#FCF4E9] rounded-lg p-4 sm:p-6 md:p-8 
                       shadow-lg flex flex-col"
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
              className="font-medium font-['Poppins'] text-center text-gray-800 
                         text-xl sm:text-2xl mb-4 sm:mb-6 md:mb-8 
                         mt-[20px] sm:mt-[30px] md:mt-[40px]"
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
              <div className="h-[1px] bg-gray-300 w-[110%]  -ml-[5%] rounded-full relative">
                <motion.div
                  className="h-[1px] bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              <div className="flex justify-between absolute w-full left-0 top-0 -translate-y-1/2">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      index < 8 ? "bg-[#F7971D]" : "bg-gray-300"
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
              className="text-lg sm:text-xl font-normal text-center text-[#373737] 
                         mb-6 sm:mb-8 px-2"
            >
              What Life Challenge Are You Facing?
            </motion.h2>

            {/* Life Challenges Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 
                         max-w-3xl mx-auto px-4 sm:px-0 mb-8 sm:mb-12 flex-grow"
            >
              {challengeOptions.map((challenge, index) => (
                <motion.button
                  key={challenge}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  onClick={() => handleChallengeSelect(challenge)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 
                              rounded-xl font-medium text-gray-700 
                              transition-all duration-300 hover:shadow-md 
                              text-sm sm:text-base
                              ${
                                selectedChallenge === challenge
                                  ? "bg-[#F7971D] text-white shadow-lg scale-105"
                                  : "bg-white hover:bg-orange-50 border-2 border-gray-200"
                              }`}
                >
                  {challenge}
                </motion.button>
              ))}
            </motion.div>

            {/* Next Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex justify-center mt-auto mb-4"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedChallenge}
                className={`w-[185px] h-[55px] text-white font-semibold rounded-lg text-lg 
                           transition-all duration-300 ${
                             selectedChallenge
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
