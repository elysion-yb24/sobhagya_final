"use client";

import { useCallback, useState } from "react";
import { Heart } from "lucide-react";
import BirthDetailsForm from "../../components/astrology/BirthDetailsForm";
import GunMilanReport from "../../components/astrology/GunMilanReport";
import PageShell from "../../components/astrology/PageShell";
import LangToggle from "../../components/astrology/LangToggle";
import { useLanguage } from "../../components/astrology/LanguagePicker";
import type { BirthDetails, KundliLang, Language } from "../../lib/astrology/types";
import { clampKundliLang } from "../../lib/astrology/types";
import {
  computeGunMilan,
  type GunMilanResponse,
} from "../../lib/astrology/featureApi";
import { useDedupedAction } from "../../lib/astrology/useDedupedAction";
import { useRequireAuth } from "../../hooks/useRequireAuth";

interface MatchInput {
  male: BirthDetails;
  female: BirthDetails;
  language?: Language;
}

export default function GunMilanPage() {
  // Gun Milan calls the auth-gated compatibility endpoint; require login first.
  const authed = useRequireAuth("/services/gun-milan");

  const [male, setMale] = useState<BirthDetails | null>(null);
  const [female, setFemale] = useState<BirthDetails | null>(null);
  const [globalLang, setGlobalLang] = useLanguage();
  const [lang, setLang] = useState<KundliLang>(clampKundliLang(globalLang));

  const action = useDedupedAction<MatchInput, GunMilanResponse>(
    (input) => computeGunMilan(input.male, input.female, input.language),
  );

  const calculate = useCallback(async (overrideLang?: KundliLang) => {
    if (!male || !female) return;
    try {
      await action.run({ male, female, language: overrideLang ?? lang });
    } catch {
      /* surfaced via action.error */
    }
  }, [action, male, female, lang]);

  const switchLang = useCallback(async (next: KundliLang) => {
    if (next === lang) return;
    setLang(next);
    // Persist into the global picker so other pages remember the choice.
    setGlobalLang(next);
    // Refetch the match in the new language if we already have one.
    if (male && female && action.data) {
      await calculate(next);
    }
  }, [lang, setGlobalLang, male, female, action.data, calculate]);

  const { loading, data: response, error } = action;

  // While the auth guard redirects an unauthenticated user, render a minimal
  // placeholder instead of the partner forms.
  if (!authed) {
    return (
      <PageShell title="Gun Milan" subtitle="">
        <div className="rounded-xl border border-[#E5C99F] bg-white p-6 shadow-sm text-sm text-[#6b4a1f]">
          Checking your session…
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Gun Milan"
      subtitle="Traditional 36-point Vedic compatibility — Ashtakoot, Manglik comparison, obstructions, and a detailed report."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#E5C99F] bg-white shadow-sm p-5">
          <h2 className="font-garamond mb-3 text-lg font-semibold text-[#2a1304]">Male partner (M)</h2>
          <BirthDetailsForm
            onSubmit={setMale}
            submitLabel={male ? "Update male" : "Save male details"}
            persist={false}
            idPrefix="m"
            lockedGender="male"
          />
        </div>
        <div className="rounded-xl border border-[#E5C99F] bg-white shadow-sm p-5">
          <h2 className="font-garamond mb-3 text-lg font-semibold text-[#2a1304]">Female partner (F)</h2>
          <BirthDetailsForm
            onSubmit={setFemale}
            submitLabel={female ? "Update female" : "Save female details"}
            persist={false}
            idPrefix="f"
            lockedGender="female"
          />
        </div>
      </div>

      {male && female ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => calculate()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#E08015] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-[#E08015] hover:to-[#C66C0D] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#F7941D]/40"
            >
              <Heart size={16} />
              {loading ? "Calculating compatibility…" : "Calculate Match"}
            </button>
            <LangToggle
              lang={lang}
              onChange={switchLang}
              disabled={loading}
              ariaLabel="Gun Milan response language"
            />
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#E5C99F] bg-white p-6 text-center text-sm text-[#8A6A2A]">
          Save both partners&apos; birth details to calculate the match.
        </p>
      )}

      {loading && (
        <div className="rounded-xl border border-[#E5C99F] bg-white p-5 shadow-sm">
          <div className="space-y-2" aria-busy="true">
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

      {response && <GunMilanReport response={response} />}
    </PageShell>
  );
}
