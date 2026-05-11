"use client";

import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Magnetic button — gently follows the cursor when nearby. */
function MagneticButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [reduced, setReduced] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    x.set(dx * 0.25);
    y.set(dy * 0.25);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="relative inline-flex items-center gap-2 font-semibold px-9 py-4 rounded-full text-sm sm:text-base text-white overflow-hidden group"
    >
      {/* Animated gradient background */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #F7941D 0%, #FFD700 30%, #F7941D 60%, #FFD700 100%)",
          backgroundSize: "200% 100%",
          boxShadow:
            "0 10px 30px rgba(247,148,29,0.45), 0 0 0 1px rgba(255,213,138,0.4) inset",
        }}
        animate={reduced ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner shimmer on hover */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), transparent 60%)",
        }}
      />
      <span className="relative z-10">{children}</span>
      <svg
        className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </motion.a>
  );
}

export default function AuroraCTA() {
  return (
    <motion.section
      className="relative py-14 sm:py-20 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7 }}
    >
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1400] to-[#0f0700]" />

      {/* Animated aurora mesh — 3 drifting radial gradients */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          inset: "-20%",
          background:
            "radial-gradient(35% 35% at 30% 30%, rgba(247,148,29,0.45) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ x: ["-5%", "10%", "-5%"], y: ["-5%", "10%", "-5%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          inset: "-20%",
          background:
            "radial-gradient(40% 40% at 70% 60%, rgba(255,215,0,0.35) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
        animate={{ x: ["5%", "-10%", "5%"], y: ["8%", "-8%", "8%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          inset: "-20%",
          background:
            "radial-gradient(35% 35% at 50% 80%, rgba(139,69,19,0.45) 0%, transparent 70%)",
          filter: "blur(22px)",
        }}
        animate={{ x: ["-3%", "8%", "-3%"], y: ["3%", "-6%", "3%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sunburst rays anchored bottom-center */}
      <svg
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none"
        width="900"
        height="400"
        viewBox="0 0 900 400"
        style={{ opacity: 0.15 }}
      >
        <defs>
          <radialGradient id="rayFade" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g fill="url(#rayFade)">
          {Array.from({ length: 18 }).map((_, i) => {
            const a = -90 + (i - 9) * 9;
            return (
              <polygon
                key={i}
                points="450,400 446,0 454,0"
                transform={`rotate(${a} 450 400)`}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/25"
            style={{
              width: `${2 + (i % 5)}px`,
              height: `${2 + (i % 5)}px`,
              left: `${(i * 17.3) % 100}%`,
              top: `${(i * 23.7) % 100}%`,
              filter: i % 3 === 0 ? "blur(1px)" : undefined,
            }}
            animate={{ y: [-6, -28, -6], opacity: [0.1, 0.7, 0.1] }}
            transition={{
              duration: 4 + (i % 4) * 1.2,
              repeat: Infinity,
              delay: (i % 6) * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span
            className="inline-block text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-5"
            style={{
              background: "linear-gradient(90deg, #FFE7B5, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Begin Your Journey
          </span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight"
          style={{ fontFamily: "'EB Garamond', serif" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Embrace the Power of Astrology with{" "}
          <motion.span
            style={{
              backgroundImage: "linear-gradient(135deg, #F7941D, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
            }}
            animate={{
              textShadow: [
                "0 0 20px rgba(247,148,29,0.3)",
                "0 0 35px rgba(255,215,0,0.6)",
                "0 0 20px rgba(247,148,29,0.3)",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Sobhagya
          </motion.span>
        </motion.h2>

        <motion.p
          className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          From love and relationships to career growth and financial stability — expert
          astrology services tailored to your needs. Your gateway to a brighter future!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <MagneticButton href="/call-with-astrologer">
            Talk to an Astrologer
          </MagneticButton>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 border border-white/25 text-white/85 hover:text-white hover:border-amber-300/60 font-medium px-9 py-4 rounded-full transition-all duration-300 text-sm sm:text-base hover:bg-white/5 backdrop-blur-sm"
          >
            Explore Services
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
