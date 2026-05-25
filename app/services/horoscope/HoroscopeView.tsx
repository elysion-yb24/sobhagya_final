"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  GiAries, GiTaurus, GiGemini, GiCancer, GiLeo, GiVirgo,
  GiLibra, GiScorpio, GiSagittarius, GiCapricorn, GiAquarius, GiPisces,
} from "react-icons/gi";
import PageShell from "../../components/astrology/PageShell";
import { ZODIAC_SIGNS, type ZodiacSign } from "../../lib/astrology/types";
import { getHoroscope, type HoroscopePeriod, type HoroscopeResponse } from "../../lib/astrology/featureApi";

const PERIODS: { key: HoroscopePeriod; label: string }[] = [
  { key: "today",    label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "weekly",   label: "This Week" },
  { key: "monthly",  label: "This Month" },
  { key: "yearly",   label: "This Year" },
];

type IconCmp = ComponentType<{ size?: number | string; color?: string; className?: string }>;

const SIGN_ICONS: Record<ZodiacSign, IconCmp> = {
  aries: GiAries,
  taurus: GiTaurus,
  gemini: GiGemini,
  cancer: GiCancer,
  leo: GiLeo,
  virgo: GiVirgo,
  libra: GiLibra,
  scorpio: GiScorpio,
  sagittarius: GiSagittarius,
  capricorn: GiCapricorn,
  aquarius: GiAquarius,
  pisces: GiPisces,
};

// Colors chosen to match the reference image's illustrated zodiac set.
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

function formatDateKey(dateKey: string, period: HoroscopePeriod): string {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return dateKey;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return dateKey;
  if (period === "yearly") {
    return dt.toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" });
  }
  if (period === "monthly") {
    return dt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  }
  return dt.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

// Scraped text often begins with "May 22, 2026 - " or "May 22, 2026: " prefix.
// The date is shown separately in the result header, so strip that redundant leader.
function stripDatePrefix(text: string): string {
  return text
    .replace(/^\s*[A-Z][a-z]+ \d{1,2},?\s*\d{4}\s*[-–—:]\s*/i, "")
    .replace(/^\s*(?:Week|Month|Year) of [A-Z][a-z]+ \d{1,2},?\s*\d{4}\s*[-–—:]\s*/i, "")
    .trim();
}

export default function HoroscopeView({ initialSign }: { initialSign?: ZodiacSign } = {}) {
  const [sign, setSign] = useState<ZodiacSign>(initialSign ?? "aries");
  const [period, setPeriod] = useState<HoroscopePeriod>("today");
  const [response, setResponse] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const periodLabel = PERIODS.find((p) => p.key === period)!.label;
  const element = SIGN_ELEMENT[sign];
  const accent = SIGN_COLORS[sign];
  const SelectedIcon = SIGN_ICONS[sign];
  const cleanText = useMemo(
    () => (response ? stripDatePrefix(response.data.text) : ""),
    [response],
  );

  return (
    <PageShell
      title="Daily Horoscope"
      subtitle="Discover what the stars say for your zodiac. Pick a sign and a time period — no birth details needed."
    >
      {/* Period segmented control */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-[#E5C99F] bg-white p-1 shadow-sm">
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={
                  "rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all " +
                  (active
                    ? "bg-gradient-to-r from-[#F7941D] to-[#E08015] text-white shadow-sm"
                    : "text-[#6b4a1f] hover:bg-[#FFF6E8]")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zodiac grid — illustrated icons, colored per sign */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A6A2A] font-semibold mb-3 text-center sm:text-left">
          Choose your zodiac sign
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {ZODIAC_SIGNS.map((s) => {
            const active = sign === s;
            const Icon = SIGN_ICONS[s];
            const color = SIGN_COLORS[s];
            return (
              <button
                key={s}
                onClick={() => setSign(s)}
                className={
                  "group relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-5 transition-all duration-200 " +
                  (active
                    ? "bg-white shadow-lg scale-[1.04] -translate-y-0.5"
                    : "border-[#EEDFC2] bg-white/70 hover:bg-white hover:shadow-md hover:-translate-y-0.5")
                }
                style={active ? { borderColor: color, boxShadow: `0 8px 24px -8px ${color}66` } : undefined}
              >
                <Icon size={56} color={color} className="transition-transform group-hover:scale-110" />
                <span
                  className="uppercase text-[11px] sm:text-xs font-bold tracking-wider"
                  style={{ color }}
                >
                  {s}
                </span>
                <span className="text-[10px] text-[#8A6A2A] hidden sm:block">{SIGN_DATES[s]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero result card */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-[#FFFDF5] to-[#FFF6E8] shadow-md"
        style={{ borderColor: accent }}
      >
        {/* Decorative oversized watermark icon in the corner */}
        <div className="absolute -right-8 -top-8 opacity-[0.08] pointer-events-none select-none">
          <SelectedIcon size={240} color={accent} />
        </div>

        <div className="relative p-6 sm:p-8 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F2E0C2] pb-5">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white border-2 shadow-sm"
                style={{ borderColor: accent }}
              >
                <SelectedIcon size={48} color={accent} />
              </div>
              <div>
                <h2
                  className="font-garamond text-3xl sm:text-4xl font-semibold capitalize leading-tight"
                  style={{ color: accent }}
                >
                  {sign}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#6b4a1f]">
                  <span>{SIGN_DATES[sign]}</span>
                  <span className="text-[#C9A877]">•</span>
                  <span className="font-medium" style={{ color: accent }}>{element} sign</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#8A6A2A] font-semibold">
                {periodLabel}
              </div>
              <div className="font-garamond text-lg sm:text-xl text-[#2a1304]">
                {response ? formatDateKey(response.dateKey, period) : "—"}
              </div>
            </div>
          </div>

          {/* Body */}
          {loading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 rounded bg-[#F2E0C2] w-full" />
              <div className="h-3 rounded bg-[#F2E0C2] w-11/12" />
              <div className="h-3 rounded bg-[#F2E0C2] w-10/12" />
              <div className="h-3 rounded bg-[#F2E0C2] w-9/12" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && response && (
            <div className="relative">
              <span
                aria-hidden
                className="font-garamond absolute -left-1 -top-6 select-none text-7xl leading-none"
                style={{ color: `${accent}33` }}
              >
                &ldquo;
              </span>
              <p className="font-garamond text-base sm:text-lg leading-relaxed text-[#2a1304] whitespace-pre-line pl-7">
                {cleanText}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
