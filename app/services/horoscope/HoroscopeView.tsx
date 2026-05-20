"use client";

import { useState } from "react";
import PageShell from "../../components/astrology/PageShell";
import ResultCard from "../../components/astrology/ResultCard";
import { useLanguage } from "../../components/astrology/LanguagePicker";
import { ZODIAC_SIGNS, ZODIAC_SYMBOLS, type ZodiacSign } from "../../lib/astrology/types";
import { getHoroscope, type HoroscopePeriod, type HoroscopeResponse } from "../../lib/astrology/featureApi";

const PERIODS: { key: HoroscopePeriod; label: string }[] = [
  { key: "today",     label: "Today" },
  { key: "tomorrow",  label: "Tomorrow" },
  { key: "yesterday", label: "Yesterday" },
  { key: "weekly",    label: "This Week" },
  { key: "monthly",   label: "This Month" },
  { key: "yearly",    label: "This Year" },
];

export default function HoroscopeView({ initialSign }: { initialSign?: ZodiacSign } = {}) {
  const [sign, setSign] = useState<ZodiacSign>(initialSign ?? "aries");
  const [period, setPeriod] = useState<HoroscopePeriod>("today");
  const [response, setResponse] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang] = useLanguage();

  async function run() {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await getHoroscope(sign, period, lang);
      setResponse(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch horoscope.");
    } finally {
      setLoading(false);
    }
  }

  const periodLabel = PERIODS.find((p) => p.key === period)!.label;

  return (
    <PageShell
      title="Daily Horoscope"
      subtitle="Pick a zodiac sign and a time period — today, tomorrow, yesterday, this week, this month, or this year. No birth details needed."
    >
      <div className="rounded-xl border border-[#E5C99F] bg-white shadow-sm p-5 space-y-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#8A6A2A] font-semibold mb-2">Zodiac sign</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ZODIAC_SIGNS.map((s) => (
              <button
                key={s}
                onClick={() => setSign(s)}
                className={
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors " +
                  (sign === s
                    ? "border-[#F7941D] bg-[#FFF6E8] text-[#C66C0D]"
                    : "border-[#E5C99F] bg-white text-[#333] hover:bg-[#FFFDF5]")
                }
              >
                <span className="text-lg">{ZODIAC_SYMBOLS[s]}</span>
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#8A6A2A] font-semibold mb-2">Period</div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs transition-colors " +
                  (period === p.key
                    ? "border-[#F7941D] bg-[#FFF6E8] text-[#C66C0D]"
                    : "border-[#E5C99F] bg-white text-[#333] hover:bg-[#FFFDF5]")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-[#F7941D] to-[#E08015] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-[#E08015] hover:to-[#C66C0D] disabled:opacity-50"
        >
          {loading ? "Loading…" : `Get ${ZODIAC_SYMBOLS[sign]} ${sign} horoscope — ${periodLabel}`}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {response && (
        <ResultCard
          title={`${sign} — ${periodLabel}${response.fromCache ? " (cached)" : ""}`}
          result={{ kind: "json", data: response.data, endpoint: `horoscope/${response.period}/${response.sign}` }}
        />
      )}
    </PageShell>
  );
}
