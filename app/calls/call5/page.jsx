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
        
        if (knowBirthTime === "yes") {
          router.push("/calls/call6");
        } else {
          router.push("/calls/call7");
        }
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

          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-6xl 
                         h-auto md:h-auto lg:h-auto
                         px-4 sm:px-6 md:px-8 lg:px-16 
                         py-6 sm:py-8 md:py-10
                         bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 
                         flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] 
                          mb-6 sm:mb-8 md:mb-10 
                          text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Enter Your Details
            </h1>

            {/* Progress Bar (4/7 dots filled) */}
            <div className="relative mb-10 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[57.1%]"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[0.5px] transform -translate-y-1/2">
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
              {/* Decreased size of "Do you know your time of Birth?" */}
              <h2 className="text-2xl sm:text-3xl font-normal text-center text-[#373737] mb-12">
                Do you know your time of Birth?
              </h2>

              {/* Radio Buttons */}
              <div className="flex flex-wrap justify-center gap-20 mb-10">
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
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      knowBirthTime === "yes" ? "border-[#F7971E] scale-110" : "border-gray-400"
                    }`}
                  >
                    {knowBirthTime === "yes" && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl text-[#373737] ml-3 sm:ml-4">Yes</span>
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
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      knowBirthTime === "no" ? "border-[#F7971E] scale-110" : "border-gray-400"
                    }`}
                  >
                    {knowBirthTime === "no" && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#F7971E]"></div>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl text-[#373737] ml-3 sm:ml-4">No</span>
                </label>
              </div>

              {/* Note Section */}
              <div className="flex justify-center mb-10 sm:mb-14">
                <p
                  className="text-gray-500 max-w-sm sm:max-w-2xl text-[15px] leading-[20px] text-center"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: 400,
                    letterSpacing: "1%",
                  }}
                >
                  Note: Accurate predictions are possible even without birth time—astrology can
                  reveal up to 80% of your life's key insights and guidance.
                </p>
              </div>

              {/* Next Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={knowBirthTime === null}
                  className={`w-64 px-12 py-3 text-white font-medium rounded-md transition-all ${
                    knowBirthTime !== null
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