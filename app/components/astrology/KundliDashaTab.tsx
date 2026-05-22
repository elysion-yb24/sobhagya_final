"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { BirthDetails, KundliLang } from "../../lib/astrology/types";
import {
  getVimshottariDasha,
  getYoginiDasha,
  AuthRequiredError,
} from "../../lib/astrology/featureApi";
import VimshottariWheel from "./charts/VimshottariWheel";
import YoginiWheel from "./charts/YoginiWheel";

type DashaVariant = "vimshottari" | "yogini";

const BUTTONS: { id: DashaVariant; label: string; desc: string }[] = [
  { id: "vimshottari", label: "Vimshottari", desc: "120-year planetary cycle" },
  { id: "yogini",      label: "Yogini",      desc: "36-year cycle" },
];

interface Props {
  birth: BirthDetails;
  lang: KundliLang;
}

export default function KundliDashaTab({ birth, lang }: Props) {
  const [cache, setCache] = useState<Record<string, unknown>>({});
  const [active, setActive] = useState<DashaVariant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(id: DashaVariant) {
    setActive(id);
    setError(null);
    if (cache[id] !== undefined) return;
    setLoading(true);
    try {
      const fetcher = id === "vimshottari" ? getVimshottariDasha : getYoginiDasha;
      const res = await fetcher({ ...birth, language: lang });
      setCache((c) => ({ ...c, [id]: res.result }));
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch dasha data");
      }
    } finally {
      setLoading(false);
    }
  }

  const data = active ? cache[active] : undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-[#8A6A2A]">Dasha systems</p>
        <div className="flex flex-wrap gap-1.5">
          {BUTTONS.map((b) => {
            const selected = b.id === active;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => pick(b.id)}
                className={
                  "rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-colors " +
                  (selected
                    ? "border-[#F7941D] bg-[#F7941D] text-white"
                    : "border-[#E5C99F] bg-white text-[#6b4a1f] hover:border-[#F7941D] hover:text-[#F7941D]")
                }
                title={b.desc}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#2a1304]">
            {active ? BUTTONS.find((b) => b.id === active)!.label + " Dasha" : "Select a dasha system"}
          </h3>
          {loading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#8A6A2A]">
              <Loader2 size={12} className="animate-spin" /> Fetching…
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>
        )}

        {loading && !data && (
          <div className="flex items-center gap-2 text-sm text-[#6b4a1f]">
            <Sparkles size={14} className="text-[#F7941D]" />
            <span>Generating dasha wheel…</span>
          </div>
        )}

        {!active && !loading && (
          <p className="text-xs text-[#8A6A2A]">Click a dasha system above to view the wheel.</p>
        )}

        {data != null && active === "vimshottari" && <VimshottariWheel data={data} />}
        {data != null && active === "yogini" && <YoginiWheel data={data} />}
      </div>
    </div>
  );
}
