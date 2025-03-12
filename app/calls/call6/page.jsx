"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call6() {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [meridiem, setMeridiem] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // 12-hour format hours:
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  // Minutes from 0 to 59:
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  // AM/PM options:
  const meridiemOptions = ["AM", "PM"];

  const handleNext = () => {
    if (hour && minute && meridiem) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call7");
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

          {/* Fixed Width & Height */}
          <div className="w-[1140px] h-[600px] px-6 sm:px-8 md:px-16 lg:px-36 py-10 sm:py-14 bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] mb-10 text-3xl sm:text-4xl md:text-5xl">
              Enter Your Details
            </h1>

            {/* Progress Bar (4/7 dots filled) */}
            <div className="relative mb-10 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[57.1%]"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[-6px]">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < 4 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form className="flex flex-col flex-grow items-center justify-center">
              <h2 className="text-2xl sm:text-3xl font-normal text-center text-[#373737] mb-12">
                Enter Your Time of Birth
              </h2>

              {/* Time Selection (Hour, Minute, AM/PM) */}
              <div className="mb-14 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
                {/* Hour Dropdown */}
                <div className="relative w-full md:w-48">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="w-full h-[50px] sm:h-[55px] px-4 py-2 bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F7971E]"
                  >
                    <option value="" disabled>
                      Hour
                    </option>
                    {hourOptions.map((h) => (
                      <option key={`hour-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minute Dropdown */}
                <div className="relative w-full md:w-48">
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-full h-[50px] sm:h-[55px] px-4 py-2 bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F7971E]"
                  >
                    <option value="" disabled>
                      Minute
                    </option>
                    {minuteOptions.map((m) => (
                      <option key={`minute-${m}`} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AM/PM Dropdown */}
                <div className="relative w-full md:w-48">
                  <select
                    value={meridiem}
                    onChange={(e) => setMeridiem(e.target.value)}
                    className="w-full h-[50px] sm:h-[55px] px-4 py-2 bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F7971E]"
                  >
                    <option value="" disabled>
                      AM/PM
                    </option>
                    {meridiemOptions.map((mer) => (
                      <option key={mer} value={mer}>
                        {mer}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hour || !minute || !meridiem}
                  className={`w-64 px-12 py-3 text-white font-medium rounded-md transition-all ${
                    hour && minute && meridiem
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
