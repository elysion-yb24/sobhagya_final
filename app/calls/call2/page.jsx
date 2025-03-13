"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call2() {
  const [name, setName] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleNext = () => {
    if (name.trim()) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call3");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
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


              {/* Progress Bar with more spacing */}
              <div className="relative mb-10 flex items-center">
                <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                  {/* 2/7 steps complete */}
                  <div className="h-[2px] bg-[#F7971E] rounded-full w-2/7"></div>
                </div>
                <div className="absolute w-full top-[-6px] flex justify-between">
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
                {/* Smaller "Hey there" text */}
                <h2 className="text-lg sm:text-xl font-normal text-center text-[#373737] mb-2">
                  Hey there,
                </h2>
                {/* "What is your name?" remains larger */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-center text-[#373737] mb-8">
                  What is your name?
                </h2>

                <div className="mb-12 flex justify-center">
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full sm:w-[400px] md:w-[500px] lg:w-[713px] h-[40px] sm:h-[50px] md:h-[60px] px-4 py-1 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#F7971E] focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="flex justify-center">
                  {/* Updated button: wider width & consistent styling */}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!name.trim()}
                    className={`w-64 px-12 py-3 text-white font-medium rounded-md transition-all ${
                      name.trim()
                        ? "bg-[#F7971D] hover:bg-[#d99845]"
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
    </div>
  );
}