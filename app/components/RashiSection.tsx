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
      <motion.section className="bg-gradient-to-br from-orange-50 via-white to-white/80 py-20 relative overflow-hidden">
        {/* Faded astrology icon background (optional) */}
        <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
          <Image src="/monk logo.png" alt="Astrology Icon" width={400} height={400} className="object-contain" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center mb-6 text-[#745802] text-5xl font-extrabold tracking-tight" style={{ fontFamily: "EB Garamond" }}>
            Astrology Insights for Your Rashi
            <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
          </h2>
          <p className="text-center mb-12 text-[#745802] text-lg font-medium">
            Get accurate predictions, guidance, and remedies for love, career, health, and more
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 max-w-6xl mx-auto">
            {rashiSigns.map((rashi, idx) => (
              <motion.div
                key={rashi.name}
                onClick={() => handleClick(rashi.name)}
                className="bg-white p-7 rounded-2xl flex flex-col items-center justify-center shadow-xl border-t-8 border-orange-200 cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group relative animate-fade-in-up"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.2 }}
                style={{ boxShadow: '0 8px 32px 0 rgba(247,151,30,0.10)' }}
              >
                <div className="w-16 h-16 mb-2">
                  <Image src={rashi.image || "/default-image.png"} alt={rashi.name} width={64} height={64} />
                </div>
                <div className="text-gray-700 text-xl font-bold mb-2 mt-3">{rashi.hindiName}</div>
                <div className="text-gray-600 text-base font-medium">{rashi.name}</div>
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
