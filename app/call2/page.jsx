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
        router.push("/call3"); 
      }, ); 
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
          className="min-h-screen flex flex-col items-center justify-center"
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
              <h2 className="text-3xl font-normal text-center text-[#373737] mb-4">
                Hey there,
              </h2>
              <h2 className="text-3xl font-normal text-center text-[#373737] mb-10">
                What is your name?
              </h2>

              <div className="mb-14 flex justify-center">
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-[713px] h-[83px] px-4 py-6 bg-white rounded-lg border-none focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!name.trim()}
                  className={`px-12 py-3 text-white font-normal rounded-md transition-all ${
                    name.trim() ? "bg-[#F7971D] hover:bg-[#d99845]" : "bg-gray-400 cursor-not-allowed"
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
