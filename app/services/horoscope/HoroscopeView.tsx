"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GiAries, GiTaurus, GiGemini, GiCancer, GiLeo, GiVirgo,
  GiLibra, GiScorpio, GiSagittarius, GiCapricorn, GiAquarius, GiPisces,
} from "react-icons/gi";
import { FiSun, FiSunrise, FiCalendar } from "react-icons/fi";
import { LuCalendarDays, LuSparkles } from "react-icons/lu";
import { ZODIAC_SIGNS, type ZodiacSign } from "../../lib/astrology/types";
import { getHoroscope, type HoroscopePeriod, type HoroscopeResponse } from "../../lib/astrology/featureApi";

type PeriodMeta = {
  key: HoroscopePeriod;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
};

const PERIODS: PeriodMeta[] = [
  { key: "today",    label: "Today",     shortLabel: "Today",    icon: FiSun },
  { key: "tomorrow", label: "Tomorrow",  shortLabel: "Tomorrow", icon: FiSunrise },
  { key: "weekly",   label: "This Week", shortLabel: "Week",     icon: FiCalendar },
  { key: "monthly",  label: "This Month",shortLabel: "Month",    icon: LuCalendarDays },
  { key: "yearly",   label: "This Year", shortLabel: "Year",     icon: LuSparkles },
];

type IconCmp = ComponentType<{ size?: number | string; color?: string; className?: string }>;

const SIGN_ICONS: Record<ZodiacSign, IconCmp> = {
  aries: GiAries, taurus: GiTaurus, gemini: GiGemini, cancer: GiCancer,
  leo: GiLeo, virgo: GiVirgo, libra: GiLibra, scorpio: GiScorpio,
  sagittarius: GiSagittarius, capricorn: GiCapricorn, aquarius: GiAquarius, pisces: GiPisces,
};

const SIGN_COLORS: Record<ZodiacSign, string> = {
  aries:       "#A6A436",
  taurus:      "#DC2A2A",
  gemini:      "#2393CE",
  cancer:      "#8B4513",
  leo:         "#F58220",
  virgo:       "#C13BB0",
  libra:       "#1A56C4",
  scorpio:     "#1E2D6B",
  sagittarius: "#1F6F50",
  capricorn:   "#15623D",
  aquarius:    "#1B2E80",
  pisces:      "#1D7B7C",
};

const SIGN_DATES: Record<ZodiacSign, string> = {
  aries:       "Mar 21 – Apr 19",
  taurus:      "Apr 20 – May 20",
  gemini:      "May 21 – Jun 20",
  cancer:      "Jun 21 – Jul 22",
  leo:         "Jul 23 – Aug 22",
  virgo:       "Aug 23 – Sep 22",
  libra:       "Sep 23 – Oct 22",
  scorpio:     "Oct 23 – Nov 21",
  sagittarius: "Nov 22 – Dec 21",
  capricorn:   "Dec 22 – Jan 19",
  aquarius:    "Jan 20 – Feb 18",
  pisces:      "Feb 19 – Mar 20",
};

const SIGN_ELEMENT: Record<ZodiacSign, "Fire" | "Earth" | "Air" | "Water"> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const ELEMENT_TRAITS: Record<"Fire" | "Earth" | "Air" | "Water", string> = {
  Fire: "Passion · Energy · Drive",
  Earth: "Grounded · Loyal · Patient",
  Air: "Intellect · Curiosity · Social",
  Water: "Intuition · Emotion · Depth",
};

function formatDateKey(dateKey: string, period: HoroscopePeriod): string {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return dateKey;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return dateKey;
  if (period === "yearly") return dt.toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" });
  if (period === "monthly") return dt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  return dt.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function stripDatePrefix(text: string): string {
  return text
    .replace(/^\s*[A-Z][a-z]+ \d{1,2},?\s*\d{4}\s*[-–—:]\s*/i, "")
    .replace(/^\s*(?:Week|Month|Year) of [A-Z][a-z]+ \d{1,2},?\s*\d{4}\s*[-–—:]\s*/i, "")
    .trim();
}

// Deterministic pseudo-random for floating sparkle positions (avoids SSR/CSR mismatch).
const SPARKLES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  delay: (i * 0.31) % 4,
  duration: 4 + ((i * 0.7) % 4),
  size: 2 + (i % 3),
}));

