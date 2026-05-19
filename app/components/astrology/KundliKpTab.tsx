"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { BirthDetails } from "../../lib/astrology/types";
import type { KpKind } from "../../lib/astrology/featureApi";
import { getKp, AuthRequiredError } from "../../lib/astrology/featureApi";
import KpChart from "./charts/KpChart";
import KpTable from "./charts/KpTable";

const BUTTONS: { id: KpKind; label: string }[] = [
  { id: "chart",       label: "Birth Chart" },
  { id: "planets",     label: "Planets" },
  { id: "cusps",       label: "House Cusps" },
  { id: "house-sigs",  label: "House Significators" },
  { id: "planet-sigs", label: "Planet Significators" },
];

interface Props {
  birth: BirthDetails;
}

export default function KundliKpTab({ birth }: Props) {
  const [cache, setCache] = useState<Record<string, unknown>>({});
  const [active, setActive] = useState<KpKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(id: KpKind) {
    setActive(id);
    setError(null);
    if (cache[id] !== undefined) return;
    setLoading(true);
    try {
      const res = await getKp(birth, id);
      setCache((c) => ({ ...c, [id]: res.result }));
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch KP data");
      }
    } finally {
      setLoading(false);
    }
  }

  const data = active ? cache[active] : undefined;
  const activeLabel = active ? BUTTONS.find((b) => b.id === active)?.label ?? active : "";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-[#8A6A2A]">Krishnamurti Paddhati</p>
        <div className="flex flex-wrap gap-1.5">
          {BUTTONS.map((b) => {
            const selected = b.id === active;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => pick(b.id)}
                className={
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (selected
                    ? "border-[#F7941D] bg-[#F7941D] text-white"
                    : "border-[#E5C99F] bg-white text-[#6b4a1f] hover:border-[#F7941D] hover:text-[#F7941D]")
                }
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
            {active ? `KP ${activeLabel}` : "Select a KP view"}
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
            <span>Generating KP {activeLabel}…</span>
          </div>
        )}

        {!active && !loading && (
          <p className="text-xs text-[#8A6A2A]">Click a button above to view KP data.</p>
        )}

        {data != null && active === "chart" && <KpChart data={data} />}
        {data != null && active && active !== "chart" && (
          <KpTable data={data} label={`KP ${activeLabel}`} />
        )}
      </div>
    </div>
  );
}
