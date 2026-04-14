"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const HoroscopeInsights: React.FC = () => {
  const router = useRouter();
  
  const handleHoroscopeClick = (type: string) => {
    router.push('/services/horoscope');
  };
  
  return (
    <section className="min-h-[250px] sm:min-h-[300px] section-spacing relative overflow-hidden om-watermark">


      <div className="section-container relative z-10">
        <h2 className="section-heading text-[#745802] text-center mb-3 sm:mb-4">
          Horoscope Insights
        </h2>
        <div className="sacred-divider mx-auto max-w-[100px] sm:max-w-[120px] mb-4 sm:mb-6" />
        <p 
          className="mb-8 sm:mb-10 md:mb-12 text-gray-600 text-sm sm:text-base md:text-lg text-center max-w-xl sm:max-w-2xl mx-auto font-medium px-2"
          style={{ fontFamily: "Poppins" }}
        >
          Get accurate daily, weekly, and yearly horoscope predictions to guide your life's journey
        </p>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4 xs:gap-5 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {[
            { img: "/daily-horoscope.svg", label: "Today's Horoscope" },
            { img: "/tomorrows-horoscope.svg", label: "Tomorrow Horoscope" },
            { img: "/weekly-horoscope.svg", label: "Weekly Horoscope" },
            { img: "/monthly-horoscope.svg", label: "Monthly Horoscope" },
            { img: "/yearly-horoscope.svg", label: "Yearly Horoscope" },
          ].map((item) => (
            <motion.div 
              key={item.label} 
              className="flex flex-col items-center animate-fade-in-up cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleHoroscopeClick(item.label)}
            >
              <div className="w-14 xs:w-16 sm:w-20 h-14 xs:h-16 sm:h-20 mb-2 sm:mb-3 flex items-center justify-center">
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
