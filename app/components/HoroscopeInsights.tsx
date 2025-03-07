"use client";
import { RashiSign } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const HoroscopeInsights: React.FC = () => {
  return (
    <>
      <div className="container text-center px-12 my-16">
        <h2
          className="mb-4 text-[#745802] "
          style={{ fontFamily: "EB Garamond", fontWeight: "700", fontSize:"50px",
             lineHeight: '39px', letterSpacing:"1%" }}
        >
          Horoscope Insights
        </h2>
        <p className="mb-12 text-[#745802] text-base "
        style={{ fontFamily: "Poppins", fontWeight: "400", fontSize:"15px",
            lineHeight: '23px', letterSpacing:"0%" }}>
          Get accurate daily, weekly, and yearly horoscope predictions to guide your life’s journey
        </p>

        <div className="flex justify-between  items-center">
          <div className="flex flex-col items-center w-32">
            <Image src="/Group 13373.png" alt="Today's Horoscope" width={120} height={83} />
            <p className="mt-6 text-gray-700 text-center">Today's Horoscope</p>
          </div>
          <div className="flex flex-col items-center w-32">
            <Image src="/Group 13374.png" alt="Tomorrow's Horoscope" width={111} height={96} />
            <p className="mt-6 text-gray-700 text-center">Tomorrow's Horoscope</p>
          </div>
          <div className="flex flex-col items-center w-32">
            <Image src="/Group 13375.png" alt="Weekly Horoscope" width={87} height={92} />
            <p className="mt-6 text-gray-700 text-center">Weekly Horoscope</p>
          </div>
          <div className="flex flex-col items-center w-32">
            <Image src="/Group 13376.png" alt="Monthly Horoscope" width={87} height={92} />
            <p className="mt-6 text-gray-700 text-center">Monthly Horoscope</p>
          </div>
          <div className="flex flex-col items-center w-32">
            <Image src="/Group 13377.png" alt="Yearly Horoscope" width={92} height={92} />
            <p className="mt-6 text-gray-700 text-center">Yearly Horoscope</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoroscopeInsights;
