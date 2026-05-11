"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CosmicScene = dynamic(() => import("./CosmicScene"), {
  ssr: false,
  loading: () => null,
});

const TAG = "Discover Our Story";
const TITLE = "About Us";
const SUBTITLE = "Your trusted companion for cosmic wisdom, spiritual guidance, and astrological insights.";

/** Letter-by-letter reveal helper. */
function SplitText({
  text,
  className,
  style,
  baseDelay = 0,
  perChar = 0.04,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  baseDelay?: number;
  perChar?: number;
}) {
  return (
    <span className={className} style={style} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: 24, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: baseDelay + i * perChar,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "50% 100%" }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function AboutHero3D() {
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    setMounted(true);
  }, []);

  return (
    <motion.section
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Layered background — gradient + SVG fallback */}
      <div className="absolute inset-0">
        <Image
          src="/abour-hero-bg.svg"
          alt=""
          fill
          className="object-cover opacity-50"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,5,2,0.85) 0%, rgba(26,10,0,0.75) 40%, rgba(15,7,0,0.92) 100%)",
          }}
        />
      </div>

      {/* WebGL cosmic scene (skips on reduced motion) */}
      {mounted && !reduced && (
        <div className="absolute inset-0 pointer-events-none">
          <CosmicScene />
        </div>
      )}

      {/* Static SVG starfield fallback for reduced motion */}
      {reduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-amber-100"
              style={{
                width: `${1 + ((i * 7) % 3)}px`,
                height: `${1 + ((i * 7) % 3)}px`,
                left: `${(i * 17.3) % 100}%`,
                top: `${(i * 23.7) % 100}%`,
                opacity: 0.35 + ((i % 5) * 0.12),
                boxShadow: "0 0 6px rgba(255,225,170,0.6)",
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 py-16 sm:py-20 md:py-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span
            className="inline-block text-xs sm:text-sm font-semibold tracking-[0.32em] uppercase mb-5"
            style={{
              background: "linear-gradient(90deg, #FFE7B5, #FFD700, #F7941D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {TAG}
          </span>
        </motion.div>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight"
          style={{
            fontFamily: "'EB Garamond', serif",
            textShadow:
              "0 4px 30px rgba(247,148,29,0.45), 0 0 60px rgba(255,215,0,0.25)",
            perspective: 800,
          }}
        >
          <SplitText text={TITLE} baseDelay={0.3} perChar={0.07} />
        </h1>

        <motion.p
          className="mt-5 text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
        >
          {SUBTITLE}
        </motion.p>

        {/* Animated chevron pair */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div
            className="mx-auto w-6 h-10 border-2 border-amber-300/40 rounded-full flex items-start justify-center p-1"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <div className="w-1.5 h-2.5 bg-amber-300/80 rounded-full" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 4, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
              <path
                d="M2 2L9 8L16 2"
                stroke="#FFD700"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
