"use client";

import { useRef } from "react";
import { useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";

interface ParallaxResult {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
  x: MotionValue<number>;
}

export function useScrollParallax(speed: number = 0.3): ParallaxResult {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = reduced ? 0 : speed * 60;
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const x = useTransform(scrollYProgress, [0, 1], [0, 0]);

  return { ref, y, x };
}
