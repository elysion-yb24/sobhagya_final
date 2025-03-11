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
        router.push("/call2");
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

          <div className="w-full max-w-6xl p-36 bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200">
            <h1 className="font-medium text-center text-[#373737] mb-8 text-3xl">
              Enter Your Details
            </h1>

            <div className="relative mb-12 flex items-center">
          {/* Extended Progress Bar */}
          <div className="h-[2px] bg-[#b4b4b4] w-[calc(100%+16px)] mx-[-10px] rounded-full">
            <div className="h-[2px] bg-[#F7971E] rounded-full w-1/7"></div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-between absolute w-full top-[-6px] -left-1 -right-1">
            <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
          </div>
        </div>

            <form>
              <h2 className="text-xl font-medium text-center text-[#373737] mb-6">
                Who Are You Seeking Guidance For?
              </h2>

              <div className="flex justify-center space-x-12 mb-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-5 w-5 accent-[#F7971E]"
                    name="guidance"
                    value="myself"
                    checked={selectedOption === "myself"}
                    onChange={() => handleOptionChange("myself")}
                  />
                  <span className="ml-2 text-base font-medium text-[#373737]">
                    Myself
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-5 w-5 accent-[#F7971E]"
                    name="guidance"
                    value="someone_else"
                    checked={selectedOption === "someone_else"}
                    onChange={() => handleOptionChange("someone_else")}
                  />
                  <span className="ml-2 text-base font-medium text-[#373737]">
                    Someone else
                  </span>
                </label>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className={`px-8 py-3 text-white font-medium rounded-md transition-all ${
                    selectedOption ? "bg-[#F7971E] hover:bg-[#e7891a]" : "bg-gray-400 cursor-not-allowed"
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
