"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import BirthDetailsForm from "../../components/astrology/BirthDetailsForm";
import ResultCard from "../../components/astrology/ResultCard";
import PageShell from "../../components/astrology/PageShell";
import SignInGate from "../../components/astrology/SignInGate";
import { useLanguage } from "../../components/astrology/LanguagePicker";
import type { BirthDetails } from "../../lib/astrology/types";
import {
  computeGunMilan,
  AuthRequiredError,
  type GunMilanResponse,
} from "../../lib/astrology/featureApi";
import { getAuthToken } from "../../utils/auth-utils";

const SECTIONS: { key: keyof GunMilanResponse["result"]; title: string }[] = [
  { key: "ashtakoot",    title: "Ashtakoot Points (36-Point Guna Milan)" },
  { key: "manglik",      title: "Manglik Comparison" },
  { key: "obstructions", title: "Match Obstructions" },
  { key: "report",       title: "Detailed Compatibility Report" },
];

export default function GunMilanPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [male, setMale] = useState<BirthDetails | null>(null);
  const [female, setFemale] = useState<BirthDetails | null>(null);
  const [response, setResponse] = useState<GunMilanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang] = useLanguage();

  useEffect(() => {
    setAuthed(!!getAuthToken());
  }, []);

  async function calculate() {
    if (!male || !female) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await computeGunMilan(male, female, lang);
      setResponse(data);
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        setAuthed(false);
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to compute match.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (authed === false) {
    return (
      <PageShell
        title="Gun Milan"
        subtitle="Traditional 36-point Vedic compatibility analysis for marriage."
      >
        <SignInGate
          feature="Gun Milan"
          description="Sign in to calculate the 36-point Ashtakoot match and view the detailed compatibility report."
        />
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
          />
        </div>
        <div className="rounded-xl border border-[#E5C99F] bg-white shadow-sm p-5">
          <h2 className="font-garamond mb-3 text-lg font-semibold text-[#2a1304]">Female partner (F)</h2>
          <BirthDetailsForm
            onSubmit={setFemale}
            submitLabel={female ? "Update female" : "Save female details"}
            persist={false}
            idPrefix="f"
          />
        </div>
      </div>

      {male && female ? (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={calculate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#E08015] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-[#E08015] hover:to-[#C66C0D] disabled:opacity-50"
          >
            <Heart size={16} />
            {loading ? "Calculating compatibility…" : "Calculate Match"}
          </button>
          {response?.fromCache && (
            <span className="text-[11px] text-[#8A6A2A]">Served from cache.</span>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#E5C99F] bg-white p-6 text-center text-sm text-[#8A6A2A]">
          Save both partners&apos; birth details to calculate the match.
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {response && (
        <section className="space-y-4">
          {SECTIONS.map((s) => {
            const data = response.result[s.key];
            if (data == null) return null;
            return (
              <ResultCard
                key={s.key}
                title={s.title}
                result={{ kind: "json", data, endpoint: `gun-milan/${String(s.key)}` }}
              />
            );
          })}
        </section>
      )}
    </PageShell>
  );
}
