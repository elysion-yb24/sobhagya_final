"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call3() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedAstrologerId = localStorage.getItem("selectedAstrologerId");
    if (storedAstrologerId) {
      console.log("Call3: Found stored astrologer ID:", storedAstrologerId);
    } else {
      console.log("Call3: No stored astrologer ID found");
    }
  }, []);

  const handleNameChange = (e) => {
    let value = e.target.value;
  
    // Normalize spaces
    value = value.replace(/\s+/g, " ").trim();
    setName(value);
  
    // Rules
    const nameRegex = /^[A-Za-z\s]+$/; // only letters + spaces
    const words = value.split(" ").filter(Boolean);
  
    if (value.length < 2) {
      setError("Name must be at least 2 characters long");
    } else if (!nameRegex.test(value)) {
      setError("Only letters and spaces are allowed");
    } else if (words.some((w) => w.length < 2)) {
      setError("Each word must have at least 2 letters");
    } else if (/^(.)\1{2,}$/.test(value.replace(/\s/g, ""))) {
      setError("Name cannot be just repeated characters");
    } else if (value.length > 40) {
      setError("Name is too long");
    } else {
      setError("");
    }
  };
  
  

  const handleNext = () => {
    if (name.trim() && !error) {
      localStorage.setItem("userName", name.trim());
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call3-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] min-h-[400px] sm:h-[450px] md:h-[500px] bg-[#FCF4E9] rounded-lg p-6 sm:p-8 shadow-lg"
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
              className="font-medium font-['Poppins'] text-center text-gray-800 text-xl sm:text-2xl mb-6 sm:mb-8 mt-[40px] sm:mt-[50px]"
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
              <div className="h-[1px] bg-gray-300 w-[110%] -ml-[5%] rounded-full relative">
                <motion.div
                  className="h-[1px] bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "37.5%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              <div className="flex justify-between absolute w-full left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      index < 3 ? "bg-[#F7971D]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Main Question */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-6 sm:mb-8"
            >
              What is your name?
            </motion.h2>

            {/* Name Input Field */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="w-full max-w-md mx-auto mb-4 sm:mb-6 md:mb-8 mt-6 sm:mt-8 px-4 sm:px-0"
            >
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className={`w-full h-14 sm:h-16 px-4 sm:px-6 py-3 sm:py-4 bg-white rounded-xl border-2 
                ${error ? "border-red-500" : "border-gray-200"} 
                focus:border-[#F7971D] focus:ring-4 focus:ring-orange-100 focus:outline-none 
                text-base sm:text-lg font-normal text-gray-700 placeholder-gray-400
                transition-all duration-300 shadow-sm hover:shadow-md`}
                placeholder="Enter your full name"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center mt-2 sm:mt-4"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!name.trim() || !!error}
                className={`w-[185px] h-[62px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${
                  name.trim() && !error
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
