"use client";
import { RashiSign } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const HoroscopeInsights: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 my-8 lg:my-16">
        <h2
          className="mb-4 text-[#745802] text-3xl md:text-4xl lg:text-5xl text-center"
          style={{ fontFamily: "EB Garamond", fontWeight: "700", letterSpacing: "1%" }}
        >
          Horoscope Insights
        </h2>
        <p 
          className="mb-8 lg:mb-12 text-[#745802] text-sm md:text-base text-center max-w-2xl mx-auto"
          style={{ fontFamily: "Poppins", fontWeight: "400", lineHeight: '1.5', letterSpacing: "0%" }}
        >
          Get accurate daily, weekly, and yearly horoscope predictions to guide your life's journey
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative">
              <Image 
                src="/Group 13373.png" 
                alt="Today's Horoscope" 
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-gray-700 text-center text-sm sm:text-base">Today's Horoscope</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative">
              <Image 
                src="/Group 13374.png" 
                alt="Tomorrow's Horoscope" 
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-gray-700 text-center text-sm sm:text-base">Tomorrow's Horoscope</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative">
              <Image 
                src="/Group 13375.png" 
                alt="Weekly Horoscope" 
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-gray-700 text-center text-sm sm:text-base">Weekly Horoscope</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative">
              <Image 
                src="/Group 13376.png" 
                alt="Monthly Horoscope" 
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-gray-700 text-center text-sm sm:text-base">Monthly Horoscope</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative">
              <Image 
                src="/Group 13377.png" 
                alt="Yearly Horoscope" 
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-gray-700 text-center text-sm sm:text-base">Yearly Horoscope</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoroscopeInsights;