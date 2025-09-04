"use client";
import { RashiSign } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useState, useEffect } from "react";

const rashiSigns: RashiSign[] = [
  { name: "Aries", hindiName: "मेष", image: "/aries.json" },
  { name: "Taurus", hindiName: "वृषभ", image: "/taurus.json" },
  { name: "Gemini", hindiName: "मिथुन", image: "/gemini (1).json" },
  { name: "Cancer", hindiName: "कर्क", image: "/cancer.json" },
  { name: "Leo", hindiName: "सिंह", image: "/leo.json" },
  { name: "Virgo", hindiName: "कन्या", image: "/virgo.json" },
  { name: "Libra", hindiName: "तुला", image: "/libra.json" },
  { name: "Scorpio", hindiName: "वृश्चिक", image: "/scorpio.json" },
  { name: "Sagittarius", hindiName: "धनु", image: "/sagittarius.json" },
  { name: "Capricorn", hindiName: "मकर", image: "/capricorn.json" },
  { name: "Aquarius", hindiName: "कुंभ", image: "/aquarius.json" },
  { name: "Pisces", hindiName: "मीन", image: "/pisces.json" },
];

// Component to handle Lottie animation loading
const LottieAnimation: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(src);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimation();
  }, [src]);

  if (loading) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-200 rounded-full">
        <span className="text-xs text-gray-500">?</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

const RashiSection: React.FC = () => {
  const router = useRouter();

  const handleClick = (rashiName: string) => {
    router.push(`/services/horoscope/${rashiName.toLowerCase()}`);
  };

  return (
    <>
      <motion.section className="bg-[#E691261A] py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
          <Image src="/sobhagya-logo.svg" alt="Astrology Icon" width={300} height={300} className="object-contain" />
        </div>
        <div className="container mx-auto px-4 relative z-10 max-w-screen-xl">
          <h2 className="text-center mb-4 sm:mb-6 text-[#373737] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "EB Garamond" }}>
            Astrology Insights for Your Rashi Today
            <span className="block w-20 sm:w-24 h-1 bg-orange-400 mx-auto mt-3 rounded-full"></span>
          </h2>
          <p className="text-center mb-10 sm:mb-12 text-[#373737] text-base sm:text-lg font-medium px-2 sm:px-0">
            Get accurate predictions, guidance, and remedies for love, career, health, and more
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
            {rashiSigns.map((rashi) => (
              <motion.div
                key={rashi.name}
                onClick={() => handleClick(rashi.name)}
                className="bg-white p-4 sm:p-6 shadow-md cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg group relative animate-fade-in-up"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-2 flex items-center justify-center mx-auto">
                  <LottieAnimation
                    src={rashi.image || "/default-image.png"}
                    alt={rashi.name}
                  />
                </div>
                <div className="text-[#373737] text-sm sm:text-base font-medium mb-1 text-center">{rashi.hindiName}</div>
                <div className="text-[#373737] text-xs font-medium text-center">{rashi.name}</div>
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
      </motion.section>
    </>
  );
};

export default RashiSection;

