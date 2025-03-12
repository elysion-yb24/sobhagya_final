"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call9() {
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // Challenge options
  const challengeOptions = [
    "Love & Marriage",
    "Career & Business",
    "Financial Problem",
    "Family & Children",
    "Kundli & Dosha Solutions",
    "Health Concerns",
    
  ];

  // Toggle challenge selection
  const handleToggleChallenge = (challenge) => {
    setSelectedChallenges((prevSelected) =>
      prevSelected.includes(challenge)
        ? prevSelected.filter((item) => item !== challenge)
        : [...prevSelected, challenge]
    );
  };

  const handleNext = () => {
    if (selectedChallenges.length > 0) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/final-step"); // Adjust the next step as needed
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
          className="min-h-screen flex items-center justify-center px-4"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {/* Fixed Width & Height */}
          <div className="w-[1140px] h-[600px] px-6 sm:px-8 md:px-16 lg:px-36 py-10 sm:py-14 bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] mb-10 text-2xl sm:text-3xl md:text-4xl">
              Enter Your Details
            </h1>

            {/* Progress Bar (7/7 dots filled) */}
            <div className="relative mb-14 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-full"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[-6px]">
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="w-3 h-3 rounded-full bg-[#F7971E]"></div>
                ))}
              </div>
            </div>

            <form className="flex flex-col flex-grow items-center justify-center">
              <h2 className="text-2xl sm:text-3xl font-normal text-center text-[#373737] mb-8">
                What Life Challenge Are You Facing?
              </h2>

              {/* Challenge Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 justify-center mb-10">
                {challengeOptions.map((challenge) => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => handleToggleChallenge(challenge)}
                    className={`px-4 py-2 sm:px-6 sm:py-2 rounded-full border transition-all text-sm sm:text-base ${
                      selectedChallenges.includes(challenge)
                        ? "bg-[#F7971E] text-white border-[#F7971E]"
                        : "bg-white text-[#373737] border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedChallenges.length === 0}
                  className={`w-64 px-12 py-3 text-white font-medium rounded-md transition-all ${
                    selectedChallenges.length > 0
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