export default function HoroscopeView({ initialSign }: { initialSign?: ZodiacSign } = {}) {
  const [sign, setSign] = useState<ZodiacSign>(initialSign ?? "aries");
  const [period, setPeriod] = useState<HoroscopePeriod>("today");
  const [response, setResponse] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHoroscope(sign, period)
      .then((data) => { if (!cancelled) setResponse(data); })
      .catch((e) => {
        if (!cancelled) {
          setResponse(null);
          setError(e instanceof Error ? e.message : "Failed to fetch horoscope.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sign, period]);

  const handleSelectSign = (s: ZodiacSign) => {
    setSign(s);
    // Auto-scroll to result on mobile/tablet only — desktop has sticky panel.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const periodLabel = PERIODS.find((p) => p.key === period)!.label;
  const element = SIGN_ELEMENT[sign];
  const accent = SIGN_COLORS[sign];
  const SelectedIcon = SIGN_ICONS[sign];
  const cleanText = useMemo(
    () => (response ? stripDatePrefix(response.data.text) : ""),
    [response],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF6E8] to-[#FFEAC9] text-[#2a1304]">
      {/* Cosmic floating sparkles backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              background: i % 3 === 0 ? "#F7941D" : i % 3 === 1 ? "#C9A877" : "#E5C99F",
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.4, 0.5],
              y: [0, -30, 0],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Soft radial accent glow that follows the active sign */}
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full blur-3xl"
        animate={{ backgroundColor: `${accent}22` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        aria-hidden
      />

      <div className="section-container relative py-10 sm:py-14">
        {/* Header */}
        <header className="text-center sm:text-left mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-garamond text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
          >
            Daily Horoscope
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-2 text-sm sm:text-base text-[#6b4a1f] max-w-3xl"
          >
            Discover what the stars say for your zodiac. Pick a sign and a time period — no birth details needed.
          </motion.p>
        </header>

        {/* Period selector — icon cards in a 5-col grid (fits on a single row on mobile) */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 rounded-2xl border border-[#E5C99F] bg-white/70 backdrop-blur p-1.5 sm:p-2 shadow-sm">
            {PERIODS.map((p) => {
              const active = period === p.key;
              const Icon = p.icon;
              return (
                <motion.button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  whileTap={{ scale: 0.94 }}
                  className="relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl px-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="period-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#F7941D] to-[#E08015] shadow-[0_8px_20px_-8px_rgba(247,148,29,0.7)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <motion.span
                    animate={active ? { y: [0, -2, 0], scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={18}
                      className={active ? "text-white" : "text-[#C77A1B]"}
                    />
                  </motion.span>
                  <span
                    className={
                      "relative z-10 leading-tight tracking-wide " +
                      (active ? "text-white" : "text-[#6b4a1f]")
                    }
                  >
                    <span className="sm:hidden">{p.shortLabel}</span>
                    <span className="hidden sm:inline">{p.label}</span>
                  </span>
                  {active && (
                    <motion.span
                      layoutId="period-dot"
                      className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F7941D]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Main 2-column layout: grid on left, sticky result on right (desktop only) */}
        <div className="grid lg:grid-cols-[1fr_minmax(360px,440px)] gap-6 lg:gap-8 items-start">
          {/* Zodiac grid */}
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A6A2A] font-semibold mb-3 text-center sm:text-left">
              Choose your zodiac sign
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {ZODIAC_SIGNS.map((s, idx) => {
                const active = sign === s;
                const Icon = SIGN_ICONS[s];
                const color = SIGN_COLORS[s];
                return (
                  <motion.button
                    key={s}
                    onClick={() => handleSelectSign(s)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * idx, duration: 0.35, ease: "easeOut" }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={
                      "group relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-5 bg-white/80 backdrop-blur transition-shadow " +
                      (active ? "shadow-lg" : "border-[#EEDFC2] hover:shadow-md")
                    }
                    style={active ? { borderColor: color, boxShadow: `0 12px 32px -10px ${color}80` } : undefined}
                  >
                    {/* Animated glow ring for active sign */}
                    {active && (
                      <motion.span
                        className="absolute inset-0 rounded-xl"
                        style={{ boxShadow: `0 0 0 2px ${color}55, 0 0 24px ${color}55` }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <motion.span
                      animate={active ? { rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 0.6 }}
                      className="relative"
                    >
                      <Icon size={48} color={color} className="transition-transform group-hover:scale-110" />
                    </motion.span>
                    <span className="relative uppercase text-[11px] sm:text-xs font-bold tracking-wider" style={{ color }}>
                      {s}
                    </span>
                    <span className="relative text-[10px] text-[#8A6A2A] hidden sm:block">{SIGN_DATES[s]}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sticky result panel (desktop), inline (mobile) */}
          <div ref={resultRef} className="lg:sticky lg:top-24 scroll-mt-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${sign}-${period}`}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-[#FFFDF5] to-[#FFF6E8] shadow-xl"
                style={{ borderColor: accent }}
              >
                {/* Decorative oversized watermark */}
                <motion.div
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 0.08 }}
                  transition={{ duration: 0.6 }}
                  className="absolute -right-10 -top-10 pointer-events-none select-none"
                  aria-hidden
                >
                  <SelectedIcon size={260} color={accent} />
                </motion.div>

                {/* Animated top accent bar */}
                <motion.div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent}66, ${accent})` }}
                  animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative p-5 sm:p-7 space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-4 border-b border-[#F2E0C2] pb-4">
                    <motion.div
                      initial={{ scale: 0.7, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 14 }}
                      className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white border-2 shadow-sm shrink-0"
                      style={{ borderColor: accent }}
                    >
                      <SelectedIcon size={44} color={accent} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="font-garamond text-2xl sm:text-3xl font-semibold capitalize leading-tight"
                        style={{ color: accent }}
                      >
                        {sign}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#6b4a1f]">
                        <span>{SIGN_DATES[sign]}</span>
                        <span className="text-[#C9A877]">•</span>
                        <span className="font-medium" style={{ color: accent }}>{element}</span>
                      </div>
                      <div className="mt-1 text-[10px] sm:text-[11px] text-[#8A6A2A] italic">
                        {ELEMENT_TRAITS[element]}
                      </div>
                    </div>
                  </div>

                  {/* Period + date row */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold uppercase tracking-[0.18em]"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                      {periodLabel}
                    </span>
                    <span className="font-garamond text-base sm:text-lg text-[#2a1304] text-right">
                      {response ? formatDateKey(response.dateKey, period) : "—"}
                    </span>
                  </div>

                  {/* Body */}
                  {loading && (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 rounded bg-[#F2E0C2] w-full" />
                      <div className="h-3 rounded bg-[#F2E0C2] w-11/12" />
                      <div className="h-3 rounded bg-[#F2E0C2] w-10/12" />
                      <div className="h-3 rounded bg-[#F2E0C2] w-9/12" />
                      <div className="h-3 rounded bg-[#F2E0C2] w-8/12" />
                    </div>
                  )}

                  {!loading && error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {!loading && !error && response && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.5 }}
                      className="relative"
                    >
                      <span
                        aria-hidden
                        className="font-garamond absolute -left-1 -top-7 select-none text-7xl leading-none"
                        style={{ color: `${accent}33` }}
                      >
                        &ldquo;
                      </span>
                      <p className="font-garamond text-base sm:text-lg leading-relaxed text-[#2a1304] whitespace-pre-line pl-6">
                        {cleanText}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
