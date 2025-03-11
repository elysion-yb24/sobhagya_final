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
          className="min-h-screen flex items-center justify-center px-4"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="w-full max-w-lg md:max-w-3xl lg:max-w-6xl p-6 md:p-12 lg:p-24 bg-[#fcf4e9] rounded-lg shadow-lg">
            <h1 className="font-medium text-center text-[#373737] mb-6 md:mb-8 text-2xl md:text-3xl">
              Enter Your Details
            </h1>

            <div className="relative mb-10 md:mb-12 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[42.9%]"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[-6px] left-0 right-0">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < 3 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form>
              <h2 className="text-xl md:text-2xl font-normal text-center text-[#373737] mb-10 md:mb-16">
                Select Your Birth Date
              </h2>

              <div className="mb-10 md:mb-16 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                {/* Date Dropdown */}
                <div className="relative w-full md:w-40">
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 py-2 bg-white rounded-lg border cursor-pointer focus:outline-none"
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
                    className="w-full h-12 md:h-14 px-4 py-2 bg-white rounded-lg border cursor-pointer focus:outline-none"
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
                <div className="relative w-full md:w-40">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 py-2 bg-white rounded-lg border cursor-pointer focus:outline-none"
                  >
                    <option value="" disabled>Year</option>
                    {yearOptions.map((y) => (
                      <option key={`year-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!date || !month || !year}
                  className={`px-8 md:px-12 py-3 text-white font-medium rounded-md transition-all ${
                    date && month && year
                      ? "bg-[#F7971E] hover:bg-[#d99845]"
                      : "bg-gray-400 cursor-not-allowed"
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
