"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserDetails, isAuthenticated, storeUserDetails } from "../../utils/auth-utils";

export default function Call2() {
  const [selectedGender, setSelectedGender] = useState("female");
  const [isExiting, setIsExiting] = useState(false);
  const [isProfileMode, setIsProfileMode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if this is profile completion mode
  useEffect(() => {
    const fromProfile = searchParams.get('profile') === 'complete';
    setIsProfileMode(fromProfile);
    
    // If user is authenticated and has a gender, pre-fill it
    if (isAuthenticated()) {
      const userDetails = getUserDetails();
      if (userDetails?.gender) {
        setSelectedGender(userDetails.gender);
      }
    }
    
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call2: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call2: No stored astrologer ID found');
    }
  }, [searchParams]);

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
  };

  const handleNext = () => {
    if (selectedGender) {
      // Capture the user's gender by updating user details
      const currentUserDetails = getUserDetails() || {};
      const updatedUserDetails = {
        ...currentUserDetails,
        gender: selectedGender
      };
      storeUserDetails(updatedUserDetails);
      
      setIsExiting(true);
      setTimeout(() => {
        if (isProfileMode) {
          // If this is profile completion mode, redirect back to astrologers page
          router.push("/astrologers");
        } else {
          // Normal call flow, continue to next step
          // Check if we have a stored astrologer ID and pass it to call3
          const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
          if (storedAstrologerId) {
            console.log('Call2: Passing astrologer ID to call3:', storedAstrologerId);
            router.push(`/calls/call3?astrologerId=${storedAstrologerId}`);
          } else {
            router.push("/calls/call3");
          }
        }
      }, 100);
    }
  };

  const handleBack = () => {
    if (isProfileMode) {
      // If profile completion mode, go back to astrologers
      router.push("/astrologers");
    } else {
      // Normal flow, go to previous call page or home
      router.push("/calls/call1");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call2-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] h-[600px] bg-[#FCF4E9] rounded-lg p-8 shadow-lg"
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
              className="font-bold text-center text-gray-800 text-2xl mb-8"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-10"
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
                    className={`w-3 h-3 rounded-full ${
                      index < 2 ? "bg-[#F7971D]" : "bg-gray-300"
                    }`}
                  ></motion.div>
                ))}
              </div>
            </motion.div>

            {/* Section Title */}
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-xl font-normal text-center text-[#373737] mb-10 mt-16"
            >
              Choose Your Gender
            </motion.h2>

            {/* Gender Selection Options */}
            <div className="flex justify-center gap-16 mb-24 mt-8">
              {[
                { value: "female", label: "Female", icon: "/Vector 93.png", color: "text-[#F7971D]" },
                { value: "male", label: "Male", icon: "/Vector 92.png", color: "text-gray-700" },
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
                  {/* Icon */}
                  <div className={`mb-2 ${option.color}`}>
                    <img 
                      src={option.icon} 
                      alt={option.label}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-lg font-medium text-gray-700 mb-2">
                    {option.label}
                  </span>
                  
                  {/* Radio Button */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedGender === option.value
                        ? "border-[#F7971D]"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedGender === option.value && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-[#F7971D]"
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
              className="flex justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => router.push("/calls/call1")}
                className="w-[120px] px-6 py-3 text-[#F7971D] font-semibold rounded-lg border-2 border-[#F7971D] transition-all duration-300 hover:bg-[#F7971D] hover:text-white"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedGender}
                className={`w-[203px] px-8 py-4 text-white font-semibold rounded-lg h-[72px] text-[25px] transition-all duration-300 ${
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