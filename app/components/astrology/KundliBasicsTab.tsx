"use client";

import type { KundliResponse } from "../../lib/astrology/featureApi";
import ResultCard from "./ResultCard";

interface Section { key: keyof KundliResponse["result"]; title: string }

// D1 lives in the Charts tab; everything else stays here.
const SECTIONS: Section[] = [
  { key: "birthDetails",  title: "Birth Details" },
  { key: "astroDetails",  title: "Astro Details" },
  { key: "planets",       title: "Planetary Positions" },
  { key: "manglikDosha",  title: "Mangal Dosha" },
  { key: "kalsarpaDosha", title: "Kalsarpa Dosha" },
  { key: "pitraDosha",    title: "Pitra Dosha" },
  { key: "rudraksha",     title: "Recommended Rudraksha" },
  { key: "gemstone",      title: "Gemstone Recommendation" },
];

interface Props {
  response: KundliResponse;
}

export default function KundliBasicsTab({ response }: Props) {
  return (
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
  );
}
