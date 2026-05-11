"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Sparkles, MessageCircle } from "lucide-react";

/**
 * Cosmic hero for the contact page:
 *  - Deep cosmic gradient with parallax twinkling stars
 *  - Slow-rotating concentric rings + sacred-geometry yantra glyph
 *  - Floating gilded orbs at varied depths (parallax)
 *  - Mouse-tracked subtle tilt of the title
 *  - Shimmer title with shooting star
 */

type ParallaxProps = {
  sx: MotionValue<number>;
  sy: MotionValue<number>;
};

function ParallaxStar({
  sx,
  sy,
  top,
  left,
  size,
  delay,
  duration,
  depth,
}: ParallaxProps & {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  depth: number;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [-8 * depth, 8 * depth]);
  const y = useTransform(sy, [-0.5, 0.5], [-6 * depth, 6 * depth]);
  return (
    <motion.span
      className="absolute rounded-full bg-amber-100"
      style={{
        top,
        left,
        width: size,
        height: size,
        boxShadow: "0 0 6px rgba(255,225,170,0.85)",
        x,
        y,
      }}
      animate={{ opacity: [0.15, 0.95, 0.15] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function ParallaxOrb({
  sx,
  sy,
  color,
  size,
  top,
  left,
  depth,
  index,
  reduced,
}: ParallaxProps & {
  color: string;
  size: number;
  top: string;
  left: string;
  depth: number;
  index: number;
  reduced: boolean;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [-22 * depth, 22 * depth]);
  const y = useTransform(sy, [-0.5, 0.5], [-18 * depth, 18 * depth]);
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        top,
        left,
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, #FFFCF1 0%, ${color} 55%, #5a2a04 100%)`,
        boxShadow: `0 18px 40px -10px ${color}aa, inset 0 -8px 18px rgba(120,55,0,0.35), inset 0 4px 8px rgba(255,255,255,0.35)`,
        x,
        y,
      }}
      animate={reduced ? undefined : { y: [0, -10 - index * 1.5, 0] }}
      transition={{
        duration: 4.5 + index * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.25,
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          width: "30%",
          height: "20%",
          top: "12%",
          left: "20%",
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.85), transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </motion.div>
  );
}

export default function ContactCosmicHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const haloX = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const haloY = useTransform(sy, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const stars = React.useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        top: `${(i * 41 + 9) % 100}%`,
        left: `${(i * 53 + 17) % 100}%`,
        size: (i % 3) + 1,
        delay: (i % 8) * 0.4,
        duration: 2.4 + (i % 4) * 0.7,
        depth: (i % 3) + 1,
      })),
    []
  );

  const orbs = [
    { color: "#F7B23A", size: 90,  top: "18%", left: "12%", depth: 1.2 },
    { color: "#FFD58A", size: 56,  top: "70%", left: "8%",  depth: 0.7 },
    { color: "#E8850B", size: 110, top: "62%", left: "82%", depth: 1.6 },
    { color: "#FFE7B5", size: 44,  top: "20%", left: "78%", depth: 0.9 },
    { color: "#B86A0B", size: 70,  top: "82%", left: "55%", depth: 1.1 },
    { color: "#FFD700", size: 36,  top: "32%", left: "48%", depth: 0.5 },
  ];

  return (
    <section
      ref={wrapRef}
      onMouseMove={reduced ? undefined : onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden"
      style={{
        perspective: 1400,
        background:
          "linear-gradient(180deg, #0a0410 0%, #1a0a2e 40%, #2d1654 75%, #1a0e2e 100%)",
      }}
    >
      {/* aurora wash */}
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "rgba(247,148,29,0.18)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-[15%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(247,148,29,0.10)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 right-[10%] w-[420px] h-[420px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(170,90,255,0.18)" }}
      />

      {/* twinkling parallax starfield */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s, i) => (
          <ParallaxStar key={i} sx={sx} sy={sy} {...s} />
        ))}
      </div>

      {/* shooting star */}
      <motion.span
        aria-hidden
        className="absolute h-[2px] w-[120px] rounded-full"
        style={{
          top: "26%",
          left: "-15%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,235,190,1), transparent)",
          filter: "drop-shadow(0 0 10px rgba(255,210,130,0.95))",
        }}
        animate={{ x: ["0%", "900%"], opacity: [0, 1, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 6,
          ease: "easeOut",
        }}
      />

      {/* concentric rings */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ border: "1px solid rgba(255,213,138,0.18)" }}
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ border: "1px dashed rgba(255,213,138,0.22)" }}
          animate={reduced ? undefined : { rotate: -360 }}
          transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ border: "1px solid rgba(255,213,138,0.32)" }}
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* floating 3D orbs (parallax) */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {orbs.map((o, i) => (
          <ParallaxOrb
            key={i}
            sx={sx}
            sy={sy}
            color={o.color}
            size={o.size}
            top={o.top}
            left={o.left}
            depth={o.depth}
            index={i}
            reduced={reduced}
          />
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-4 py-16 sm:py-20 lg:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-5"
        >
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,212,140,0.16), rgba(247,148,29,0.16))",
              border: "1px solid rgba(255,212,140,0.45)",
              color: "#FFE7B5",
              backdropFilter: "blur(6px)",
            }}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            We&apos;re Listening
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
        </motion.div>

        <motion.div
          style={{
            rotateX: reduced ? 0 : rotX,
            rotateY: reduced ? 0 : rotY,
            transformStyle: "preserve-3d",
          }}
          className="relative inline-block"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(247,148,29,0.45), transparent 70%)",
              x: haloX,
              y: haloY,
            }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative font-bold tracking-tight leading-[1.05]"
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "clamp(48px, 11vw, 110px)",
            }}
          >
            <span className="relative inline-block">
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 40%, #FFE7B5 70%, #F7B23A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow:
                    "0 4px 30px rgba(247,148,29,0.4), 0 0 60px rgba(255,215,0,0.25)",
                }}
              >
                Contact Us
              </span>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ x: "-120%" }}
                animate={{ x: "120%" }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.6) 50%, transparent 65%)",
                  mixBlendMode: "overlay",
                }}
              />
            </span>
          </motion.h1>
        </motion.div>

        <motion.div
          className="mt-7 flex items-center justify-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400 to-amber-400 rounded-full" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="text-amber-300"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.div>
          <div className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-amber-400 to-amber-400 rounded-full" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          style={{
            color: "rgba(255,240,210,0.82)",
            fontFamily: "Poppins",
          }}
        >
          Reach out for consultations, inquiries, or support. Our Vedic experts
          respond within hours — your cosmic guide is one message away.
        </motion.p>
      </div>

      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ height: 60 }}
      >
        <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="#FFFDF9" />
      </svg>
    </section>
  );
}
