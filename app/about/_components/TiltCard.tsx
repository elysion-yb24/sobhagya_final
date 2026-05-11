"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees. Default 10. */
  max?: number;
  /** translateZ for the content inside (px). Default 30. */
  depth?: number;
  /** Show holographic glare layer. Default true. */
  glare?: boolean;
  /** Wrapper style passthrough. */
  style?: React.CSSProperties;
};

/**
 * Reusable 3D tilt card with mouse-parallax + holographic sheen.
 * Mirrors the spring physics used in ServicesHero3D.
 */
export default function TiltCard({
  children,
  className = "",
  max = 10,
  depth = 30,
  glare = true,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 20, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 150, damping: 20, mass: 0.4 });

  const rotX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-max, max]);

  const glareBg = useTransform<number, string>(
    [sx as MotionValue<number>, sy as MotionValue<number>],
    ([xv, yv]: number[]) => {
      const xp = (xv + 0.5) * 100;
      const yp = (yv + 0.5) * 100;
      return `radial-gradient(circle at ${xp}% ${yp}%, rgba(255,231,181,0.55) 0%, rgba(247,148,29,0.15) 30%, transparent 60%)`;
    }
  );

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onEnter = () => setHovered(true);

  const onLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`relative ${className}`}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      <motion.div
        style={{
          rotateX: reduced ? 0 : rotX,
          rotateY: reduced ? 0 : rotY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full"
      >
        {/* Content with translateZ depth */}
        <div
          style={{
            transform: `translateZ(${depth}px)`,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full h-full"
        >
          {children}
        </div>

        {/* Holographic glare overlay */}
        {glare && !reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              background: glareBg,
              mixBlendMode: "overlay",
              opacity: hovered ? 1 : 0,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
