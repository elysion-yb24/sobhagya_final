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
  const [dobError, setDobError] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    const storedAstrologerId = localStorage.getItem("selectedAstrologerId");
    if (storedAstrologerId) {
      console.log("Call4: Found stored astrologer ID:", storedAstrologerId);
    } else {
      console.log("Call4: No stored astrologer ID found");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Function to validate date of birth
  const validateDateOfBirth = () => {
    if (!date || !month || !year) {
      return false;
    }

    // Convert month name to month number
    const monthMap = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    const selectedDate = new Date(year, monthMap[month], date);
    const currentDate = new Date();
    
    // Reset time to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > currentDate) {
      setDobError("Date of birth cannot be in the future");
      return false;
    }

    // Check if date is valid (e.g., Feb 30 doesn't exist)
    if (selectedDate.getDate() !== date || selectedDate.getMonth() !== monthMap[month] || selectedDate.getFullYear() !== year) {
      setDobError("Invalid date selected");
      return false;
    }

    setDobError("");
    return true;
  };

  const handleNext = () => {
    if (validateDateOfBirth()) {
      const fullDate = `${date} ${month} ${year}`;
      localStorage.setItem("userDateOfBirth", fullDate);
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
    if (dropdownType === "date") setDate(value);
    if (dropdownType === "month") setMonth(value);
    if (dropdownType === "year") setYear(value);
    setOpenDropdown(null);
    
    // Clear error when user makes a new selection
    if (dobError) {
      setDobError("");
    }
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
              className="font-medium font-['Poppins'] text-center text-gray-800 text-xl sm:text-2xl mb-4 sm:mb-6 md:mb-8 mt-[20px] sm:mt-[30px] md:mt-[50px]"
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
                    className={`w-3 h-3 rounded-full ${index < 3 ? "bg-[#F7971D]" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            </motion.div>


            {/* Question */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-6 sm:mb-8 mt-6 sm:mt-8 px-2"
            >
              Select Your Birth Date
            </motion.h2>

            {/* Date Inputs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 mt-6 sm:mt-8"
            >
              {/* Date */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown("date")}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${date ? "border-[#F7971D] text-gray-700" : "border-gray-200 text-gray-400"
                    }`}
                >
                  <span>{date ? date.toString().padStart(2, "0") : "Date"}</span>
                  {openDropdown === "date" ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openDropdown === "date" && (
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
                          onClick={() => selectOption("date", d)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {d.toString().padStart(2, "0")}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Month */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown("month")}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${month ? "border-[#F7971D] text-gray-700" : "border-gray-200 text-gray-400"
                    }`}
                >
                  <span>{month || "Month"}</span>
                  {openDropdown === "month" ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openDropdown === "month" && (
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
                          onClick={() => selectOption("month", m)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-base sm:text-lg font-medium"
                        >
                          {m}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Year */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => toggleDropdown("year")}
                  className={`w-24 h-14 sm:h-16 px-4 py-2 sm:py-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg font-medium flex items-center justify-between ${year ? "border-[#F7971D] text-gray-700" : "border-gray-200 text-gray-400"
                    }`}
                >
                  <span>{year || "Year"}</span>
                  {openDropdown === "year" ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openDropdown === "year" && (
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
                          onClick={() => selectOption("year", y)}
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

            {/* Error Message */}
            {dobError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4"
              >
                <span className="text-red-500 text-sm font-medium px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                  {dobError}
                </span>
              </motion.div>
            )}

            {/* Next Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center mt-2 sm:mt-4"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!date || !month || !year || dobError}
                className={`w-[185px] h-[62px] text-white font-semibold rounded-lg text-lg transition-all duration-300 ${date && month && year && !dobError
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
