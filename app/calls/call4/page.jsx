"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call4() {
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate options for date, month, and year
  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call4: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call4: No stored astrologer ID found');
    }
  }, []);

  const handleNext = () => {
    if (date && month && year) {
      // Store the complete date of birth in localStorage for the next step
      const fullDate = `${date} ${month} ${year}`;
      localStorage.setItem('userDateOfBirth', fullDate);
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call5");
      }, 100);
    }
  };

  const handleBack = () => {
    router.push("/calls/call3");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call4-card"
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
                  animate={{ width: "50%" }}
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
                      index < 4 ? "bg-[#F7971D]" : "bg-gray-300"
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
              Select Your Birth Date
            </motion.h2>

            {/* Date Selection Fields */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-center gap-4 sm:gap-6 mb-16 sm:mb-20 md:mb-24 mt-6 sm:mt-8"
            >
              {/* Date Dropdown */}
              <div className="relative">
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-20 sm:w-24 h-14 sm:h-16 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-xl border-2 border-gray-200 
                           cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-100 
                           focus:border-[#F7971D] text-base sm:text-lg font-medium text-gray-700
                           transition-all duration-300 shadow-sm hover:shadow-md appearance-none"
                >
                  <option value="" disabled>Date</option>
                  {dateOptions.map((d) => (
                    <option key={`date-${d}`} value={d}>
                      {d.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Month Dropdown */}
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-20 sm:w-24 h-14 sm:h-16 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-xl border-2 border-gray-200 
                           cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-100 
                           focus:border-[#F7971D] text-base sm:text-lg font-medium text-gray-700
                           transition-all duration-300 shadow-sm hover:shadow-md appearance-none"
                >
                  <option value="" disabled>Month</option>
                  {monthOptions.map((m, index) => (
                    <option key={`month-${index}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-20 sm:w-24 h-14 sm:h-16 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-xl border-2 border-gray-200 
                           cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-100 
                           focus:border-[#F7971D] text-base sm:text-lg font-medium text-gray-700
                           transition-all duration-300 shadow-sm hover:shadow-md appearance-none"
                >
                  <option value="" disabled>Year</option>
                  {yearOptions.map((y) => (
                    <option key={`year-${y}`} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.div>

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
                disabled={!date || !month || !year}
                className={`w-full sm:w-[203px] px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold rounded-lg h-[60px] sm:h-[72px] text-lg sm:text-xl md:text-[25px] transition-all duration-300 ${
                  date && month && year
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
