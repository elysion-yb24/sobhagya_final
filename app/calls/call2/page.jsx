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
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-screen flex flex-col items-center justify-center px-4"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-6xl p-6 sm:p-12 md:p-16 lg:p-24 bg-[#fcf4e9] rounded-lg shadow-md">
            <h1 className="font-medium text-center text-[#373737] mb-6 text-2xl sm:text-3xl">
              Enter Your Details
            </h1>

            {/* Progress Bar */}
            <div className="relative mb-8 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
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

            <form>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-center text-[#373737] mb-2">
                Hey there,
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-center text-[#373737] mb-6">
                What is your name?
              </h2>

              <div className="mb-8 flex justify-center">
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full sm:w-[400px] md:w-[500px] lg:w-[713px] h-[50px] sm:h-[60px] md:h-[83px] px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#F7971E] focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!name.trim()}
                  className={`px-8 sm:px-12 py-3 text-white font-medium rounded-md transition-all ${
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
  );
}
