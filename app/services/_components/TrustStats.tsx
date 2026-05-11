"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, Star, Headphones, ShieldCheck, type LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
};

const STATS: Stat[] = [
  { icon: Users,        value: 50000, suffix: "+",    label: "Consultations" },
  { icon: Star,         value: 4.9,   suffix: "★",    label: "User Rating", decimals: 1 },
  { icon: ShieldCheck,  value: 500,   suffix: "+",    label: "Vedic Experts" },
  { icon: Headphones,   value: 24,    suffix: "/7",   label: "Available" },
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
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{formatNumber(val, decimals)}</span>;
}

export default function TrustStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
    >
      {STATS.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -4 }}
            className="relative rounded-2xl p-[1.2px] group"
            style={{
              background:
                "linear-gradient(135deg, rgba(247,148,29,0.7), rgba(255,213,138,0.35) 50%, rgba(247,148,29,0.5))",
            }}
          >
            <div
              className="relative h-full rounded-[14px] px-4 py-4 sm:px-5 sm:py-5 flex items-center gap-3 sm:gap-4 overflow-hidden"
              style={{
                background:
                  "linear-gradient(160deg, rgba(40,20,6,0.92), rgba(18,9,2,0.95))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 28px -16px rgba(0,0,0,0.7)",
              }}
            >
              {/* hover glow */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(60% 80% at 0% 0%, rgba(247,148,29,0.20), transparent 70%)",
                }}
              />
              <span
                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(247,148,29,0.25), rgba(255,213,138,0.15))",
                  border: "1px solid rgba(255,213,138,0.4)",
                  color: "#FFE7B5",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </span>
              <div className="min-w-0">
                <div
                  className="text-xl sm:text-2xl font-bold leading-none"
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
                  className="mt-1.5 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase font-semibold"
                  style={{ color: "rgba(255,231,181,0.75)", fontFamily: "Poppins" }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
