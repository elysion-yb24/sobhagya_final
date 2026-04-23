"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call9() {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Automatically complete the profile when this page is reached
    handleComplete();
  }, []);

  const handleComplete = () => {
    const userName = localStorage.getItem("userName");
    
    const formData = {
      astrologerId: localStorage.getItem("selectedAstrologerId"),
      name: userName,
      // Other fields are now optional/removed
    };

    console.log("Completing profile with data:", formData);

    // Update user details in localStorage to mark profile as completed
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      try {
        const userDetails = JSON.parse(storedUserDetails);
        const nameParts = (userName || "").split(' ');
        const updatedUserDetails = {
          ...userDetails,
          name: userName,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          displayName: userName,
          profileCompleted: true,
          updatedAt: new Date().getTime()
        };
        localStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
        
        // Also store in sessionStorage for the login process to pick up
        sessionStorage.setItem('capturedUserName', userName || "");
      } catch (e) {
        console.error('❌ Error updating user details:', e);
      }
    }

    // Short delay to show a "Processing" state if needed, then redirect
    setIsExiting(true);
    setTimeout(() => {
      router.push("/login");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Head>
              <title>Processing...</title>
            </Head>
            <div className="w-16 h-16 border-4 border-[#F7971D] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Finalizing your profile...</h2>
            <p className="text-gray-500 mt-2">Just a moment while we set things up for you.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
