"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  max?: number; // max tilt in degrees
  scale?: number;
  glare?: boolean;
  perspective?: number;
}

/**
 * Pointer-tracked 3D tilt wrapper.
 * Pure CSS perspective + framer-motion springs. No external deps.
 */
export default function TiltCard({
  children,
  className = "",
  max = 12,
  scale = 1.02,
  glare = true,
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 200,
    damping: 18,
  });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 200,
    damping: 18,
  });

  const glareX = useTransform(x, [-0.5, 0.5], ["20%", "80%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["20%", "80%"]);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255,236,180,0.55), transparent 55%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onLeave}
      style={{
        perspective,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <motion.div
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full will-change-transform"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={{
              opacity: hovered ? 0.55 : 0,
              transition: "opacity 0.4s ease",
              background: glareBg,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
