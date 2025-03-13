"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call1() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call2");
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
          className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {/* Responsive container instead of fixed dimensions */}
          <div className="w-full max-w-4xl px-4 sm:px-8 md:px-16 py-8 sm:py-12 md:py-16 bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] mb-6 sm:mb-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Enter Your Details
            </h1>

            {/* Progress Bar */}
            <div className="relative mb-8 sm:mb-10 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[14.28%]"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[-6px]">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      index === 0 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form className="flex flex-col flex-grow items-center justify-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-center text-[#373737] mb-8 sm:mb-12 md:mb-14 px-2">
                Who Are You Seeking Guidance For?
              </h2>

              {/* Radio Buttons - Vertical on mobile, horizontal on larger screens */}
              <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-10 md:gap-20 mb-10 sm:mb-14 w-full">
                {/* Myself Option */}
                <label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="radio"
                    className="hidden"
                    name="guidance"
                    value="myself"
                    checked={selectedOption === "myself"}
                    onChange={() => handleOptionChange("myself")}
                  />
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedOption === "myself" ? "border-[#F7971E] scale-110" : "border-gray-400"
                    }`}
                  >
                    {selectedOption === "myself" && (
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-base sm:text-lg md:text-xl text-[#373737] ml-3 sm:ml-4">Myself</span>
                </label>

                {/* Someone Else Option */}
                <label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="radio"
                    className="hidden"
                    name="guidance"
                    value="someone_else"
                    checked={selectedOption === "someone_else"}
                    onChange={() => handleOptionChange("someone_else")}
                  />
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedOption === "someone_else" ? "border-[#F7971E] scale-110" : "border-gray-400"
                    }`}
                  >
                    {selectedOption === "someone_else" && (
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-base sm:text-lg md:text-xl text-[#373737] ml-3 sm:ml-4">Someone Else</span>
                </label>
              </div>

              {/* Next Button */}
              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className={`w-full sm:w-64 px-6 sm:px-12 py-3 text-white font-medium rounded-md transition-all ${
                    selectedOption
                      ? "bg-[#F7971E] hover:bg-[#e7891a] active:bg-[#d57d16]"
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