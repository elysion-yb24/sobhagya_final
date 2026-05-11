"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import BlogFloatingDecor from "./BlogFloatingDecor";

const TAG = "Sobhagya Blog";
const TITLE_LINE_1 = "Astrology Insights";
const TITLE_LINE_2 = "& Cosmic Wisdom";
const SUBTITLE =
  "Explore articles on horoscopes, gemstones, tarot, and cosmic wisdom to guide your spiritual journey.";

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
          initial={{ opacity: 0, y: 28, rotateX: -50 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.65,
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

export default function BlogHero3D() {
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
      {/* Layered cosmic background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0410 0%, #1a0a2e 35%, #2d1654 70%, #1a0e2e 100%)",
        }}
      />

      {/* Soft amber wash at top */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-[20%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 right-[15%] w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Concentric mystical rings */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] border border-amber-300 rounded-full"
          style={{ animation: "blog-spin 110s linear infinite" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-orange-400 rounded-full"
          style={{ animation: "blog-spin 80s linear infinite reverse" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-amber-200 rounded-full"
          style={{ animation: "blog-spin 60s linear infinite" }}
        />
      </div>

      {/* Blog-themed floating decor (books, pages, quill) */}
      {mounted && !reduced && <BlogFloatingDecor />}

      {/* Static SVG starfield fallback */}
      {reduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-amber-100"
              style={{
                width: `${1 + ((i * 7) % 3)}px`,
                height: `${1 + ((i * 7) % 3)}px`,
                left: `${(i * 17.3) % 100}%`,
                top: `${(i * 23.7) % 100}%`,
                opacity: 0.35 + (i % 5) * 0.12,
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
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 py-20 sm:py-24 md:py-28 lg:py-32 text-center px-4">
        {/* Decorative top icon */}
        <motion.div
          className="mb-6 inline-flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            <motion.span
              aria-hidden
              className="absolute inset-0 -m-6 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(247,148,29,0.6), transparent 70%)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #FFFCF1 0%, #FFEED0 40%, #F7B23A 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 12px rgba(170,100,20,0.35), 0 8px 24px -4px rgba(247,148,29,0.55)",
                border: "1.5px solid #C7831A",
              }}
            >
              <BookOpen className="w-7 h-7 sm:w-9 sm:h-9 text-[#3a2208]" strokeWidth={2.2} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <span
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.32em] uppercase mb-5"
            style={{
              background: "linear-gradient(90deg, #FFE7B5, #FFD700, #F7941D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {TAG}
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </span>
        </motion.div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          style={{
            fontFamily: "'EB Garamond', serif",
            perspective: 900,
          }}
        >
          <span
            className="block"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 45%, #FFE7B5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow:
                "0 4px 30px rgba(247,148,29,0.35), 0 0 60px rgba(255,215,0,0.22)",
            }}
          >
            <SplitText text={TITLE_LINE_1} baseDelay={0.45} perChar={0.05} />
          </span>
          <span
            className="block mt-1 sm:mt-2"
            style={{
              background:
                "linear-gradient(90deg, #F7941D 0%, #FFD700 50%, #F7941D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 4px 30px rgba(247,148,29,0.45)",
            }}
          >
            <SplitText text={TITLE_LINE_2} baseDelay={1.1} perChar={0.05} />
          </span>
        </h1>

        <motion.p
          className="mt-7 text-sm sm:text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed font-poppins px-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.85 }}
        >
          {SUBTITLE}
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 2.05 }}
        >
          <div className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400 to-amber-400 rounded-full" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="text-amber-300"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <div className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-amber-400 to-amber-400 rounded-full" />
        </motion.div>
      </div>

      {/* Bottom curve transition */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ height: "60px" }}
      >
        <path
          d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z"
          fill="#ffffff"
        />
      </svg>

      <style jsx>{`
        @keyframes blog-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </motion.section>
  );
}
