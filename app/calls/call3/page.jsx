"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call3() {
  const [name, setName] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call3: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call3: No stored astrologer ID found');
    }
  }, []);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleNext = () => {
    if (name.trim()) {
      // Store the name in localStorage for the next step
      localStorage.setItem('userName', name.trim());
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call4");
      }, 100);
    }
  };

  const handleBack = () => {
    router.push("/calls/call2");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call3-card"
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
              className="font-medium font-['Poppins'] text-center text-gray-800 text-2xl mb-8 mt-[50px]"
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
                  animate={{ width: "37.5%" }}
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
                      index < 3 ? "bg-[#F7971D]" : "bg-gray-300"
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
              className="text-xl font-normal text-center text-[#373737] mb-10 mt-16"
            >
              What is your name?
            </motion.h2>

            {/* Name Input Field */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="w-full max-w-md mx-auto mb-24 mt-8"
            >
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full h-16 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 
                         focus:border-[#F7971D] focus:ring-4 focus:ring-orange-100 focus:outline-none 
                         text-lg font-medium text-gray-700 placeholder-gray-400
                         transition-all duration-300 shadow-sm hover:shadow-md"
                placeholder="Enter your full name"
              />
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center gap-4"
            >
              <button
                type="button"
                onClick={handleBack}
                className="w-[120px] px-6 py-3 text-[#F7971D] font-semibold rounded-lg border-2 border-[#F7971D] transition-all duration-300 hover:bg-[#F7971D] hover:text-white"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!name.trim()}
                className={`w-[203px] px-8 py-4 text-white font-semibold rounded-lg h-[72px] text-[25px] transition-all duration-300 ${
                  name.trim()
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
