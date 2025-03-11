"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Call3() {
  const [gender, setGender] = useState(null);

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Head>
        <title>Guidance Form</title>
        <meta name="description" content="Guidance request form" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.div
        className="w-full max-w-6xl p-24 bg-[#fcf4e9]"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <motion.h1
          className="font-medium text-center text-[#373737] mb-8"
          style={{
            fontFamily: "Poppins",
            lineHeight: "29px",
            letterSpacing: "1%",
            fontSize: "35px",
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Enter Your Details
        </motion.h1>

        {/* Progress Bar */}
        <motion.div
          className="relative mb-20 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="h-[2px] bg-[#b4b4b4] w-full mx-[-8px] rounded-full relative">
            <motion.div
              className="h-[2px] bg-[#F7971E] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "14.28%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>

          <div className="flex justify-between absolute w-full top-[-6px] -left-1 -right-1">
            <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
            <div className="w-3 h-3 bg-[#F7971E] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
            <div className="w-3 h-3 bg-[#b4b4b4] rounded-full"></div>
          </div>
        </motion.div>

        <form>
          <motion.h2
            className="text-3xl font-normal text-center text-[#373737] mb-16"
            style={{
              fontFamily: "Poppins",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose Your Gender
          </motion.h2>

          <div className="flex justify-center space-x-48 mb-20">
            {["female", "male", "other"].map((type, index) => (
              <motion.div
                key={type}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div
                  className="mb-4 cursor-pointer transition-transform duration-300 hover:scale-110"
                  onClick={() => handleGenderChange(type)}
                >
                  <Image
                    src={
                      gender === type
                        ? type === "female"
                          ? "/Vector 92 (1).png"
                          : type === "male"
                          ? "/image (16).png"
                          : "/image (15).png"
                        : type === "female"
                        ? "/Vector 92.png"
                        : type === "male"
                        ? "/Vector 93.png"
                        : "/Group 13400.png"
                    }
                    alt={type}
                    width={type === "other" ? 47.08 : 51}
                    height={type === "other" ? 28.74 : 51}
                  />
                </div>
                <div className="text-lg font-normal text-center text-[#373737] mb-3 capitalize">
                  {type}
                </div>
                <motion.div
                  className={`w-6 h-6 rounded-full border-2 border-[#373737] transition-all duration-300 ease-in-out ${
                    gender === type
                      ? "bg-[#e8a757] border-[#e8a757] scale-110"
                      : ""
                  } cursor-pointer`}
                  onClick={() => handleGenderChange(type)}
                  whileTap={{ scale: 0.9 }}
                ></motion.div>
              </motion.div>
            ))}
          </div>

          {/* Next Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href={gender ? "/call4" : "#"} passHref>
              <motion.button
                type="button"
                className={`px-12 py-3 font-semibold rounded-md focus:outline-none transition-all duration-300 ease-in-out transform ${
                  gender
                    ? "bg-[#F7971D] text-white hover:bg-[#d99845] hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                }`}
                disabled={!gender}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
