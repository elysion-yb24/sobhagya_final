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

  // Life challenge options as shown in the design
  const challengeOptions = [
    "Love & Marriage",
    "Career & Business", 
    "Financial Problem",
    "Family & Children",
    "Kundli & Dosha Solutions",
    "Health Concerns"
  ];

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call9: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call9: No stored astrologer ID found');
    }
  }, []);

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleNext = () => {
    if (selectedChallenge) {
      // Store the selected life challenge in localStorage
      localStorage.setItem('userLifeChallenge', selectedChallenge);
      
      // Collect all form data
      const formData = {
        astrologerId: localStorage.getItem('selectedAstrologerId'),
        guidanceFor: localStorage.getItem('guidanceFor'),
        gender: localStorage.getItem('userGender'),
        name: localStorage.getItem('userName'),
        dateOfBirth: localStorage.getItem('userDateOfBirth'),
        timeOfBirth: localStorage.getItem('userTimeOfBirth'),
        knowBirthTime: localStorage.getItem('knowBirthTime'),
        placeOfBirth: localStorage.getItem('userPlaceOfBirth'),
        languages: localStorage.getItem('userLanguages'),
        lifeChallenge: selectedChallenge
      };

      console.log('Complete form data:', formData);
      
      // Show success message and redirect
      
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
    <div className="min-h-screen bg-white flex items-center justify-center p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call9-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] h-[500px] bg-[#FCF4E9] rounded-lg p-8 shadow-lg"
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
              className="font-semibold font-['Poppins'] text-center text-gray-800 text-2xl mb-8 mt-[20px]"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps - 7th step (87.5%) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-8"
            >
              <div className="h-1 bg-gray-300 w-full rounded-full">
                <motion.div 
                  className="h-1 bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "87.5%" }}
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
                      index < 7 ? "bg-[#F7971D]" : "bg-gray-300"
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
              className="text-xl font-normal text-center text-[#373737] mb-8 mt-8"
            >
              What Life Challenge Are You Facing?
            </motion.h2>

            {/* Life Challenges Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-4 mb-16 mt-8 max-w-3xl mx-auto"
            >
              {challengeOptions.map((challenge, index) => (
                <motion.button
                  key={challenge}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  onClick={() => handleChallengeSelect(challenge)}
                  className={`px-6 py-4 rounded-xl font-medium text-gray-700 transition-all duration-300 hover:shadow-md ${
                    selectedChallenge === challenge
                      ? "bg-[#F7971D] text-white shadow-lg scale-105"
                      : "bg-white hover:bg-orange-50 border-2 border-gray-200"
                  }`}
                >
                  {challenge}
                </motion.button>
              ))}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedChallenge}
                className={`w-[203px] px-8 py-4 text-white font-semibold rounded-lg h-[72px] text-[25px] transition-all duration-300 ${
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