"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

import PhoneVerificationModal from "../../login/page"; 

export default function Call9() {
  // Store selected challenges in an array (multiple selection).
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Challenge options for display
  const challengeOptions = [
    "Love & Marriage",
    "Career & Business",
    "Financial Problem",
    "Family & Children",
    "Kundli & Dosha Solutions",
    "Health Concerns",
    
  ];

  // Toggle a challenge in the selectedChallenges array
  const handleToggleChallenge = (challenge) => {
    setSelectedChallenges((prevSelected) => {
      if (prevSelected.includes(challenge)) {
        // Remove if already selected
        return prevSelected.filter((item) => item !== challenge);
      } else {
        // Add if not selected
        return [...prevSelected, challenge];
      }
    });
  };

  const handleNext = () => {
    if (selectedChallenges.length > 0) {
      setIsExiting(true);
      setTimeout(() => {
        // Adjust this route to whatever comes after
        router.push("calls/call9");
      }, 500);
    }
  };

  return (
    <>
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

          <div className="w-full max-w-lg md:max-w-3xl lg:max-w-6xl p-6 md:p-12 lg:p-24 bg-[#fcf4e9] rounded-lg shadow-lg">
            <h1 className="font-medium text-center text-[#373737] mb-6 md:mb-8 text-2xl md:text-3xl">
              Enter Your Details
            </h1>

            {/* Progress Bar */}
            <div className="relative mb-10 md:mb-12 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                {/* Since all 6 steps are done, fill the bar completely */}
                <div className="h-[2px] bg-[#F7971E] rounded-full w-full"></div>
              </div>
              <div className="flex justify-between absolute w-full top-[-6px] left-0 right-0">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    // All circles are orange for a 6-step flow
                    className={`w-3 h-3 rounded-full bg-[#F7971E]`}
                  ></div>
                ))}
              </div>
            </div>

            <form>
              <h2 className="text-xl md:text-2xl font-normal text-center text-[#373737] mb-10 md:mb-16">
                What Life Challenge Are You Facing?
              </h2>

              {/* Challenge Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-10 md:mb-16">
                {challengeOptions.map((challenge) => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => handleToggleChallenge(challenge)}
                    className={`px-4 py-2 rounded-full border transition-all text-sm md:text-base
                      ${
                        selectedChallenges.includes(challenge)
                          ? "bg-[#F7971E] text-white border-[#F7971E]"
                          : "bg-white text-[#373737] border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedChallenges.length === 0}
                  className={`px-8 md:px-12 py-3 text-white font-medium rounded-md transition-all ${
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