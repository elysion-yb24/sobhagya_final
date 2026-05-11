"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import ZodiacIcon, { ZodiacName } from "./ZodiacIcon";

const ZODIAC: { name: ZodiacName }[] = [
  { name: "Aries" },
  { name: "Taurus" },
  { name: "Gemini" },
  { name: "Cancer" },
  { name: "Leo" },
  { name: "Virgo" },
  { name: "Libra" },
  { name: "Scorpio" },
  { name: "Sagittarius" },
  { name: "Capricorn" },
  { name: "Aquarius" },
  { name: "Pisces" },
];

export default function IntroYantra() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 });
  const rotX = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-14, 14]);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const stars = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        top: `${(i * 41 + 9) % 100}%`,
        left: `${(i * 53 + 17) % 100}%`,
        size: (i % 3) + 1,
        delay: (i % 8) * 0.4,
        duration: 2.4 + (i % 4) * 0.7,
      })),
    []
  );

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative w-full flex items-center justify-center"
      style={{ perspective: 1400 }}
    >
      {/* ambient golden aura */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(247,148,29,0.28) 0%, rgba(247,148,29,0.06) 45%, transparent 75%)",
          filter: "blur(24px)",
        }}
      />

      {/* twinkling starfield */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-amber-200"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              boxShadow: "0 0 5px rgba(255,225,170,0.85)",
            }}
            animate={{ opacity: [0.15, 0.95, 0.15] }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3D stage */}
      <motion.div
        style={{
          rotateX: reduced ? 0 : rotX,
          rotateY: reduced ? 0 : rotY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px]"
      >
        {/* Sacred geometry yantra — slow rotation */}
        <motion.svg
          aria-hidden
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full text-amber-400"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          style={{ transform: "translateZ(-20px)", opacity: 0.55 }}
        >
          <defs>
            <radialGradient id="introYantraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F7B23A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F7B23A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="190" fill="url(#introYantraGlow)" />
          <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.55" />
          <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" strokeDasharray="3 4" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 360) / 8;
            return (
              <path
                key={i}
                d="M200 70 Q 220 130 200 200 Q 180 130 200 70 Z"
                fill="currentColor"
                opacity="0.10"
                transform={`rotate(${a} 200 200)`}
              />
            );
          })}
          <polygon points="200,90 290,250 110,250" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
          <polygon points="200,310 290,150 110,150" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
        </motion.svg>

        {/* Outer tick ring — counter-rotates */}
        <motion.div
          aria-hidden
          className="absolute inset-[3%]"
          animate={reduced ? undefined : { rotate: -360 }}
          transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
          style={{ transform: "translateZ(0px)" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(255,213,138,0.4)",
              boxShadow: "0 0 30px rgba(247,148,29,0.18) inset",
            }}
          />
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 360) / 60;
            const major = i % 5 === 0;
            return (
              <div key={i} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-[1px]"
                  style={{
                    width: major ? 2 : 1,
                    height: major ? 9 : 4,
                    background: major ? "rgba(255,213,138,0.85)" : "rgba(255,213,138,0.35)",
                    borderRadius: 1,
                  }}
                />
              </div>
            );
          })}
        </motion.div>

        {/* Middle dashed ring */}
        <div
          aria-hidden
          className="absolute inset-[12%] rounded-full"
          style={{
            border: "1px dashed rgba(255,213,138,0.35)",
            transform: "translateZ(10px)",
          }}
        />

        {/* Inner glow ring */}
        <div
          aria-hidden
          className="absolute inset-[22%] rounded-full"
          style={{
            border: "1px solid rgba(255,213,138,0.55)",
            boxShadow:
              "0 0 30px rgba(247,148,29,0.28), inset 0 0 30px rgba(247,148,29,0.18)",
            transform: "translateZ(20px)",
          }}
        />

        {/* 12 zodiac medallions orbiting */}
        <motion.div
          className="absolute inset-0"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          style={{ transform: "translateZ(40px)" }}
        >
          {ZODIAC.map((z, i) => {
            const angle = (i * 360) / ZODIAC.length;
            return (
              <div key={i} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 -top-1"
                  animate={reduced ? undefined : { rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                >
                  <ZodiacMedallion zodiac={z} index={i} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Pulsing core aura */}
        <motion.div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(70px)" }}
        >
          <div
            className="w-[55%] h-[55%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,213,138,0.8) 0%, rgba(247,148,29,0.35) 30%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />
        </motion.div>

        {/* Central Sobhagya logo */}
        <motion.div
          animate={{ y: reduced ? 0 : [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(110px)" }}
        >
          {/* Rotating ring around logo */}
          <motion.div
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full"
            style={{
              width: "55%",
              height: "55%",
              border: "1.5px solid rgba(255,213,138,0.55)",
              boxShadow: "0 0 24px rgba(247,148,29,0.4)",
            }}
          >
            {[0, 90, 180, 270].map((a) => (
              <span
                key={a}
                className="absolute left-1/2 top-0 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300"
                style={{
                  transform: `rotate(${a}deg) translateY(-3px)`,
                  transformOrigin: "0 80px",
                  boxShadow: "0 0 8px #F7B23A",
                }}
              />
            ))}
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: "rgba(247,148,29,0.55)" }}
            />
            <div
              className="relative w-[42%] h-[42%] min-w-[110px] min-h-[110px] rounded-full overflow-hidden ring-2 ring-amber-300/55 shadow-[0_14px_50px_rgba(247,148,29,0.55)] bg-white/95 flex items-center justify-center"
              style={{ aspectRatio: "1/1", width: 130, height: 130 }}
            >
              <Image
                src="/sobhagya-logo.svg"
                alt="Sobhagya"
                width={120}
                height={120}
                className="w-full h-full object-contain p-3"
                priority
                quality={100}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ZodiacMedallion({
  zodiac,
  index,
}: {
  zodiac: { name: ZodiacName };
  index: number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.35, y: -4 }}
      animate={{ y: [0, -3, 0] }}
      transition={{
        y: {
          duration: 3 + (index % 3) * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.18,
        },
      }}
      className="relative flex items-center justify-center cursor-pointer group"
      style={{ width: 42, height: 42 }}
      title={zodiac.name}
    >
      {/* soft amber halo (only on hover) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-50%] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle, rgba(255,213,138,0.7) 0%, rgba(247,148,29,0.25) 35%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* twinkling star above */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -7,
          left: "50%",
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#FFE7B5",
          boxShadow: "0 0 8px #FFD700",
          translate: "-50% 0",
        }}
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.5, 0.7] }}
        transition={{
          duration: 2.4 + (index % 3) * 0.5,
          repeat: Infinity,
          delay: (index % 5) * 0.4,
          ease: "easeInOut",
        }}
      />

      {/* the glyph — crisp SVG, gold with breathing glow */}
      <motion.span
        aria-hidden
        className="relative inline-flex items-center justify-center"
        style={{
          color: "#F7B23A",
          filter:
            "drop-shadow(0 0 5px rgba(247,148,29,0.85)) drop-shadow(0 0 12px rgba(255,213,138,0.45))",
        }}
        animate={{
          filter: [
            "drop-shadow(0 0 5px rgba(247,148,29,0.7)) drop-shadow(0 0 12px rgba(255,213,138,0.35))",
            "drop-shadow(0 0 10px rgba(255,215,0,1)) drop-shadow(0 0 22px rgba(255,213,138,0.7))",
            "drop-shadow(0 0 5px rgba(247,148,29,0.7)) drop-shadow(0 0 12px rgba(255,213,138,0.35))",
          ],
        }}
        transition={{
          duration: 3.5 + (index % 4) * 0.5,
          repeat: Infinity,
          delay: index * 0.18,
          ease: "easeInOut",
        }}
      >
        <ZodiacIcon name={zodiac.name} size={30} strokeWidth={2.2} />
      </motion.span>

      {/* tooltip */}
      <span
        className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          color: "#FFE7B5",
          background: "rgba(10,5,2,0.92)",
          border: "1px solid rgba(247,178,58,0.5)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {zodiac.name}
      </span>
    </motion.div>
  );
}
