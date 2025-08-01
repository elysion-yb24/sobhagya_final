"use client";
import { RashiSign } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const rashiSigns: RashiSign[] = [
  { name: "Aries", hindiName: "मेष", image: "/Vector (18).png" },
  { name: "Taurus", hindiName: "वृषभ", image: "/Vector (19).png" },
  { name: "Gemini", hindiName: "मिथुन", image: "/Vector (20).png" },
  { name: "Cancer", hindiName: "कर्क", image: "/Vector (21).png" },
  { name: "Leo", hindiName: "सिंह", image: "/Vector (22).png" },
  { name: "Virgo", hindiName: "कन्या", image: "/Vector (23).png" },
  { name: "Libra", hindiName: "तुला", image: "/Vector (24).png" },
  { name: "Scorpio", hindiName: "वृश्चिक", image: "/Vector (25).png" },
  { name: "Sagittarius", hindiName: "धनु", image: "/Vector (26).png" },
  { name: "Capricorn", hindiName: "मकर", image: "/Vector (27).png" },
  { name: "Aquarius", hindiName: "कुंभ", image: "/Vector (28).png" },
  { name: "Pisces", hindiName: "मीन", image: "/Vector (29).png" },
];

const RashiSection: React.FC = () => {
  const router = useRouter();

  const handleClick = (rashiName: string) => {
    router.push(`/rashi/${rashiName.toLowerCase()}`);
  };

  return (
    <>
      <motion.section className="bg-[#E691261A] py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
          <Image src="/sobhagya_logo.avif" alt="Astrology Icon" width={300} height={300} className="object-contain" />
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 mb-2 flex items-center justify-center mx-auto">
                  <Image
                    src={rashi.image || "/default-image.png"}
                    alt={rashi.name}
                    width={40}
                    height={40}
                    className="object-contain"
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
