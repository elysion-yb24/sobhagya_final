"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Optional: If you want to fetch or import an astrologer name by ID
import astrologersData from "@/app/data/astrologers_data.json";

const radius = 70; // circle radius in px
const circumference = 2 * Math.PI * radius; // perimeter of the circle

export default function CallAstrologerPage() {
  const searchParams = useSearchParams();
  const astrologerId = searchParams.get("id") || "ASTRO_001"; // fallback if none
//   const astrologerName = "John Doe"; // Hard-coded or fetched from your data

//   If you do have data and want the real name:
  const astrologer = astrologersData.find((a) => a.ID === astrologerId);
  const astrologerName = astrologer ? astrologer.Name : "Unknown";

  // ----- Timer State -----
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds
  // We start with offset=0 so the circle is "full" initially
  const [offset, setOffset] = useState(0);

  // ----- On Mount: Start the Countdown -----
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ----- Update Circle Offset -----
  useEffect(() => {
    // fraction goes from 1 (start) down to 0
    const fraction = timeLeft / 120;
    // offset goes from 0 (circle full) to circumference (circle empty)
    const newOffset = circumference * (1 - fraction);
    setOffset(newOffset);
  }, [timeLeft]);

  // ----- Format Time as mm:ss -----
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 shadow-md rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4">
          Wait while we are connecting you to an Astrologer
        </h1>
        <p className="text-gray-700 text-xl mb-6">Calling {astrologerName}</p>

        {/* Circular Countdown */}
        <div className="relative flex justify-center items-center w-40 h-40 mx-auto my-4">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Background circle (light gray) */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#e5e7eb" // Tailwind gray-200
              strokeWidth={10}
              fill="transparent"
            />
            {/* Animated foreground circle (orange) */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#f97316" // Tailwind orange-500
              strokeWidth={10}
              fill="transparent"
              strokeDasharray={circumference}
              // The key for animation:
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          {/* Time Text in the center */}
          <span className="text-2xl font-semibold">{formattedTime}</span>
        </div>

        

        <button
          onClick={() => alert("Ending call...")}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
