"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useScrollParallax } from "@/app/hooks/useScrollParallax";

interface HoroscopeItem {
  img: string;
  label: string;
  desc: string;
  cta: string;
}

const items: HoroscopeItem[] = [
  {
    img: "/daily-horoscope.svg",
    label: "Today's Horoscope",
    desc: "Your stars right now — love, work, health for the next 24 hours.",
    cta: "Read today",
  },
  {
    img: "/tomorrows-horoscope.svg",
    label: "Tomorrow Horoscope",
    desc: "Plan ahead — moods, opportunities and warnings for tomorrow.",
    cta: "See tomorrow",
  },
  {
    img: "/weekly-horoscope.svg",
    label: "Weekly Horoscope",
    desc: "The 7-day arc — career moves, money matters and key dates.",
    cta: "Read this week",
  },
  {
    img: "/monthly-horoscope.svg",
    label: "Monthly Horoscope",
    desc: "Your month-long forecast across love, finance and wellbeing.",
    cta: "Open the month",
  },
  {
    img: "/yearly-horoscope.svg",
    label: "Yearly Horoscope",
    desc: "The full annual map — major transits and turning points.",
    cta: "Open the year",
  },
];

const HoroscopeInsights: React.FC = () => {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const [isMobile, setIsMobile] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Parallax on the sacred divider
  const { ref: dividerRef, y: dividerY } = useScrollParallax(0.2);

  const handleNavigate = () => {
    router.push("/services/horoscope");
  };

  return (
    <section className="min-h-[250px] sm:min-h-[300px] section-spacing relative overflow-hidden om-watermark">
      <div className="section-container relative z-10">
        <h2 className="section-heading text-[#745802] text-center mb-3 sm:mb-4">
          Horoscope Insights
        </h2>
        <motion.div
          ref={dividerRef as React.RefObject<HTMLDivElement>}
          className="sacred-divider mx-auto max-w-[100px] sm:max-w-[120px] mb-4 sm:mb-6"
          style={{ y: dividerY }}
        />
        <p
          className="mb-8 sm:mb-10 md:mb-12 text-gray-600 text-sm sm:text-base md:text-lg text-center max-w-xl sm:max-w-2xl mx-auto font-medium px-2"
          style={{ fontFamily: "Poppins" }}
        >
          Get accurate daily, weekly, and yearly horoscope predictions to guide your life&apos;s journey
        </p>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4 xs:gap-5 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {items.map((item, i) => {
            const isFlipped = flippedIndex === i;

            const onActivate = () => {
              if (reduced) {
                handleNavigate();
                return;
              }
              if (isMobile) {
                setFlippedIndex(isFlipped ? null : i);
              } else {
                handleNavigate();
              }
            };

            return (
              <motion.div
                key={item.label}
                className={`flip-card relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] rounded-2xl ${
                  isFlipped ? "is-flipped" : ""
                }`}
                style={{ height: "180px" }}
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={`${item.label} — ${item.desc}`}
                onClick={onActivate}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onActivate();
                  }
                  if (e.key === "Escape") setFlippedIndex(null);
                }}
                onMouseEnter={() => {
                  if (!reduced && !isMobile) setFlippedIndex(i);
                }}
                onMouseLeave={() => {
                  if (!reduced && !isMobile && flippedIndex === i)
                    setFlippedIndex(null);
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 18,
                  delay: i * 0.06,
                }}
              >
                <div className="flip-card-inner">
                  {/* FRONT */}
                  <div className="flip-card-face flex flex-col items-center justify-center bg-white rounded-2xl border border-orange-100 shadow-md p-3 relative overflow-hidden">
                    {/* animated gradient border */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 animate-gradient-shift"
                      style={{
                        padding: "1.5px",
                        background:
                          "linear-gradient(120deg, #F7941D, #ECB212, #F7941D, #ECB212)",
                        WebkitMask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />
                    <div className="w-14 xs:w-16 sm:w-20 h-14 xs:h-16 sm:h-20 mb-2 sm:mb-3 flex items-center justify-center">
                      <Image
                        src={item.img}
                        alt={item.label}
                        width={70}
                        height={70}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm font-semibold text-center px-1">
                      {item.label}
                    </p>
                  </div>

                  {/* BACK */}
                  <div
                    className="flip-card-face flip-card-back rounded-2xl shadow-lg p-3 flex flex-col items-center justify-center text-center text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #F7941D 0%, #ECB212 100%)",
                    }}
                  >
                    <p className="text-[10px] sm:text-xs leading-snug mb-2 px-1 opacity-95">
                      {item.desc}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate();
                      }}
                      className="text-[10px] sm:text-xs font-bold bg-white text-[#7A4A0F] px-3 py-1.5 rounded-full shadow hover:scale-105 transition-transform"
                    >
                      {item.cta} →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HoroscopeInsights;
