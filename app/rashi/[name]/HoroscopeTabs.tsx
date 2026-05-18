"use client";

import { useEffect, useState } from "react";
import { Sparkles, Sun, Calendar, CalendarRange, AlertCircle } from "lucide-react";
import { getHoroscope, type HoroscopePeriod, type HoroscopeResponse } from "../../lib/astrology/featureApi";
import type { ZodiacSign } from "../../lib/astrology/types";

type TabKey = "today" | "tomorrow" | "weekly" | "yearly";

const TABS: { key: TabKey; period: HoroscopePeriod; label: string; icon: typeof Sun }[] = [
  { key: "today",    period: "today",    label: "Today's Insight",     icon: Sun },
  { key: "tomorrow", period: "tomorrow", label: "Tomorrow's Guidance", icon: Sparkles },
  { key: "weekly",   period: "weekly",   label: "Weekly Horoscope",    icon: Calendar },
  { key: "yearly",   period: "yearly",   label: "Yearly Horoscope",    icon: CalendarRange },
];

interface Props {
  sign: ZodiacSign;
}

interface TabState {
  loading: boolean;
  data: HoroscopeResponse | null;
  error: string | null;
}

const EMPTY: TabState = { loading: false, data: null, error: null };

/**
 * Renders the four-tab horoscope panel beneath the static rashi profile.
 * Each tab loads lazily on first activation; subsequent activations re-use
 * the cached result in component state (and the backend hot-path will be
 * served from Redis/Mongo without firing AstrologyAPI).
 */
export default function HoroscopeTabs({ sign }: Props) {
  const [active, setActive] = useState<TabKey>("today");
  const [state, setState] = useState<Record<TabKey, TabState>>({
    today: { ...EMPTY }, tomorrow: { ...EMPTY }, weekly: { ...EMPTY }, yearly: { ...EMPTY },
  });

  useEffect(() => {
    const slot = state[active];
    if (slot.data || slot.loading) return;
    let cancelled = false;
    setState((s) => ({ ...s, [active]: { ...s[active], loading: true, error: null } }));
    const period = TABS.find((t) => t.key === active)!.period;
    getHoroscope(sign, period, "en")
      .then((data) => {
        if (cancelled) return;
        setState((s) => ({ ...s, [active]: { loading: false, data, error: null } }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Couldn't load this horoscope.";
        setState((s) => ({ ...s, [active]: { loading: false, data: null, error: message } }));
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sign]);

  const current = state[active];

  return (
    <section
      className="mt-10 sm:mt-12 rounded-2xl sm:rounded-3xl border border-orange-100/60 bg-white shadow-lg shadow-orange-100/40 p-5 sm:p-7 md:p-9"
      aria-labelledby="horoscope-heading"
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="horoscope-heading"
          className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#745802]"
          style={{ fontFamily: "EB Garamond, serif" }}
        >
          Horoscopes
        </h2>
        {current.data?.fromCache && (
          <span className="text-[10px] uppercase tracking-wider text-[#8A6A2A]">
            served from cache
          </span>
        )}
      </div>

      <div role="tablist" aria-label="Horoscope periods" className="flex flex-wrap gap-2 border-b border-orange-100">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.key}`}
              id={`tab-${t.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(t.key)}
              className={
                "inline-flex items-center gap-1.5 -mb-px border-b-2 px-3 sm:px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 rounded-t " +
                (isActive
                  ? "border-[#F7941D] text-[#a35d00]"
                  : "border-transparent text-gray-600 hover:text-[#745802]")
              }
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="mt-5 min-h-[140px]"
      >
        {current.loading && <TabSkeleton />}
        {current.error && !current.loading && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Couldn&apos;t load this horoscope.</p>
              <p className="mt-1 text-xs">{current.error}</p>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, [active]: { ...EMPTY } }))}
                className="mt-2 text-xs font-semibold text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {!current.loading && !current.error && current.data && (
          <HoroscopeBody data={current.data.data} />
        )}
      </div>
    </section>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="h-3 w-24 rounded bg-orange-100/70 animate-pulse" />
      <div className="h-3 w-full rounded bg-orange-100/70 animate-pulse" />
      <div className="h-3 w-full rounded bg-orange-100/70 animate-pulse" />
      <div className="h-3 w-4/5 rounded bg-orange-100/70 animate-pulse" />
      <div className="h-3 w-3/5 rounded bg-orange-100/70 animate-pulse" />
    </div>
  );
}

interface HoroscopePayload {
  prediction?: string;
  bot_response?: string;
  prediction_date?: string;
  prediction_month?: string;
  prediction_year?: string;
  week?: string;
  month?: string;
  status?: boolean;
  [key: string]: unknown;
}

function HoroscopeBody({ data }: { data: unknown }) {
  const payload = (data && typeof data === "object" ? data : {}) as HoroscopePayload;

  // AstrologyAPI returns different shapes per period; extract the largest text blob.
  const text =
    (typeof payload.prediction === "string" && payload.prediction) ||
    (typeof payload.bot_response === "string" && payload.bot_response) ||
    "";

  const meta = [
    typeof payload.prediction_date === "string" ? payload.prediction_date : "",
    typeof payload.week === "string" ? payload.week : "",
    typeof payload.month === "string" ? payload.month : "",
    typeof payload.prediction_year === "string" ? payload.prediction_year : "",
  ].filter(Boolean).join(" · ");

  if (!text) {
    return (
      <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/60 p-5 text-sm text-[#8A6A2A]">
        Prediction unavailable for this period. Please try again shortly.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meta && (
        <p className="text-[11px] uppercase tracking-wider text-[#a35d00]">{meta}</p>
      )}
      <p className="text-sm sm:text-base leading-relaxed text-gray-700 text-justify whitespace-pre-line">
        {text}
      </p>
    </div>
  );
}
