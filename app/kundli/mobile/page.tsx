"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import ResultCard from "../../components/astrology/ResultCard";
import PageShell from "../../components/astrology/PageShell";
import { generateMobileKundli, type KundliResponse } from "../../lib/astrology/featureApi";

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

function MobileKundliContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<KundliResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKundli = async () => {
    setLoading(true);
    setError(null);
    try {
      const userName = searchParams.get("userName") || undefined;
      const userGender = searchParams.get("userGender") || undefined;
      const userDOB = searchParams.get("userDOB") || undefined;
      const userTOB = searchParams.get("userTOB") || undefined;
      const userGeo = searchParams.get("userGeo") || undefined;
      const language = searchParams.get("language") || "en";

      if (!userDOB || !userTOB || !userGeo) {
        throw new Error("Missing required parameters: DOB, TOB, or Geo Location.");
      }

      const res = await generateMobileKundli({
        userName,
        userGender,
        userDOB,
        userTOB,
        userGeo,
        language: language as any,
      });

      setResponse(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate Kundli.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKundli();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E5C99F] bg-white p-6 shadow-sm mx-4 my-6">
        <div className="flex flex-col items-center justify-center gap-4 text-[#6b4a1f] min-h-[50vh]">
          <Sparkles size={32} className="text-[#F7941D] animate-spin-slow" />
          <h2 className="text-xl font-semibold">Generating your Kundli</h2>
          <p className="text-sm text-center text-[#8A6A2A]">
            Reading cosmic positions and planetary alignments...
          </p>
          <div className="mt-6 space-y-3 w-full max-w-md" aria-hidden="true">
            <div className="h-4 w-1/3 rounded bg-[#F7E2BD]/70 animate-pulse mx-auto" />
            <div className="h-4 w-full rounded bg-[#F7E2BD]/70 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-[#F7E2BD]/70 animate-pulse mx-auto" />
            <div className="h-4 w-2/3 rounded bg-[#F7E2BD]/70 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 mx-4 my-6 rounded-xl border border-red-200 bg-red-50 text-red-800 min-h-[50vh]">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h2 className="text-lg font-bold mb-2">Generation Failed</h2>
        <p className="text-center text-sm mb-6 max-w-sm">{error}</p>
        <button
          onClick={fetchKundli}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (response) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="flex flex-col items-center text-center gap-1 mb-6">
          <span className="rounded-full bg-[#FFE9C7] px-3 py-1 text-xs font-bold tracking-wider text-[#C66C0D] uppercase shadow-sm">
            Your Personal Kundli
          </span>
          {response.fromCache && (
            <span className="text-xs text-[#8A6A2A] bg-white border border-[#E5C99F] px-2 py-0.5 rounded-md shadow-sm mt-2">
              Served from Cache
            </span>
          )}
        </div>
        <div className="space-y-4 pb-12">
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
      </div>
    );
  }

  return null;
}

export default function MobileKundliPage() {
  return (
    <PageShell
      title="Mobile Kundli"
      subtitle="Your Vedic Astrological Chart"
    >
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Sparkles className="animate-spin text-[#F7941D]" size={32} />
        </div>
      }>
        <MobileKundliContent />
      </Suspense>
    </PageShell>
  );
}
