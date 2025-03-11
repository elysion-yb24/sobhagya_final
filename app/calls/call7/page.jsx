"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call7() {
  const [location, setLocation] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // Example location options – you can customize or dynamically fetch them
  const locationOptions = [
    "Enter Your City",
    "Gurugram, Haryana, India",
    "Delhi, India",
    "Mumbai, India",
    "Bangalore, India",
    "Chennai, India",
    "Kolkata, India",
    "Other"
  ];

  const handleNext = () => {
    // If location is selected, proceed
    if (location) {
      setIsExiting(true);
      setTimeout(() => {
        // Update this route to the next step or final page as required
        router.push("/calls/call8");
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

          <div className="w-full max-w-lg md:max-w-3xl lg:max-w-6xl p-6 md:p-12 lg:p-24 bg-[#fcf4e9] rounded-lg shadow-lg">
            <h1 className="font-medium text-center text-[#373737] mb-6 md:mb-8 text-2xl md:text-3xl">
              Enter Your Details
            </h1>

            {/* Progress Bar */}
            <div className="relative mb-10 md:mb-12 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                {/* 5 out of 7 = 71.4% */}
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[71.4%]"></div>
              </div>
              <div className="flex justify-between absolute w-full top-[-6px] left-0 right-0">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < 5 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form>
              <h2 className="text-xl md:text-2xl font-normal text-center text-[#373737] mb-10 md:mb-16">
                Where were you Born?
              </h2>

              <div className="mb-10 md:mb-16 flex justify-center">
                {/* Single Dropdown for location */}
                <div className="relative w-full md:w-96">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 py-2 bg-white rounded-lg border cursor-pointer focus:outline-none"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!location}
                  className={`px-8 md:px-12 py-3 text-white font-medium rounded-md transition-all ${
                    location
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
