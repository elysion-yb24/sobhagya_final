"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Sparkles } from "lucide-react";
import BirthDetailsForm, { loadStoredBirth } from "../components/astrology/BirthDetailsForm";
import KundliTabs from "../components/astrology/KundliTabs";
import PageShell from "../components/astrology/PageShell";
import { useLanguage } from "../components/astrology/LanguagePicker";
import LangToggle from "../components/astrology/LangToggle";
import type { BirthDetails, Language, KundliLang } from "../lib/astrology/types";
import { clampKundliLang } from "../lib/astrology/types";
import {
  generateKundli,
  type KundliResponse,
} from "../lib/astrology/featureApi";
import { useDedupedAction } from "../lib/astrology/useDedupedAction";
import { useRequireAuth } from "../hooks/useRequireAuth";

export default function FreeKundliPage() {
  // Kundli requires login: a guest is bounced to /login and returned here
  // after sign-in. The lazy Charts/Dasha/Ashtakvarga/KP tabs hit auth-required
  // backend endpoints, so gating the whole page keeps the experience coherent.
  const authed = useRequireAuth("/free-kundli");

  const [birth, setBirth] = useState<BirthDetails | null>(null);
  const [birthOpen, setBirthOpen] = useState(true);
  const [globalLang, setGlobalLang] = useLanguage();
  const [lang, setLang] = useState<KundliLang>(clampKundliLang(globalLang));

  const action = useDedupedAction<
    BirthDetails & { language?: Language },
    KundliResponse
  >(generateKundli);

  useEffect(() => {
    const stored = loadStoredBirth();
    if (stored) {
      setBirth(stored);
    }
  }, []);

  const run = useCallback(async (b: BirthDetails, overrideLang?: KundliLang) => {
    setBirth(b);
    const useLang: KundliLang = overrideLang ?? lang;
    try {
      await action.run({ ...b, language: useLang });
      setBirthOpen(false);
    } catch {
      // useDedupedAction already surfaces the error via action.error
    }
  }, [action, lang]);

  const onSubmit = useCallback((b: BirthDetails) => run(b), [run]);

  const switchLang = useCallback(async (next: KundliLang) => {
    if (next === lang) return;
    setLang(next);
    // Persist the choice into the global picker too so other pages remember it.
    setGlobalLang(next);
    // Refresh the kundli in the new language. Lazy tabs (Charts/Dasha/etc.)
    // are remounted via `key={lang}` inside KundliTabs so their internal
    // caches reset and re-fetch in the new language on next click.
    if (birth) {
      await run(birth, next);
    }
  }, [lang, setGlobalLang, birth, run]);

  const { loading, data: response, error } = action;

  // While the auth guard redirects an unauthenticated user, render a minimal
  // placeholder instead of the form so guests never see (or submit) it.
  if (!authed) {
    return (
      <PageShell title="Free Kundli Generator" subtitle="">
        <div className="rounded-xl border border-[#E5C99F] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-[#6b4a1f]">
            <Sparkles size={16} className="text-[#F7941D]" />
            <span>Checking your session…</span>
          </div>
        </div>
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
              onSubmit={onSubmit}
              submitLabel={loading ? "Generating…" : "Generate Kundli"}
            />
          </div>
        )}
      </section>

      {/* Step 2 — Results */}
      {loading && (
        <div className="rounded-xl border border-[#E5C99F] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-[#6b4a1f]">
            <Sparkles size={16} className="text-[#F7941D]" />
            <span>Generating your Kundli…</span>
          </div>
          <div className="mt-4 space-y-2" aria-hidden="true">
            <div className="h-3 w-1/3 rounded bg-[#F7E2BD]/70 animate-pulse" />
            <div className="h-3 w-full rounded bg-[#F7E2BD]/70 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-[#F7E2BD]/70 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-[#F7E2BD]/70 animate-pulse" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {response && birth && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#FFE9C7] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#C66C0D] uppercase">Result</span>
              <h2 className="text-sm font-semibold text-[#2a1304]">Your Kundli</h2>
            </div>
            <LangToggle lang={lang} onChange={switchLang} disabled={loading} ariaLabel="Kundli response language" />
          </div>
          <KundliTabs birth={birth} response={response} lang={lang} />
        </section>
      )}
    </PageShell>
  );
}

function pad(n: number): string { return String(n).padStart(2, "0"); }
