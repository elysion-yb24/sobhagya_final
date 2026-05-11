"use client";

import { motion } from "framer-motion";

/**
 * Blog-themed floating decoration: open books, pages, a quill,
 * and sparkles drifting around the hero. Pure SVG + framer-motion
 * (no WebGL) for a fast, predictable, on-brand visual.
 */

type FloatProps = {
  className?: string;
  drift?: number; // px
  duration?: number; // s
  delay?: number;
  rotate?: [number, number]; // rotate range
  scale?: number;
};

function FloatItem({
  children,
  className = "",
  drift = 14,
  duration = 6,
  delay = 0,
  rotate = [-3, 3],
  scale = 1,
}: FloatProps & { children: React.ReactNode }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 24, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{
          y: [0, -drift, 0],
          rotate: rotate,
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------- SVG primitives ---------- */

function OpenBook({ size = 110, accent = "#F7B23A" }: { size?: number; accent?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 140 110"
      fill="none"
      style={{ filter: "drop-shadow(0 12px 22px rgba(247,148,29,0.45))" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="page-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFCEF" />
          <stop offset="100%" stopColor="#FFE7B5" />
        </linearGradient>
        <linearGradient id="page-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFCEF" />
          <stop offset="100%" stopColor="#FFE7B5" />
        </linearGradient>
        <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#7a3c05" />
        </linearGradient>
      </defs>
      {/* left cover */}
      <path d="M8 18 Q14 10 30 12 L70 22 L70 102 L30 92 Q14 90 8 96 Z" fill="url(#cover)" stroke="#7a3c05" strokeWidth="1.2" />
      {/* right cover */}
      <path d="M132 18 Q126 10 110 12 L70 22 L70 102 L110 92 Q126 90 132 96 Z" fill="url(#cover)" stroke="#7a3c05" strokeWidth="1.2" />
      {/* left page */}
      <path d="M14 22 Q22 18 32 20 L68 28 L68 96 L32 88 Q22 86 14 90 Z" fill="url(#page-l)" stroke="#C7831A" strokeWidth="0.6" />
      {/* right page */}
      <path d="M126 22 Q118 18 108 20 L72 28 L72 96 L108 88 Q118 86 126 90 Z" fill="url(#page-r)" stroke="#C7831A" strokeWidth="0.6" />
      {/* page lines */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={0.45}>
          <line x1={22} x2={62} y1={36 + i * 12} y2={36 + i * 12 + 1} stroke="#7a3c05" strokeWidth="0.7" strokeLinecap="round" />
          <line x1={78} x2={118} y1={36 + i * 12 + 1} y2={36 + i * 12} stroke="#7a3c05" strokeWidth="0.7" strokeLinecap="round" />
        </g>
      ))}
      {/* spine highlight */}
      <line x1="70" y1="22" x2="70" y2="102" stroke="#FFD58A" strokeWidth="0.8" opacity="0.7" />
      {/* tiny om/star ornament */}
      <circle cx="40" cy="78" r="2.6" fill={accent} />
      <circle cx="100" cy="78" r="2.6" fill={accent} />
    </svg>
  );
}

function Page({ size = 60, tint = "#FFFCEF" }: { size?: number; tint?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 60 70"
      fill="none"
      style={{ filter: "drop-shadow(0 8px 14px rgba(247,148,29,0.35))" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`pg-${tint}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint} />
          <stop offset="100%" stopColor="#FFE7B5" />
        </linearGradient>
      </defs>
      {/* sheet with curled corner */}
      <path
        d="M6 4 L48 4 Q56 4 56 12 L56 64 Q56 66 54 66 L6 66 Q4 66 4 64 L4 6 Q4 4 6 4 Z"
        fill={`url(#pg-${tint})`}
        stroke="#C7831A"
        strokeWidth="0.8"
      />
      {/* curled corner */}
      <path d="M48 4 Q56 4 56 12 L48 12 Q44 12 44 8 Q44 4 48 4 Z" fill="#FFE7B5" stroke="#C7831A" strokeWidth="0.6" />
      {/* text lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={10}
          x2={i === 4 ? 36 : 50}
          y1={20 + i * 8}
          y2={20 + i * 8}
          stroke="#7a3c05"
          strokeWidth="0.7"
          opacity="0.45"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Quill({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      style={{ filter: "drop-shadow(0 8px 16px rgba(247,148,29,0.4))" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="feather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE7B5" />
          <stop offset="60%" stopColor="#F7B23A" />
          <stop offset="100%" stopColor="#7a3c05" />
        </linearGradient>
      </defs>
      {/* feather */}
      <path
        d="M10 70 Q20 30 60 8 Q56 36 30 60 Q22 66 10 70 Z"
        fill="url(#feather)"
        stroke="#7a3c05"
        strokeWidth="0.8"
      />
      {/* spine */}
      <path d="M10 70 Q30 45 60 8" stroke="#5a2a04" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* feather barbs */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t = 0.15 + i * 0.13;
        const x = 10 + (60 - 10) * t;
        const y = 70 + (8 - 70) * t * (1 - t * 0.4);
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - 6 + i}
            y2={y + 6 - i * 0.5}
            stroke="#5a2a04"
            strokeWidth="0.6"
            opacity="0.6"
            strokeLinecap="round"
          />
        );
      })}
      {/* nib + ink dot */}
      <circle cx="9" cy="71" r="1.6" fill="#1a0a02" />
    </svg>
  );
}

