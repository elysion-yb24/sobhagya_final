"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call4() {
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleNext = () => {
    if (date && month && year) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call5");
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

    <AnimatePresence>
      {!isExiting && (
        <motion.div
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
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 
                         px-6 sm:px-8 md:px-10 lg:px-12 
                         py-8 sm:py-10 md:py-12
                         bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200/50 
                         flex flex-col relative overflow-hidden"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl"></div>
              
            {/* Title */}
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-bold text-center text-gray-800 
                          mb-8 sm:mb-10 
                          text-2xl sm:text-3xl md:text-4xl
                          relative z-10"
              >
              Enter Your Details
              </motion.h1>

              {/* Enhanced Progress Bar */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mb-10 flex items-center"
              >
                <div className="h-2 bg-gray-200 w-full rounded-full shadow-inner">
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"
                    initial={{ width: "0%" }}
                    animate={{ width: "42.9%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  ></motion.div>
              </div>
                <div className="flex justify-between absolute w-full top-1 transform -translate-y-1/2">
                {[...Array(7)].map((_, index) => (
                    <motion.div
                    key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className={`w-3 h-3 rounded-full shadow-sm ${
                        index < 3 ? "bg-orange-500" : "bg-gray-300"
                    }`}
                    ></motion.div>
                ))}
              </div>
              </motion.div>

              <form className="flex flex-col flex-grow items-center justify-center relative z-10">
                <motion.h2 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-2xl sm:text-3xl font-semibold text-center text-gray-700 mb-12"
                >
                Select Your Birth Date
                </motion.h2>

                {/* Enhanced Date Selection Fields */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mb-12 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 w-full max-w-2xl"
                >
                {/* Date Dropdown */}
                  <div className="relative w-full md:w-32">
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                      className="w-full h-14 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 
                               cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-100 
                               focus:border-orange-400 text-lg font-medium text-gray-700
                               transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="" disabled>Date</option>
                    {dateOptions.map((d) => (
                      <option key={`date-${d}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Dropdown */}
                  <div className="relative w-full md:w-40">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                      className="w-full h-14 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 
                               cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-100 
                               focus:border-orange-400 text-lg font-medium text-gray-700
                               transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="" disabled>Month</option>
                    {monthOptions.map((m, index) => (
                      <option key={`month-${index}`} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Dropdown */}
                  <div className="relative w-full md:w-32">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                      className="w-full h-14 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 
                               cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-100 
                               focus:border-orange-400 text-lg font-medium text-gray-700
                               transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="" disabled>Year</option>
                    {yearOptions.map((y) => (
                      <option key={`year-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                </motion.div>

                {/* Enhanced Next Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex justify-center w-full"
                >
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!date || !month || !year}
                    className={`w-full sm:w-72 px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                    date && month && year
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-105 active:scale-95"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
                </motion.div>
            </form>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
