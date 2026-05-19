"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { BirthDetails, ChartId } from "../../lib/astrology/types";
import { CHART_ID_LABELS, VEDIC_CHART_IDS } from "../../lib/astrology/types";
import { generateDivisionalChart, AuthRequiredError } from "../../lib/astrology/featureApi";
import DivisionalChart from "./charts/DivisionalChart";

interface Props {
  birth: BirthDetails;
  /** D1 chart from the initial `/kundli/generate` response — pre-loaded, no fetch needed. */
  initialD1: unknown;
}

export default function KundliChartsTab({ birth, initialD1 }: Props) {
  // Cache fetched charts client-side so re-clicking the same divisional chart
  // doesn't refetch. D1 is pre-seeded from the initial generate response.
  const [cache, setCache] = useState<Record<string, unknown>>({ D1: initialD1 });
  const [active, setActive] = useState<ChartId>("D1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(id: ChartId) {
    setActive(id);
    setError(null);
    if (cache[id] !== undefined) return;
    setLoading(true);
    try {
      const res = await generateDivisionalChart(birth, id);
      setCache((c) => ({ ...c, [id]: (res.result as { svg?: unknown })?.svg ?? res.result }));
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch chart");
      }
    } finally {
      setLoading(false);
    }
  }

  const activeData = cache[active];
  const activeLabel = CHART_ID_LABELS[active];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-[#8A6A2A]">Divisional charts</p>
        <div className="flex flex-wrap gap-1.5">
          {VEDIC_CHART_IDS.map((id) => {
            const selected = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pick(id)}
                className={
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (selected
                    ? "border-[#F7941D] bg-[#F7941D] text-white"
                    : "border-[#E5C99F] bg-white text-[#6b4a1f] hover:border-[#F7941D] hover:text-[#F7941D]")
                }
                title={CHART_ID_LABELS[id]}
              >
                {id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#2a1304]">{activeLabel}</h3>
          {loading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#8A6A2A]">
              <Loader2 size={12} className="animate-spin" /> Fetching…
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>
        )}

        {loading && !activeData && (
          <div className="flex items-center gap-2 text-sm text-[#6b4a1f]">
            <Sparkles size={14} className="text-[#F7941D]" />
            <span>Generating {active}…</span>
          </div>
        )}

        {!loading && !error && activeData == null && (
          <p className="text-xs text-[#8A6A2A]">Chart not available.</p>
        )}

        {activeData != null && <DivisionalChart data={activeData} />}
      </div>
    </div>
  );
}
