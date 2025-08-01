"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Call3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gender, setGender] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  // Check for astrologer ID from query params or localStorage
  useEffect(() => {
    const astrologerId = searchParams.get('astrologerId');
    if (astrologerId) {
      console.log('Call3: Found astrologer ID in query params:', astrologerId);
      localStorage.setItem('selectedAstrologerId', astrologerId);
    } else {
      // Check localStorage as fallback
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      if (storedAstrologerId) {
        console.log('Call3: Found stored astrologer ID:', storedAstrologerId);
      } else {
        console.log('Call3: No astrologer ID found');
      }
    }
  }, [searchParams]);

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
  };

  const handleNext = () => {
    if (gender) {
      setIsExiting(true);
      setTimeout(() => {
        // Check if we have a stored astrologer ID and pass it to call4
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        if (storedAstrologerId) {
          console.log('Call3: Passing astrologer ID to call4:', storedAstrologerId);
          router.push(`/calls/call4?astrologerId=${storedAstrologerId}`);
        } else {
          router.push("/calls/call4");
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/50 to-white"></div>
      {/* Subtle Astrology Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-20 w-16 h-16 bg-orange-300 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-orange-200 rounded-full blur-md"></div>
      </div>

      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call3-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Premium Card Container */}
            <motion.div
                className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 
                           px-6 sm:px-8 md:px-10 lg:px-12 
                           py-8 sm:py-10 md:py-12
                           bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200/50 
                           flex flex-col relative overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl"></div>
                
                {/* Title */}
                <motion.h1
                  className="font-bold text-center text-gray-800 
                            mb-8 sm:mb-10 
                            text-2xl sm:text-3xl md:text-4xl
                            relative z-10"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                Enter Your Details
              </motion.h1>

                {/* Enhanced Progress Bar */}
                <motion.div
                  className="relative mb-10 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                    <div className="h-2 bg-gray-200 w-full rounded-full shadow-inner">
                    <motion.div
                        className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"
                      initial={{ width: "0%" }}
                      animate={{ width: "28.56%" }} 
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>

                    <div className="flex justify-between absolute w-full top-1 transform -translate-y-1/2">
                    {[...Array(7)].map((_, i) => (
                        <motion.div
                        key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                          className={`w-3 h-3 rounded-full shadow-sm ${
                            i < 2 ? "bg-orange-500" : "bg-gray-300"
                        }`}
                        ></motion.div>
                    ))}
                  </div>
                </motion.div>

                  <form className="flex flex-col flex-grow items-center justify-center relative z-10">
                  <motion.h2
                      className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-gray-700 mb-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Choose Your Gender
                  </motion.h2>

                    {/* Enhanced Gender Selection */}
                    <div className="grid grid-cols-3 gap-12 md:gap-16 justify-center items-center text-center mb-12">
                    {["female", "male", "other"].map((type, index) => (
                      <motion.div
                        key={type}
                          className="flex flex-col items-center group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                      >
                        <div
                            className="mb-4 cursor-pointer transition-transform duration-300 hover:scale-110"
                          onClick={() => handleGenderChange(type)}
                        >
                          <Image
                            src={
                              gender === type
                                ? type === "female"
                                  ? "/Vector 92 (1).png"
                                  : type === "male"
                                  ? "/image (16).png"
                                  : "/image (15).png"
                                : type === "female"
                                ? "/Vector 92.png"
                                : type === "male"
                                ? "/Vector 93.png"
                                : "/Group 13400.png"
                            }
                            alt={type}
                              width={60}
                              height={60}
                              className="max-w-[60px] sm:max-w-[70px] h-auto filter drop-shadow-sm"
                          />
                        </div>
                          <div className="text-lg font-medium text-gray-700 capitalize mb-3">
                          {type}
                        </div>
                        <motion.div
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ease-in-out cursor-pointer ${
                            gender === type
                                ? "bg-orange-500 border-orange-500 scale-110 shadow-md"
                                : "border-gray-400 group-hover:border-orange-300"
                            }`}
                          onClick={() => handleGenderChange(type)}
                          whileTap={{ scale: 0.9 }}
                        ></motion.div>
                      </motion.div>
                    ))}
                  </div>

                    {/* Enhanced Next Button */}
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={!gender}
                        className={`w-full sm:w-72 px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                        gender
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-105 active:scale-95"
                            : "bg-gray-400 text-gray-500 cursor-not-allowed opacity-50"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
