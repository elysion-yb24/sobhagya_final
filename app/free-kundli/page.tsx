"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Sparkles } from "lucide-react";
import BirthDetailsForm, { loadStoredBirth } from "../components/astrology/BirthDetailsForm";
import ResultCard from "../components/astrology/ResultCard";
import PageShell from "../components/astrology/PageShell";
import SignInGate from "../components/astrology/SignInGate";
import { useLanguage } from "../components/astrology/LanguagePicker";
import type { BirthDetails } from "../lib/astrology/types";
import {
  generateKundli,
  AuthRequiredError,
  type KundliResponse,
} from "../lib/astrology/featureApi";
import { getAuthToken } from "../utils/auth-utils";

const SECTIONS: { key: keyof KundliResponse["result"]; title: string }[] = [
  { key: "birthDetails",   title: "Birth Details" },
  { key: "astroDetails",   title: "Astro Details" },
  { key: "planets",        title: "Planetary Positions" },
  { key: "d1Chart",        title: "D1 Rashi Chart" },
  { key: "manglikDosha",   title: "Mangal Dosha" },
  { key: "kalsarpaDosha",  title: "Kalsarpa Dosha" },
  { key: "pitraDosha",     title: "Pitra Dosha" },
  { key: "rudraksha",      title: "Recommended Rudraksha" },
  { key: "gemstone",       title: "Gemstone Recommendation" },
];

export default function FreeKundliPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [birth, setBirth] = useState<BirthDetails | null>(null);
  const [birthOpen, setBirthOpen] = useState(true);
  const [response, setResponse] = useState<KundliResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang] = useLanguage();

  useEffect(() => {
    setAuthed(!!getAuthToken());
    const stored = loadStoredBirth();
    if (stored) {
      setBirth(stored);
      setBirthOpen(false);
    }
  }, []);

  async function run(b: BirthDetails) {
    setBirth(b);
    setBirthOpen(false);
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await generateKundli({ ...b, language: lang });
      setResponse(data);
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        setAuthed(false);
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to generate Kundli.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (authed === false) {
    return (
      <PageShell
        title="Free Kundli Generator"
        subtitle="Your complete Vedic birth chart with planets, doshas and remedies — generated on demand."
      >
        <SignInGate feature="Free Kundli Generator" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Free Kundli Generator"
      subtitle="Generate your complete Vedic birth chart — planetary positions, divisional chart, doshas, gemstone and rudraksha remedies."
    >
      {/* Step 1 — Birth details */}
      <section className="rounded-xl border border-[#E5C99F] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setBirthOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="rounded-md bg-[#FFE9C7] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#C66C0D] uppercase">Step 1</span>
            <h2 className="text-sm font-semibold text-[#2a1304]">Birth details</h2>
            {birth && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#6b4a1f] truncate">
                <MapPin size={12} className="text-[#B98A3C]" />
                {birth.place ? `${birth.place} · ` : ""}
                {birth.day}/{birth.month}/{birth.year} · {pad(birth.hour)}:{pad(birth.min)}
              </span>
            )}
          </div>
          {birthOpen ? <ChevronUp size={16} className="text-[#6b4a1f]" /> : <ChevronDown size={16} className="text-[#6b4a1f]" />}
        </button>
        {birthOpen && (
          <div className="border-t border-[#F0DAB2] p-5">
            <BirthDetailsForm
              value={birth ?? undefined}
              onSubmit={run}
              submitLabel={loading ? "Generating…" : "Generate Kundli"}
            />
          </div>
        )}
      </section>

      {/* Step 2 — Results */}
      {loading && (
        <div className="rounded-xl border border-[#E5C99F] bg-white p-6 text-center text-sm text-[#6b4a1f] animate-pulse">
          <Sparkles className="inline mr-2" size={16} /> Generating your Kundli…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {response && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-[#FFE9C7] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#C66C0D] uppercase">Result</span>
            <h2 className="text-sm font-semibold text-[#2a1304]">
              Your Kundli {response.fromCache && <span className="text-[#8A6A2A]">(served from cache)</span>}
            </h2>
          </div>
          <div className="space-y-4">
            {SECTIONS.map((s) => {
              const data = response.result[s.key];
              if (data == null) return null;
              return (
                <ResultCard
                  key={s.key}
                  title={s.title}
                  result={{ kind: "json", data, endpoint: `kundli/${String(s.key)}` }}
                />
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}

function pad(n: number): string { return String(n).padStart(2, "0"); }
