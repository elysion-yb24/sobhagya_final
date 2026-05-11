"use client";

import React from "react";

/* Devotional / astrological SVG ornaments — pure inline, scalable, currentColor */

export function OmSymbol({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M379.3 4.7c-6.2-6.2-16.4-6.2-22.6 0l-16 16c-6.2 6.2-6.2 16.4 0 22.6l16 16c6.2 6.2 16.4 6.2 22.6 0l16-16c6.2-6.2 6.2-16.4 0-22.6l-16-16zM281 66.7c-2.2-1.5-4.9-2.5-7.7-2.7c-.6 0-1.3-.1-1.9 0c-3.9 .2-7.4 1.7-10.1 4.2c-.9 .8-1.6 1.7-2.3 2.6c-1.7 2.4-2.7 5.3-2.9 8.5c0 .7 0 1.4 0 2.1c.2 2.2 .9 4.3 1.9 6.2l.3 .6c.3 .6 .8 1.4 1.4 2.4c1.2 2 2.9 4.8 5.1 8.2c4.4 6.7 11.1 15.5 20 24.4C302.4 141.1 330.3 160 368 160c31.2 0 56.6-10.4 73.9-20.2c8.7-5 15.6-9.9 20.4-13.8c2.4-1.9 4.3-3.6 5.7-4.9c.7-.6 1.3-1.2 1.7-1.6l.6-.5 .1-.1 .1-.1s0 0 0 0s0 0 0 0c5.9-5.8 9.5-13.9 9.5-22.8c0-17.7-14.3-32-32-32c-8.7 0-16.7 3.5-22.4 9.2c-.1 .1-.2 .2-.5 .4c-.5 .5-1.5 1.3-2.8 2.4c-2.7 2.2-6.8 5.2-12.1 8.2C399.4 90.4 384.8 96 368 96c-20.8 0-42.4-7-59.5-14.6c-8.4-3.7-15.4-7.5-20.3-10.3c-2.4-1.4-4.3-2.5-5.6-3.3c-.6-.4-1.1-.7-1.4-.9l-.3-.2zM115.2 169.6c8-6 17.9-9.6 28.8-9.6c26.5 0 48 21.5 48 48s-21.5 48-48 48l-34.2 0c-7.6 0-13.8 6.2-13.8 13.8c0 1.5 .2 2.9 .7 4.4l8 24c4.4 13.1 16.6 21.9 30.4 21.9l8.9 0 16 0c35.3 0 64 28.7 64 64s-28.7 64-64 64c-50.8 0-82.7-21.5-102.2-42.8c-9.9-10.8-16.6-21.6-20.9-29.7c-2.1-4-3.6-7.3-4.5-9.6c-.5-1.1-.8-2-1-2.5l-.2-.5c-.3-.9-.7-1.8-1.1-2.6c-1.2-2.2-2.8-4-4.7-5.4c-1.9-1.4-4.1-2.3-6.5-2.8c-1.4-.3-2.9-.3-4.4-.2c-2.5 .2-4.8 1-6.8 2.3c-1.1 .7-2.2 1.5-3.1 2.5c-2.4 2.5-4.1 5.8-4.5 9.5c-.1 .6-.1 1.1-.1 1.7c0 0 0 0 0 0c0 .8 .1 1.7 .2 2.5l0 .1c0 .3 .1 .8 .2 1.3c.2 1.1 .4 2.7 .8 4.6c.8 3.9 2 9.4 3.9 15.9c3.8 13 10.3 30.4 21.3 48C48.7 476.2 89.4 512 160 512c70.7 0 128-57.3 128-128c0-23.3-6.2-45.2-17.1-64l22.6 0c25.5 0 49.9-10.1 67.9-28.1l26.5-26.5c6-6 14.1-9.4 22.6-9.4l5.5 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32c-25.7 0-41.4-12.5-51.2-25.6c-5-6.7-8.4-13.4-10.5-18.6c-1.1-2.5-1.8-4.6-2.2-6c-.2-.7-.4-1.2-.5-1.5l-.1-.2c-.3-1.3-.8-2.6-1.5-3.8c-1.1-2-2.6-3.8-4.4-5.1c-2.7-2-6-3.2-9.6-3.2l-.2 0c-8 .1-14.6 6.1-15.6 13.9c0 0 0 0 0 0c0 .3-.1 .6-.2 1.1c-.1 .9-.3 2.1-.4 3.6c-.3 3-.6 7.3-.6 12.4c0 10.1 1.1 23.9 5.8 38.1c4.8 14.3 13.4 29.3 28.6 40.7C368.7 473.3 389.3 480 416 480c53 0 96-43 96-96l0-96c0-53-43-96-96-96l-5.5 0c-25.5 0-49.9 10.1-67.9 28.1l-26.5 26.5c-6 6-14.1 9.4-22.6 9.4l-48.3 0c6.9-14.5 10.8-30.8 10.8-48c0-61.9-50.1-112-112-112c-25.2 0-48.5 8.3-67.2 22.4c-14.1 10.6-17 30.7-6.4 44.8s30.7 17 44.8 6.4z"
      />
    </svg>
  );
}

