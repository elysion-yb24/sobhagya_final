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
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[57.1%]"></div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-between absolute w-full top-[-6px] -left-1 -right-1">
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
                <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
              </div>
            </div>

            <form>
              <h2 className="text-3xl font-normal text-center text-[#373737] mb-16">
                Do you know your time of Birth ?
              </h2>

              <div className="flex justify-center space-x-16 mb-10">
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
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    knowBirthTime === "yes" ? "border-[#F7971E]" : "border-gray-400"
                  }`}>
                    {knowBirthTime === "yes" && (
                      <div className="w-3 h-3 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-xl text-[#373737]">Yes</span>
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
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    knowBirthTime === "no" ? "border-[#F7971E]" : "border-gray-400"
                  }`}>
                    {knowBirthTime === "no" && (
                      <div className="w-3 h-3 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-xl text-[#373737]">No</span>
                </label>
              </div>

              <div className="flex justify-center mb-16">
                <p className="text-center text-gray-500 max-w-2xl">
                  Note: Accurate predictions are possible even without birth time—astrology can 
                  reveal up to 80% of your life's key insights and guidance.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={knowBirthTime === null}
                  className={`px-12 py-3 text-white font-normal rounded-md transition-all ${
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