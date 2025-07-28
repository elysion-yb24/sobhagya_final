"use client";
import { RashiSign } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const HoroscopeInsights: React.FC = () => {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Faded astrology icon background (optional) */}
      <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <Image src="/sobhagya_logo.avif" alt="Astrology Icon" width={400} height={400} className="object-contain" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 my-8 lg:my-16 relative z-10">
        <h2
          className="mb-4 text-[#745802] text-4xl md:text-5xl lg:text-6xl text-center font-extrabold tracking-tight"
          style={{ fontFamily: "EB Garamond", letterSpacing: "1%" }}
        >
          Horoscope Insights
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h2>
        <p 
          className="mb-12 text-[#745802] text-lg md:text-xl text-center max-w-2xl mx-auto font-medium"
          style={{ fontFamily: "Poppins", lineHeight: '1.5', letterSpacing: "0%" }}
        >
          Get accurate daily, weekly, and yearly horoscope predictions to guide your life's journey
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">
          {[
            { img: "/Group 13373.png", label: "Today's Horoscope" },
            { img: "/Group 13374.png", label: "Tomorrow's Horoscope" },
            { img: "/Group 13375.png", label: "Weekly Horoscope" },
            { img: "/Group 13376.png", label: "Monthly Horoscope" },
            { img: "/Group 13377.png", label: "Yearly Horoscope" },
          ].map((item, idx) => (
            <div key={item.label} className="flex flex-col items-center animate-fade-in-up">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 relative rounded-2xl shadow-lg flex items-center justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
              <Image 
                  src={item.img}
                  alt={item.label}
                fill
                className="object-contain"
              />
            </div>
              <p className="mt-4 text-gray-700 text-center text-base sm:text-lg font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Fade-in animation keyframes */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HoroscopeInsights; 