"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { OmRoundel } from "./Ornaments";

/**
 * Focused cosmic yantra centerpiece for the services hero.
 *
 * Composition:
 *  - Three concentric rotating rings (sacred geometry feel)
 *  - 6 orbiting service icon medallions placed around the outer ring
 *  - Glowing central Om roundel with pulsing aura
 *  - Mouse-parallax 3D tilt with spring physics
 *  - Twinkling starfield + periodic shooting star
 *
 * Uses real PNG/SVG service icons so there are no
 * Unicode/emoji fallback rendering issues.
 */

type Orb = { img: string; label: string; color: string };

const ORBITERS: Orb[] = [
  { img: "/Group 13384.png", label: "Kundli",     color: "#F7B23A" },
  { img: "/Group 13383.png", label: "Vastu",      color: "#E27D60" },
  { img: "/Group 13385.png", label: "Crystal",    color: "#B7A6E6" },
  { img: "/Group 13386.png", label: "Dosh",       color: "#C9A961" },
  { img: "/Group 13387.png", label: "Palm",       color: "#E6B97A" },
  { img: "/Group 13388.png", label: "Lal Kitab",  color: "#D88A52" },
];

export default function ServicesHero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 });
  const rotX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-12, 12]);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const stars = React.useMemo(
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
      onMouseMove={reduced ? undefined : onMove}
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
            "radial-gradient(45% 45% at 50% 50%, rgba(247,148,29,0.32) 0%, rgba(247,148,29,0.08) 45%, transparent 75%)",
          filter: "blur(20px)",
        }}
      />

      {/* twinkling starfield */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-amber-100"
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

      {/* delicate diagonal shooting stars (replaces the chunky horizontal streak) */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "12%", left: "-10%", angle: 18, len: 70, dur: 2.2, delay: 0,  gap: 9 },
          { top: "62%", left: "-10%", angle: 14, len: 55, dur: 2.6, delay: 4,  gap: 11 },
          { top: "30%", left: "110%", angle: 200, len: 60, dur: 2.4, delay: 6.5, gap: 10 },
        ].map((s, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: s.left,
              width: s.len,
              height: 1,
              transform: `rotate(${s.angle}deg)`,
              transformOrigin: "left center",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,235,190,0.0) 5%, rgba(255,235,190,0.85) 70%, rgba(255,255,255,1) 100%)",
              filter: "drop-shadow(0 0 4px rgba(255,210,130,0.85))",
              borderRadius: 1,
            }}
            animate={{
              x: s.angle > 90 ? ["0%", "-260%"] : ["0%", "260%"],
              y: s.angle > 90 ? ["0%", "-60%"] : ["0%", "60%"],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: s.dur,
              repeat: Infinity,
              repeatDelay: s.gap,
              delay: s.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* faint constellation accent — subtle connecting lines + bright nodes */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      >
        <g stroke="rgba(255,225,170,0.25)" strokeWidth="0.4" fill="none">
          <line x1="40" y1="60" x2="95" y2="40" />
          <line x1="95" y1="40" x2="135" y2="78" />
          <line x1="320" y1="320" x2="360" y2="290" />
          <line x1="360" y1="290" x2="345" y2="245" />
        </g>
        {[
          [40, 60], [95, 40], [135, 78],
          [320, 320], [360, 290], [345, 245],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={1.4}
            fill="rgba(255,235,190,0.95)"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* 3D stage */}
      <motion.div
        style={{
          rotateX: reduced ? 0 : rotX,
          rotateY: reduced ? 0 : rotY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-[230px] h-[230px] xs:w-[260px] xs:h-[260px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px]"
      >
        {/* SACRED GEOMETRY YANTRA — SVG behind everything */}
        <motion.svg
          aria-hidden
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full text-amber-300"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          style={{ transform: "translateZ(-20px)", opacity: 0.55 }}
        >
          <defs>
            <radialGradient id="yantraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F7B23A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F7B23A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="190" fill="url(#yantraGlow)" />
          <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.55" />
          <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" strokeDasharray="3 4" />
          {/* eight-petal lotus */}
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
          {/* triangles forming star */}
          <polygon points="200,90 290,250 110,250" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
          <polygon points="200,310 290,150 110,150" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
        </motion.svg>

        {/* OUTER RING — tick marks counter-rotating */}
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
              border: "1px solid rgba(255,213,138,0.35)",
              boxShadow: "0 0 30px rgba(247,148,29,0.15) inset",
            }}
          />
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 360) / 60;
            const major = i % 5 === 0;
            return (
              <div
                key={i}
                className="absolute inset-0"
                style={{ transform: `rotate(${a}deg)` }}
              >
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-[1px]"
                  style={{
                    width: major ? 2 : 1,
                    height: major ? 9 : 4,
                    background: major
                      ? "rgba(255,213,138,0.85)"
                      : "rgba(255,213,138,0.35)",
                    borderRadius: 1,
                  }}
                />
              </div>
            );
          })}
        </motion.div>

        {/* MIDDLE RING — dashed */}
        <div
          aria-hidden
          className="absolute inset-[14%] rounded-full"
          style={{
            border: "1px dashed rgba(255,213,138,0.32)",
            transform: "translateZ(10px)",
          }}
        />

        {/* INNER GLOW RING */}
        <div
          aria-hidden
          className="absolute inset-[26%] rounded-full"
          style={{
            border: "1px solid rgba(255,213,138,0.5)",
            boxShadow:
              "0 0 30px rgba(247,148,29,0.25), inset 0 0 30px rgba(247,148,29,0.15)",
            transform: "translateZ(20px)",
          }}
        />

        {/* ORBITING SERVICE ICONS — slow clockwise rotation */}
        <motion.div
          className="absolute inset-0"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          style={{ transform: "translateZ(40px)" }}
        >
          {ORBITERS.map((o, i) => {
            const angle = (i * 360) / ORBITERS.length;
            return (
              <div
                key={i}
                className="absolute inset-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                {/* counter-rotate so icons stay upright */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 -top-1"
                  animate={reduced ? undefined : { rotate: -360 }}
                  transition={{
                    duration: 80,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <OrbiterMedallion orb={o} index={i} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Pulsing core aura */}
        <motion.div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(80px)" }}
        >
          <div
            className="w-[50%] h-[50%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,213,138,0.75) 0%, rgba(247,148,29,0.32) 30%, transparent 65%)",
              filter: "blur(18px)",
            }}
          />
        </motion.div>

        {/* CENTRAL OM */}
        <motion.div
          animate={{ y: reduced ? 0 : [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(110px)" }}
        >
          {/* rotating ring around Om */}
          <motion.div
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full"
            style={{
              width: 130,
              height: 130,
              border: "1.5px solid rgba(255,213,138,0.6)",
              boxShadow: "0 0 24px rgba(247,148,29,0.45)",
            }}
          >
            {/* 4 ornament dots on the ring */}
            {[0, 90, 180, 270].map((a) => (
              <span
                key={a}
                className="absolute left-1/2 top-0 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300"
                style={{
                  transform: `rotate(${a}deg) translateY(-3px)`,
                  transformOrigin: "0 65px",
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
            <OmRoundel
              size={96}
              className="relative ring-2 ring-amber-300/55 shadow-[0_14px_50px_rgba(247,148,29,0.55)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function OrbiterMedallion({ orb, index }: { orb: Orb; index: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, y: -3 }}
      animate={{ y: [0, -3, 0] }}
      transition={{
        y: {
          duration: 3 + (index % 3) * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.25,
        },
      }}
      className="relative flex items-center justify-center cursor-pointer group"
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 25%, #FFFCF1 0%, #FFEED0 60%, #FFE3A8 100%)",
        border: `1.5px solid ${orb.color}`,
        boxShadow: `0 0 20px ${orb.color}66, inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(170,100,20,0.18)`,
      }}
    >
      <Image
        src={orb.img}
        alt={orb.label}
        width={30}
        height={30}
        className="object-contain pointer-events-none"
      />
      {/* tooltip */}
      <span
        className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-semibold tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          color: orb.color,
          background: "rgba(10,5,2,0.9)",
          border: `1px solid ${orb.color}66`,
        }}
      >
        {orb.label}
      </span>
    </motion.div>
  );
}
