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

  // Generate date options (1-31)
  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Generate month options
  const monthOptions = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate year options (from current year - 100 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 100 }, 
    (_, i) => currentYear - i
  );

  const handleNext = () => {
    if (date && month && year) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/call5");
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-screen flex items-center justify-center"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="w-full max-w-6xl p-24 bg-[#fcf4e9]">
            <h1 className="font-medium text-center text-[#373737] mb-8 text-3xl">
              Enter Your Details
            </h1>

            <div className="relative mb-12 flex items-center">
              {/* Extended Progress Bar */}
              <div className="h-[2px] bg-[#b4b4b4] w-[calc(100%+16px)] mx-[-10px] rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[42.9%]"></div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-between absolute w-full top-[-6px] -left-1 -right-1">
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
              </div>
            </div>

            <form>
              <h2 className="text-3xl font-normal text-center text-[#373737] mb-16">
                Select Your Birth Date
              </h2>

              <div className="mb-16 flex justify-center space-x-4">
                {/* Date Dropdown */}
                <div className="relative w-40">
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-14 px-4 py-2 bg-white rounded-lg appearance-none cursor-pointer focus:outline-none"
                  >
                    <option value="" disabled>Date</option>
                    {dateOptions.map((d) => (
                      <option key={`date-${d}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Month Dropdown */}
                <div className="relative w-40">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full h-14 px-4 py-2 bg-white rounded-lg appearance-none cursor-pointer focus:outline-none"
                  >
                    <option value="" disabled>Month</option>
                    {monthOptions.map((m, index) => (
                      <option key={`month-${index}`} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Year Dropdown */}
                <div className="relative w-40">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-14 px-4 py-2 bg-white rounded-lg appearance-none cursor-pointer focus:outline-none"
                  >
                    <option value="" disabled>Year</option>
                    {yearOptions.map((y) => (
                      <option key={`year-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!date || !month || !year}
                  className={`px-12 py-3 text-white font-normal rounded-md transition-all ${
                    date && month && year ? "bg-[#F7971E] hover:bg-[#d99845]" : "bg-gray-400 cursor-not-allowed"
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