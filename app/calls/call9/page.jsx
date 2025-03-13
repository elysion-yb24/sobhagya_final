"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

import PhoneVerificationModal from "../../login/page"; 

export default function Call9() {
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const challengeOptions = [
    "Love & Marriage",
    "Career & Business",
    "Financial Problem",
    "Family & Children",
    "Kundli & Dosha Solutions",
    "Health Concerns",
  ];

  const handleToggleChallenge = (challenge) => {
    setSelectedChallenges((prevSelected) => {
      if (prevSelected.includes(challenge)) {
        return prevSelected.filter((item) => item !== challenge);
      } else {
        return [...prevSelected, challenge];
      }
    });
  };

  const handleNext = () => {
    if (selectedChallenges.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push("calls/call9");
    }, 500);
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
            className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

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
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[100%]"></div>
              </div>

              {/* Dots container - perfectly centered vertically with the bar */}
              <div className="flex justify-between absolute w-full top-[0.5px] transform -translate-y-1/2">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      index < 7 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

              <form>
                <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-center text-[#373737] mb-6 sm:mb-8 md:mb-10">
                  What Life Challenge Are You Facing?
                </h2>

                {/* Challenge Pills - Responsive Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 justify-items-center">
                  {challengeOptions.map((challenge) => (
                    <button
                      key={challenge}
                      type="button"
                      onClick={() => handleToggleChallenge(challenge)}
                      className={`px-3 sm:px-4 py-2 rounded-full border transition-all text-xs sm:text-sm md:text-base w-full
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
                    className={`w-full sm:w-auto px-6 sm:px-8 md:px-12 py-2 sm:py-3 text-white font-medium rounded-md transition-all text-sm sm:text-base ${
                      selectedChallenges.length > 0
                        ? "bg-[#F7971E] hover:bg-[#d99845]"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                   Proceed to Login
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}