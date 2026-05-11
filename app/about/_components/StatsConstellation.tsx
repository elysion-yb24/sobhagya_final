"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Users, Star, Sparkles, Headphones, type LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
};

const STATS: Stat[] = [
  { icon: Users,      value: 10000, suffix: "+",  label: "Happy Users" },
  { icon: Sparkles,   value: 500,   suffix: "+",  label: "Expert Astrologers" },
  { icon: Headphones, value: 50000, suffix: "+",  label: "Consultations" },
  { icon: Star,       value: 4.8,   suffix: "★",  label: "App Rating", decimals: 1 },
];

function formatNumber(n: number, decimals = 0) {
  if (n >= 1000 && decimals === 0) {
    return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  }
  return n.toFixed(decimals);
}

function Counter({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{formatNumber(val, decimals)}</span>;
}

export default function StatsConstellation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
    >
      {/* Layered dark cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a00] via-[#2d1400] to-[#1a0a00]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(247,148,29,0.45) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,215,0,0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Floating amber orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/30"
            style={{
              width: `${4 + (i % 4) * 3}px`,
              height: `${4 + (i % 4) * 3}px`,
              left: `${(i * 17.3 + 5) % 100}%`,
              top: `${(i * 23.7 + 10) % 100}%`,
              filter: "blur(2px)",
            }}
            animate={{ y: [-10, -30, -10], opacity: [0.15, 0.7, 0.15] }}
            transition={{
              duration: 4 + (i % 4) * 1.2,
              repeat: Infinity,
              delay: (i % 6) * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Constellation SVG — connecting lines */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="constLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F7B23A" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F7B23A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 125 150 L 375 150 L 625 150 L 875 150"
          fill="none"
          stroke="url(#constLine)"
          strokeWidth="1"
          strokeDasharray="3 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
        />
        {[125, 375, 625, 875].map((x) => (
          <motion.circle
            key={x}
            cx={x}
            cy={150}
            r={3}
            fill="#FFD700"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.4 + (x / 1000) * 0.4 }}
          />
        ))}
      </svg>

      <div className="relative z-10 section-container py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl p-[1.2px] group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(247,148,29,0.8), rgba(255,213,138,0.4) 50%, rgba(247,148,29,0.6))",
                }}
              >
                <div
                  className="relative h-full rounded-[14px] px-5 py-6 flex flex-col items-center text-center gap-3 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(40,20,6,0.96), rgba(18,9,2,0.98))",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.06), 0 14px 32px -18px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* hover glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(70% 80% at 50% 0%, rgba(247,148,29,0.25), transparent 70%)",
                    }}
                  />

                  <span
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(247,148,29,0.3), rgba(255,213,138,0.18))",
                      border: "1px solid rgba(255,213,138,0.45)",
                      color: "#FFE7B5",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.18), 0 0 18px rgba(247,148,29,0.25)",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>

                  <div
                    className="text-3xl sm:text-4xl md:text-5xl font-bold leading-none"
                    style={{
                      fontFamily: "'EB Garamond', serif",
                      backgroundImage:
                        "linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 50%, #F7B23A 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <Counter to={s.value} decimals={s.decimals} />
                    <span>{s.suffix}</span>
                  </div>

                  <div
                    className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold"
                    style={{ color: "rgba(255,231,181,0.78)", fontFamily: "Poppins" }}
                  >
                    {s.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
