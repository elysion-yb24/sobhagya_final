"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";

/**
 * Premium 3D-tilt card with mouse-tracked parallax.
 * Children sit on top of a translucent gilded surface with a glowing border.
 */
export default function Tilt3DCard({
  children,
  className = "",
  glow = "rgba(247,148,29,0.55)",
  intensity = 12,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 180, damping: 18, mass: 0.4 });

  const rotX = useTransform(sy, [-0.5, 0.5], [intensity, -intensity]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-intensity, intensity]);

  // sheen position (px, py 0..1)
  const px = useTransform(sx, [-0.5, 0.5], [0, 100]);
  const py = useTransform(sy, [-0.5, 0.5], [0, 100]);
  const sheen = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(220px circle at ${x}% ${y}%, ${glow}, transparent 60%)`
  );

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className={`relative ${className}`}
    >
      {children}

      {/* moving sheen */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: sheen,
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}
