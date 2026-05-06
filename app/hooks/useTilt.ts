"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TiltOptions {
  max?: number;
  perspective?: number;
  scale?: number;
  damping?: number;
  disabled?: boolean;
}

interface TiltState {
  rx: number;
  ry: number;
  s: number;
}

export function useTilt({
  max = 10,
  perspective = 800,
  scale = 1.02,
  damping = 0.14,
  disabled = false,
}: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef<TiltState>({ rx: 0, ry: 0, s: 1 });
  const current = useRef<TiltState>({ rx: 0, ry: 0, s: 1 });
  const raf = useRef<number | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
    transformStyle: "preserve-3d",
    willChange: "transform",
  });

  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const off = disabled || coarse;

  const tick = useCallback(() => {
    const c = current.current;
    const t = target.current;
    c.rx += (t.rx - c.rx) * damping;
    c.ry += (t.ry - c.ry) * damping;
    c.s += (t.s - c.s) * damping;
    setStyle({
      transform: `perspective(${perspective}px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) scale(${c.s.toFixed(3)})`,
      transformStyle: "preserve-3d",
      willChange: "transform",
    });
    if (
      Math.abs(c.rx - t.rx) > 0.05 ||
      Math.abs(c.ry - t.ry) > 0.05 ||
      Math.abs(c.s - t.s) > 0.001
    ) {
      raf.current = requestAnimationFrame(tick);
    } else {
      raf.current = null;
    }
  }, [damping, perspective]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (off || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      target.current = {
        rx: -py * max,
        ry: px * max,
        s: scale,
      };
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    },
    [off, max, scale, tick]
  );

  const onMouseLeave = useCallback(() => {
    if (off) return;
    target.current = { rx: 0, ry: 0, s: 1 };
    if (raf.current == null) raf.current = requestAnimationFrame(tick);
  }, [off, tick]);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    },
    []
  );

  if (off) {
    return {
      ref,
      style: {} as React.CSSProperties,
      onMouseMove: undefined,
      onMouseLeave: undefined,
    };
  }

  return { ref, style, onMouseMove, onMouseLeave };
}
