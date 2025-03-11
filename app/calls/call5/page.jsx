"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call5() {
  const [knowBirthTime, setKnowBirthTime] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleOptionChange = (option) => {
    setKnowBirthTime(option);
  };

  const handleNext = () => {
    if (knowBirthTime !== null) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call6");
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
          className="min-h-screen flex items-center justify-center px-4 sm:px-8"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="w-full max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl bg-[#fcf4e9] p-6 sm:p-12 md:p-24 rounded-lg shadow-md">
            <h1 className="font-medium text-center text-[#373737] mb-6 sm:mb-8 text-2xl sm:text-3xl">
              Enter Your Details
            </h1>

            <div className="relative mb-8 sm:mb-12 flex items-center">
              {/* Progress Bar */}
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[57.1%]"></div>
              </div>

              {/* Progress Dots */}
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

            <form>
              <h2 className="text-2xl sm:text-3xl font-normal text-center text-[#373737] mb-10 sm:mb-16">
                Do you know your time of Birth?
              </h2>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-16 mb-10">
                {/* Yes Option */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="hidden"
                    name="birthTime"
                    value="yes"
                    checked={knowBirthTime === "yes"}
                    onChange={() => handleOptionChange("yes")}
                  />
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                      knowBirthTime === "yes" ? "border-[#F7971E]" : "border-gray-400"
                    }`}
                  >
                    {knowBirthTime === "yes" && (
                      <div className="w-3 h-3 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl text-[#373737] ml-2 sm:ml-3">Yes</span>
                </label>

                {/* No Option */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="hidden"
                    name="birthTime"
                    value="no"
                    checked={knowBirthTime === "no"}
                    onChange={() => handleOptionChange("no")}
                  />
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                      knowBirthTime === "no" ? "border-[#F7971E]" : "border-gray-400"
                    }`}
                  >
                    {knowBirthTime === "no" && (
                      <div className="w-3 h-3 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl text-[#373737] ml-2 sm:ml-3">No</span>
                </label>
              </div>

              <div className="flex justify-center mb-10 sm:mb-16">
                <p className="text-center text-gray-500 max-w-sm sm:max-w-2xl text-sm sm:text-base">
                  Note: Accurate predictions are possible even without birth time—astrology can
                  reveal up to 80% of your life's key insights and guidance.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={knowBirthTime === null}
                  className={`px-6 sm:px-12 py-2 sm:py-3 text-white font-normal rounded-md transition-all ${
                    knowBirthTime !== null ? "bg-[#F7971E] hover:bg-[#d99845]" : "bg-gray-400 cursor-not-allowed"
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