function Sparkle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill="#FFE7B5"
        opacity="0.9"
      />
    </svg>
  );
}

/* ---------- Composition ---------- */

export default function BlogFloatingDecor() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* LEFT large book */}
      <FloatItem
        className="left-[4%] sm:left-[8%] top-[18%] sm:top-[22%] hidden sm:block"
        drift={18}
        duration={7}
        delay={0.2}
        rotate={[-8, -2]}
      >
        <OpenBook size={130} accent="#F7B23A" />
      </FloatItem>

      {/* RIGHT smaller book */}
      <FloatItem
        className="right-[5%] sm:right-[10%] top-[14%] sm:top-[18%] hidden sm:block"
        drift={22}
        duration={8}
        delay={0.4}
        rotate={[3, 10]}
      >
        <OpenBook size={100} accent="#FFD58A" />
      </FloatItem>

      {/* Floating pages */}
      <FloatItem
        className="left-[14%] sm:left-[18%] bottom-[18%] sm:bottom-[22%] hidden md:block"
        drift={14}
        duration={6}
        delay={0.55}
        rotate={[-12, -4]}
      >
        <Page size={62} />
      </FloatItem>
      <FloatItem
        className="right-[16%] sm:right-[20%] bottom-[20%] sm:bottom-[26%] hidden md:block"
        drift={16}
        duration={7.5}
        delay={0.7}
        rotate={[4, 14]}
      >
        <Page size={70} tint="#FFFDF5" />
      </FloatItem>

      {/* Quill */}
      <FloatItem
        className="right-[8%] sm:right-[14%] bottom-[8%] sm:bottom-[12%] hidden lg:block"
        drift={12}
        duration={6}
        delay={0.9}
        rotate={[-6, 6]}
      >
        <Quill size={86} />
      </FloatItem>

      {/* Sparkles scattered for atmosphere (visible everywhere) */}
      {[
        { top: "20%", left: "30%", size: 14, delay: 1.0, dur: 3.5 },
        { top: "30%", left: "70%", size: 12, delay: 1.4, dur: 4.0 },
        { top: "62%", left: "22%", size: 10, delay: 1.6, dur: 3.2 },
        { top: "70%", left: "78%", size: 14, delay: 1.2, dur: 3.8 },
        { top: "44%", left: "8%",  size: 10, delay: 0.8, dur: 4.5 },
        { top: "50%", left: "92%", size: 10, delay: 1.0, dur: 3.6 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: s.top, left: s.left }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180] }}
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkle size={s.size} />
        </motion.div>
      ))}
    </div>
  );
}
