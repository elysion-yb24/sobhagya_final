"use client";

import { useState } from "react";
import type { BirthDetails, KundliLang } from "../../lib/astrology/types";
import type { KundliResponse } from "../../lib/astrology/featureApi";
import KundliBasicsTab from "./KundliBasicsTab";
import KundliChartsTab from "./KundliChartsTab";
import KundliDashaTab from "./KundliDashaTab";
import KundliAshtakvargaTab from "./KundliAshtakvargaTab";
import KundliKpTab from "./KundliKpTab";

type TabId = "basics" | "charts" | "dasha" | "ashtakvarga" | "kp";

const TABS: { id: TabId; label: string }[] = [
  { id: "basics",      label: "Basics" },
  { id: "charts",      label: "Charts" },
  { id: "dasha",       label: "Dasha" },
  { id: "ashtakvarga", label: "Ashtakvarga" },
  { id: "kp",          label: "KP" },
];

interface Props {
  birth: BirthDetails;
  response: KundliResponse;
  lang: KundliLang;
}

export default function KundliTabs({ birth, response, lang }: Props) {
  const [active, setActive] = useState<TabId>("basics");

  return (
    <section className="space-y-4">
      <div
        role="tablist"
        aria-label="Kundli sections"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E5C99F] bg-white p-1 shadow-sm"
      >
        {TABS.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              type="button"
              onClick={() => setActive(t.id)}
              className={
                "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors " +
                (selected
                  ? "bg-gradient-to-r from-[#F7941D] to-[#E08015] text-white shadow-sm"
                  : "text-[#6b4a1f] hover:bg-[#FFF6E8]")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/*
        Lazy tabs (charts/dasha/ashtakvarga/kp) are keyed by `lang` so that
        switching the toggle remounts them — their internal client-side caches
        reset and the next click on a button fetches in the new language.
        Basics re-renders naturally because `response` is the freshly-fetched
        payload from the parent's switchLang call.
      */}
      <div>
        {active === "basics" && <KundliBasicsTab response={response} />}
        {active === "charts" && (
          <KundliChartsTab
            key={lang}
            birth={birth}
            initialD1={response.result.d1Chart}
            lang={lang}
          />
        )}
        {active === "dasha" && <KundliDashaTab key={lang} birth={birth} lang={lang} />}
        {active === "ashtakvarga" && <KundliAshtakvargaTab key={lang} birth={birth} lang={lang} />}
        {active === "kp" && <KundliKpTab key={lang} birth={birth} lang={lang} />}
      </div>
    </section>
  );
}
