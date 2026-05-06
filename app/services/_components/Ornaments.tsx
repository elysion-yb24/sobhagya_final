"use client";

import React from "react";

/* Devotional / astrological SVG ornaments — pure inline, scalable, currentColor */

export function OmSymbol({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        fontSize="48"
        fontFamily="'Noto Sans Devanagari', 'Noto Serif Devanagari', serif"
        fill="currentColor"
        style={{ fontWeight: 600 }}
      >
        ॐ
      </text>
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
  width?: number;
}) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} style={{ width }}>
      <FiligreeHalf flip />
      {children && <span className="shrink-0 text-current">{children}</span>}
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
          const x = 60 + Math.cos(a) * 48;
          const y = 60 + Math.sin(a) * 48;
          return <circle key={i} cx={x} cy={y} r="1.4" />;
        })}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.7">
        {petals.map((_, i) => {
          const a = (i / petals.length) * Math.PI * 2;
          const x1 = 60 + Math.cos(a) * 22;
          const y1 = 60 + Math.sin(a) * 22;
          const x2 = 60 + Math.cos(a) * 48;
          const y2 = 60 + Math.sin(a) * 48;
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
    <span
      className={`inline-flex items-center justify-center rounded-full ${className}`}
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
    </span>
  );
}
