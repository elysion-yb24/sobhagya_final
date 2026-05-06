"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface CountUpOptions {
  duration?: number;
  start?: boolean;
}

export function useCountUp(
  target: number,
  { duration = 1.6, start = true }: CountUpOptions = {}
) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration, start, reduced]);

  return value;
}
