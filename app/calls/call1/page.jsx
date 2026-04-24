"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call1() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [checkingExistingUser, setCheckingExistingUser] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const astrologerId = searchParams.get("astrologerId");

  useEffect(() => {
    if (astrologerId) {
      localStorage.setItem("selectedAstrologerId", astrologerId);
      console.log("Stored astrologer ID for call flow:", astrologerId);
    }
  }, [astrologerId]);

  // Existing users (name already stored in localStorage or the user profile)
  // should skip this onboarding step entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pickName = () => {
      const direct = localStorage.getItem("userName");
      if (direct && direct.trim()) return direct.trim();

      try {
        const raw = localStorage.getItem("userDetails");
        if (!raw) return null;
        const u = JSON.parse(raw);
        const candidate =
          u?.name ||
          u?.displayName ||
          [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
        if (candidate && String(candidate).trim()) return String(candidate).trim();
      } catch {}
      return null;
    };

    const existingName = pickName();
    if (existingName) {
      localStorage.setItem("userName", existingName);
      setIsExiting(true);
      // Use replace so the back button doesn't bounce them onto this form again.
      router.replace("/calls/call9");
      return;
    }
    setCheckingExistingUser(false);
  }, [router]);

  const handleNameChange = (e) => {
    let value = e.target.value;
    setName(value);
  
    const nameRegex = /^[A-Za-z\s]+$/;
    if (value.trim().length < 2) {
      setError("Name must be at least 2 characters long");
    } else if (!nameRegex.test(value)) {
      setError("Only letters and spaces are allowed");
    } else {
      setError("");
    }
  };

  const handleNext = () => {
    if (name.trim() && !error) {
      localStorage.setItem("userName", name.trim());
      // Skip all other steps and go directly to the final completion logic in call9
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call9");
      }, 100);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 md:px-9 overflow-hidden">
      <AnimatePresence mode="wait">
        {!isExiting && !checkingExistingUser && (
          <motion.div
            key="call1-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1100px] bg-[#FCF4E9] rounded-lg p-6 sm:p-8 md:p-20 shadow-md h-[512px] flex flex-col justify-center items-center"
          >
            <Head>
              <title>Enter Your Details</title>
              <meta name="description" content="Enter your name to continue" />
            </Head>

            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-medium font-['Poppins'] text-center text-gray-800 text-2xl sm:text-3xl mb-8"
            >
              Enter Your Name
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-md"
            >
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Full Name"
                className={`w-full h-16 px-6 bg-white rounded-xl border-2 transition-all duration-300 text-lg ${
                  error ? "border-red-500" : "border-gray-200 focus:border-[#F7971D]"
                } outline-none`}
              />
              {error && <p className="text-red-500 text-sm mt-2 ml-2">{error}</p>}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12"
            >
              <button
                type="button"
                onClick={handleNext}
                disabled={!name.trim() || !!error}
                className={`w-[200px] h-[60px] text-white font-semibold rounded-lg text-xl transition-all duration-300 ${
                  name.trim() && !error
                    ? "bg-[#F7971D] hover:bg-[#E88A1A] shadow-lg"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
