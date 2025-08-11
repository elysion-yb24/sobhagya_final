"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const HoroscopeInsights: React.FC = () => {
  return (
    <section className="min-h-[300px] py-20 sm:py-28 relative overflow-hidden">


      <div className="container mx-auto px-4 relative z-10 max-w-screen-xl">
        <h2
          className="mb-4 text-[#745802] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-extrabold tracking-tight"
          style={{ fontFamily: "EB Garamond" }}
        >
          Horoscope Insights
        </h2>
        <p 
          className="mb-10 sm:mb-12 text-gray-600 text-sm sm:text-base md:text-lg text-center max-w-xl sm:max-w-2xl mx-auto font-medium px-2"
          style={{ fontFamily: "Poppins" }}
        >
          Get accurate daily, weekly, and yearly horoscope predictions to guide your life's journey
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {[
            { img: "/Group 13373.png", label: "Today's Horoscope" },
            { img: "/Group 13374.png", label: "Tomorrow Horoscope" },
            { img: "/Group 13375.png", label: "Weekly Horoscope" },
            { img: "/Group 13376.png", label: "Monthly Horoscope" },
            { img: "/Group 13377.png", label: "Yearly Horoscope" },
          ].map((item) => (
            <motion.div 
              key={item.label} 
              className="flex flex-col items-center animate-fade-in-up"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 sm:w-20 h-16 sm:h-20 mb-3 flex items-center justify-center">
                <Image 
                  src={item.img}
                  alt={item.label}
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-700 text-xs sm:text-sm font-medium text-center px-1">{item.label}</p>
            </motion.div>
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