/** Symmetrical lotus / filigree divider with a centered slot for an icon */
export function FiligreeDivider({
  children,
  className = "",
  width = 260,
}: {
  children?: React.ReactNode;
  className?: string;
  width?: number | string;
}) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} style={{ width }}>
      <FiligreeHalf flip />
      {children && <div className="shrink-0 flex items-center justify-center text-current">{children}</div>}
      <FiligreeHalf />
    </div>
  );
}

function FiligreeHalf({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className="flex-1 h-5 text-current"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      {/* main line */}
      <line x1="0" y1="12" x2="86" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      {/* dot */}
      <circle cx="92" cy="12" r="2" fill="currentColor" />
      {/* small lotus petal cluster */}
      <path
        d="M100 12 q4 -6 10 0 q-4 6 -10 0 z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M104 12 q3 -10 14 0 q-3 10 -14 0 z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.7"
      />
    </svg>
  );
}

/** Concentric mandala — used as faint backdrop behind icons */
export function Mandala({
  className = "",
  size = 120,
  opacity = 0.18,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  const petals = Array.from({ length: 12 });
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.8" fill="none">
        <circle cx="60" cy="60" r="58" />
        <circle cx="60" cy="60" r="48" />
        <circle cx="60" cy="60" r="34" />
        <circle cx="60" cy="60" r="22" />
        <circle cx="60" cy="60" r="10" />
      </g>
      <g fill="currentColor" opacity="0.9">
        {petals.map((_, i) => {
          const a = (i / petals.length) * Math.PI * 2;
          const x = (60 + Math.cos(a) * 48).toFixed(3);
          const y = (60 + Math.sin(a) * 48).toFixed(3);
          return <circle key={i} cx={x} cy={y} r="1.4" />;
        })}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.7">
        {petals.map((_, i) => {
          const a = (i / petals.length) * Math.PI * 2;
          const x1 = (60 + Math.cos(a) * 22).toFixed(3);
          const y1 = (60 + Math.sin(a) * 22).toFixed(3);
          const x2 = (60 + Math.cos(a) * 48).toFixed(3);
          const y2 = (60 + Math.sin(a) * 48).toFixed(3);
          return <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}

/** Faint star dust pattern — small radial-gradient sparkles. Pure SVG, GPU-cheap. */
export function StarDust({
  count = 18,
  className = "",
  opacity = 0.6,
  seed = 0,
}: {
  count?: number;
  className?: string;
  opacity?: number;
  seed?: number;
}) {
  const arr = Array.from({ length: count });
  return (
    <svg
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`star-grad-${seed}`}>
          <stop offset="0%" stopColor="#FFE7B5" stopOpacity="1" />
          <stop offset="60%" stopColor="#F7B23A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F7941D" stopOpacity="0" />
        </radialGradient>
      </defs>
      {arr.map((_, i) => {
        const idx = i + seed * 7;
        const x = (idx * 17.3) % 100;
        const y = (idx * 23.7) % 100;
        const r = 0.7 + (idx % 3) * 0.5;
        return (
          <circle
            key={i}
            cx={`${x}%`}
            cy={`${y}%`}
            r={r}
            fill={`url(#star-grad-${seed})`}
          />
        );
      })}
    </svg>
  );
}

/** Convert 1..50 to a classic Roman numeral. */
export function toRoman(num: number): string {
  if (!Number.isFinite(num) || num < 1) return "";
  const map: [number, string][] = [
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = Math.floor(num);
  let out = "";
  for (const [v, sym] of map) {
    while (n >= v) {
      out += sym;
      n -= v;
    }
  }
  return out;
}

/** Devanagari numerals 0..9 for accent labels. */
export function toDevanagariNumber(num: number): string {
  const dev = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(Math.floor(Math.max(0, num)))
    .split("")
    .map((d) => dev[Number(d)] ?? d)
    .join("");
}

/** Chapter mark in the style of a Sanskrit verse: ॥  VII  ॥
 *  Pure typography, deliberately quiet.
 */
export function ChapterMark({
  index,
  className = "",
  size = 13,
}: {
  index: number;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 select-none ${className}`}
      style={{
        fontFamily: "'EB Garamond', serif",
        color: "#A06A12",
        letterSpacing: "0.18em",
        fontSize: size,
        fontWeight: 600,
      }}
      aria-hidden
    >
      <span style={{ opacity: 0.55 }}>॥</span>
      <span style={{ fontVariant: "small-caps", fontSize: size + 1 }}>
        {toRoman(index)}
      </span>
      <span style={{ opacity: 0.55 }}>॥</span>
    </span>
  );
}

/** Hand-drawn lotus divider — three petals on a thin baseline.
 *  Replaces the plain gold underline for an almanac/scroll feel.
 */
export function LotusDivider({
  className = "",
  width = 110,
  height = 18,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 110 18"
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {/* baseline */}
        <line x1="6" y1="13" x2="42" y2="13" strokeWidth="0.9" opacity="0.7" />
        <line x1="68" y1="13" x2="104" y2="13" strokeWidth="0.9" opacity="0.7" />
        {/* small lotus tips on baseline ends */}
        <path d="M 2 13 q 2 -3 4 0" strokeWidth="0.9" opacity="0.6" />
        <path d="M 104 13 q 2 -3 4 0" strokeWidth="0.9" opacity="0.6" />
      </g>
      {/* central lotus, three petals */}
      <g transform="translate(55 9)">
        <path
          d="M 0 4 q -7 -10 -2 -4 q 2 -2 2 -8"
          fill="currentColor"
          opacity="0.85"
          transform="rotate(-25)"
        />
        <path
          d="M 0 4 q 7 -10 2 -4 q -2 -2 -2 -8"
          fill="currentColor"
          opacity="0.85"
          transform="rotate(25)"
        />
        <path
          d="M 0 4 q 0 -10 0 -10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.95"
        />
        <circle cx="0" cy="4" r="1.4" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Decorative temple-arch outline drawn inside an alcove card.
 *  Two thin gold lines tracing a cusped ogee arch with a small finial dot at top.
 */
export function TempleArchOrnament({
  className = "",
  width = 220,
  height = 90,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 220 90"
      width={width}
      height={height}
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* outer arch */}
        <path
          d="M 12 86 L 12 56 Q 12 14 60 10 Q 90 7 110 22 Q 130 7 160 10 Q 208 14 208 56 L 208 86"
          strokeWidth="1.4"
          opacity="0.85"
        />
        {/* inner arch */}
        <path
          d="M 22 86 L 22 60 Q 22 24 64 20 Q 92 18 110 32 Q 128 18 156 20 Q 198 24 198 60 L 198 86"
          strokeWidth="0.8"
          opacity="0.55"
        />
      </g>
      {/* finial dot at apex */}
      <circle cx="110" cy="6" r="2.6" fill="currentColor" opacity="0.9" />
      <circle cx="110" cy="6" r="5.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      {/* small lotus tips at base */}
      <path d="M 12 86 q 6 -8 12 0" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <path d="M 196 86 q 6 -8 12 0" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
    </svg>
  );
}

/** Subtle parchment grain — large faint dots, reusable as a CSS background-image too */
export function ParchmentTexture({
  className = "",
  opacity = 0.06,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      className={className}
      style={{ opacity, position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      <filter id="parchment-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix
          values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.10  0 0 0 0.6 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#parchment-noise)" />
    </svg>
  );
}

/** Vedic-style sunburst yantra — 24 rays emanating outward, used as a card backdrop */
export function SunburstYantra({
  className = "",
  size = 200,
  opacity = 0.12,
  rays = 24,
}: {
  className?: string;
  size?: number;
  opacity?: number;
  rays?: number;
}) {
  const arr = Array.from({ length: rays });
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <radialGradient id="sb-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="currentColor">
        {arr.map((_, i) => {
          const a = (i / rays) * 360;
          return (
            <polygon
              key={i}
              points="100,30 102,100 98,100"
              transform={`rotate(${a} 100 100)`}
              opacity={i % 2 === 0 ? 1 : 0.55}
            />
          );
        })}
      </g>
      <circle cx="100" cy="100" r="22" fill="url(#sb-fade)" />
      <g fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7">
        <circle cx="100" cy="100" r="34" />
        <circle cx="100" cy="100" r="48" />
      </g>
    </svg>
  );
}

/** Gold filigree corner ornament — used in CTAs / portal frames */
export function CornerFiligree({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2 2 L24 2" />
        <path d="M2 2 L2 24" />
        <path d="M2 2 q14 0 22 22" opacity="0.55" />
        <circle cx="6" cy="6" r="1.6" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Centered om in a gold roundel — used in section dividers */
export function OmRoundel({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 25%, #FFE7B5 0%, #F7B23A 65%, #B86A0B 100%)",
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -3px 8px rgba(120,60,0,0.45), 0 4px 12px rgba(199,131,26,0.35)",
        color: "#3a2208",
      }}
    >
      <OmSymbol size={Math.round(size * 0.7)} />
    </div>
  );
}
