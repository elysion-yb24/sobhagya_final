"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Call4() {
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'date', 'month', 'year', or null
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

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

  const toggleDropdown = (dropdownType) => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };

  const selectOption = (dropdownType, value) => {
    if (dropdownType === 'date') setDate(value);
    if (dropdownType === 'month') setMonth(value);
    if (dropdownType === 'year') setYear(value);
    setOpenDropdown(null);
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
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown('date')}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${
                    date ? 'border-[#F7971D] text-gray-700' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <span>{date ? date.toString().padStart(2, '0') : 'Date'}</span>
                  {openDropdown === 'date' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'date' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                    >
                      {dateOptions.map((d) => (
                        <button
                          key={`date-${d}`}
                          onClick={() => selectOption('date', d)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {d.toString().padStart(2, '0')}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Month Dropdown */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown('month')}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${
                    month ? 'border-[#F7971D] text-gray-700' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <span>{month || 'Month'}</span>
                  {openDropdown === 'month' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'month' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                    >
                      {monthOptions.map((m, index) => (
                        <button
                          key={`month-${index}`}
                          onClick={() => selectOption('month', m)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {m}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Year Dropdown */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown('year')}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${
                    year ? 'border-[#F7971D] text-gray-700' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <span>{year || 'Year'}</span>
                  {openDropdown === 'year' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openDropdown === 'year' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                    >
                      {yearOptions.map((y) => (
                        <button
                          key={`year-${y}`}
                          onClick={() => selectOption('year', y)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {y}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                className={`w-[185px] h-[62px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${
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
