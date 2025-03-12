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
          className="min-h-screen flex items-center justify-center px-4"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {/* Fixed Width & Height (1140px width, 600px height) */}
          <div className="w-[1140px] h-[600px] px-6 sm:px-8 md:px-16 lg:px-36 py-10 sm:py-16 bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] mb-10 text-2xl sm:text-3xl md:text-4xl">
              Enter Your Details
            </h1>

            {/* Progress Bar */}
            <div className="relative mb-10 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[14.28%]"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[-6px]">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === 0 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form className="flex flex-col flex-grow items-center justify-center">
              <h2 className="text-2xl sm:text-3xl font-normal text-center text-[#373737] mb-14">
                Who Are You Seeking Guidance For?
              </h2>

              {/* Radio Buttons (Styled like Call5) */}
              <div className="flex flex-wrap justify-center gap-20 mb-14">
                {/* Myself Option */}
                <label className="flex items-center cursor-pointer">
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
                      <div className="w-3.5 h-3.5 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl text-[#373737] ml-3 sm:ml-4">Myself</span>
                </label>

                {/* Someone Else Option */}
                <label className="flex items-center cursor-pointer">
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
                      <div className="w-3.5 h-3.5 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl text-[#373737] ml-3 sm:ml-4">Someone Else</span>
                </label>
              </div>

              {/* Next Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className={`w-64 px-12 py-3 text-white font-medium rounded-md transition-all ${
                    selectedOption
                      ? "bg-[#F7971E] hover:bg-[#e7891a]"
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
