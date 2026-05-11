"use client";

import React from "react";

export type ZodiacName =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

type Props = {
  name: ZodiacName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

/**
 * Hand-tuned inline SVG astrological glyphs. All drawn on a 32×32 viewBox,
 * stroke-only so they inherit `color` and can be scaled crisply at any size.
 */
export default function ZodiacIcon({
  name,
  size = 28,
  className = "",
  strokeWidth = 2.2,
}: Props) {
  const props = {
    viewBox: "0 0 32 32",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "Aries":
      return (
        <svg {...props}>
          {/* center stem + two outward-rolling horns */}
          <path d="M16 14 L16 27" />
          <path d="M16 14 C 12 8 7 9 6 14 C 5.5 17.5 9.5 18.5 10.5 15" />
          <path d="M16 14 C 20 8 25 9 26 14 C 26.5 17.5 22.5 18.5 21.5 15" />
        </svg>
      );

    case "Taurus":
      return (
        <svg {...props}>
          {/* body circle */}
          <circle cx="16" cy="22" r="5" />
          {/* horns: opening crescent above */}
          <path d="M8 13 C 9 6 14 5 16 11 C 18 5 23 6 24 13" />
        </svg>
      );

    case "Gemini":
      return (
        <svg {...props}>
          {/* twin pillars with caps */}
          <path d="M10 7 H22" />
          <path d="M10 25 H22" />
          <path d="M13 7 V25" />
          <path d="M19 7 V25" />
        </svg>
      );

    case "Cancer":
      return (
        <svg {...props}>
          {/* upper: bar with right circle */}
          <path d="M7 11 H20" />
          <circle cx="22" cy="11" r="2.5" />
          {/* lower: bar with left circle */}
          <path d="M25 21 H12" />
          <circle cx="10" cy="21" r="2.5" />
        </svg>
      );

    case "Leo":
      return (
        <svg {...props}>
          {/* small head loop, sweeping tail */}
          <circle cx="12" cy="13" r="4" />
          <path d="M12 17 C 12 22 16 24 21 22 C 26 20 26 14 22 14" />
        </svg>
      );

    case "Virgo":
      return (
        <svg {...props}>
          {/* three strokes — last curls inward */}
          <path d="M6 25 V10" />
          <path d="M6 10 C 8 13 11 13 11 18 V25" />
          <path d="M11 18 C 11 13 14 11 16 14 V25" />
          <path d="M16 14 C 18 11 22 12 22 16 C 22 19 19 21 16 19 C 18 22 22 23 25 20" />
        </svg>
      );

    case "Libra":
      return (
        <svg {...props}>
          {/* base bar */}
          <path d="M5 25 H27" />
          {/* dome with flat top */}
          <path d="M7 20 C 7 12 12 9 16 9 C 20 9 25 12 25 20" />
          <path d="M11 20 H21" />
        </svg>
      );

    case "Scorpio":
      return (
        <svg {...props}>
          {/* three pillars + arrow stinger */}
          <path d="M5 25 V10" />
          <path d="M5 10 C 7 13 10 13 10 18 V25" />
          <path d="M10 18 C 10 13 13 11 15 14 V25" />
          <path d="M15 14 C 17 11 21 12 21 16 V25 L26 21" />
          <path d="M26 21 L22 21 M26 21 L26 25" />
        </svg>
      );

    case "Sagittarius":
      return (
        <svg {...props}>
          {/* arrow up-right with crossbar */}
          <path d="M6 26 L26 6" />
          <path d="M18 6 H26 V14" />
          <path d="M11 15 L17 21" />
        </svg>
      );

    case "Capricorn":
      return (
        <svg {...props}>
          {/* horns "V" + curled fish tail */}
          <path d="M5 9 C 6 14 9 16 11 18 L13 20" />
          <path d="M13 20 C 17 12 22 11 22 16 C 22 19 19 19 17 17" />
          <path d="M17 17 C 20 22 26 23 25 18 C 24.5 14 19 14 18 18" />
        </svg>
      );

    case "Aquarius":
      return (
        <svg {...props}>
          {/* two stacked waves */}
          <path d="M5 12 Q 8.5 7 12 12 T 19 12 T 26 12" />
          <path d="M5 21 Q 8.5 16 12 21 T 19 21 T 26 21" />
        </svg>
      );

    case "Pisces":
      return (
        <svg {...props}>
          {/* two facing arcs joined by horizontal bar */}
          <path d="M8 6 C 4 12 4 20 8 26" />
          <path d="M24 6 C 28 12 28 20 24 26" />
          <path d="M6 16 H26" />
        </svg>
      );
  }
}
