"use client";

import { useMemo, useState } from "react";

interface Props {
  data: unknown;
  scope: string;     // 'sarva' | planet name
  label: string;
}

// Canonical bindu totals — used both as an "expected" guide rail in the header
// and to detect whether the extraction is plausible.
const PLANET_TOTALS: Record<string, number> = {
  sun: 48, moon: 49, mars: 39, mercury: 54, jupiter: 56, venus: 52, saturn: 39,
};
const SARVA_TOTAL = 337;

const ZODIAC_NAMES = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
];

// Centroids of the 12 cells in a North-Indian diamond chart (viewBox 0 0 400 400).
// Houses are arranged counter-clockwise from House 1 (Asc) at top centre.
const HOUSE_BINDU_POS = [
  { x: 200, y: 105 },   // H1 (Asc)
  { x: 130, y: 35 },    // H2
  { x: 55,  y: 130 },   // H3
  { x: 110, y: 200 },   // H4
  { x: 55,  y: 270 },   // H5
  { x: 130, y: 365 },   // H6
  { x: 200, y: 300 },   // H7
  { x: 270, y: 365 },   // H8
  { x: 345, y: 270 },   // H9
  { x: 290, y: 200 },   // H10
  { x: 345, y: 130 },   // H11
  { x: 270, y: 35 },    // H12
];

// Small red house-number labels — placed toward the inner (centre-pointing)
// corner of each cell so they don't overlap the bindu numerals.
const HOUSE_LABEL_POS = [
  { x: 200, y: 155 },   // H1 — inside the kite, just below the Asc bindus
  { x: 165, y: 75 },    // H2
  { x: 80,  y: 165 },   // H3
  { x: 155, y: 220 },   // H4 — right edge of left kite
  { x: 80,  y: 235 },   // H5
  { x: 165, y: 325 },   // H6
  { x: 200, y: 245 },   // H7 — inside top of bottom kite
  { x: 235, y: 325 },   // H8
  { x: 320, y: 235 },   // H9
  { x: 245, y: 220 },   // H10
  { x: 320, y: 165 },   // H11
  { x: 235, y: 75 },    // H12
];

export default function AshtakvargaGrid({ data, scope, label }: Props) {
  const bindus = useMemo(() => extractBindus(data), [data]);
  const [showDebug, setShowDebug] = useState(false);

  const total = bindus.reduce((a, b) => a + b, 0);
  const expectedTotal =
    scope === "sarva" ? SARVA_TOTAL :
    PLANET_TOTALS[scope.toLowerCase()] ?? null;
  const allZero = bindus.every((v) => v === 0);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h4 className="text-sm font-semibold text-[#2a1304]">{label}</h4>
        <p className="text-[11px] text-[#8A6A2A]">
          Total Bindus:{" "}
          <span className="font-bold text-[#F7941D]">{total}</span>
          {expectedTotal !== null && (
            <span className="text-[#8A6A2A]"> / {expectedTotal}</span>
          )}
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto"
          role="img"
          aria-label={`${label} diamond chart`}
        >
          {/* Background + outer square */}
          <rect x="2" y="2" width="396" height="396" fill="#FFFDF5" stroke="#2a1304" strokeWidth="2.5" />

          {/* Two diagonals */}
          <line x1="2" y1="2" x2="398" y2="398" stroke="#2563EB" strokeWidth="1.5" />
          <line x1="398" y1="2" x2="2" y2="398" stroke="#2563EB" strokeWidth="1.5" />

          {/* Inner rhombus (rotated square) */}
          <polygon
            points="200,2 398,200 200,398 2,200"
            fill="none"
            stroke="#2563EB"
            strokeWidth="1.5"
          />

          {/* Asc highlight: yellow rect behind House 1's number */}
          <rect
            x={HOUSE_LABEL_POS[0].x - 24}
            y={HOUSE_LABEL_POS[0].y - 13}
            width="48"
            height="26"
            fill="#FFF176"
            stroke="#1976D2"
            strokeWidth="1.5"
            rx="2"
          />
          <text
            x={HOUSE_BINDU_POS[0].x}
            y={HOUSE_BINDU_POS[0].y - 22}
            textAnchor="middle"
            fontSize="12"
            fill="#1976D2"
            fontWeight="600"
          >
            Asc
          </text>

          {/* Bindu numbers (large black, one per cell centroid) */}
          {HOUSE_BINDU_POS.map((pos, i) => (
            <text
              key={`bindu-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fontWeight="700"
              fill="#0f172a"
            >
              {bindus[i]}
            </text>
          ))}

          {/* House-number labels (small red) */}
          {HOUSE_LABEL_POS.map((pos, i) => (
            <text
              key={`hl-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="700"
              fill={i === 0 ? "#1976D2" : "#D14040"}
            >
              {i + 1}
            </text>
          ))}
        </svg>
      </div>

      {allZero && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">
              No bindus extracted. The upstream response shape may differ.
            </span>
            <button
              type="button"
              onClick={() => setShowDebug((s) => !s)}
              className="rounded-md border border-amber-400 bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-800 hover:bg-amber-100"
            >
              {showDebug ? "Hide raw JSON" : "Show raw JSON"}
            </button>
          </div>
          {showDebug && (
            <pre className="mt-2 max-h-72 overflow-auto rounded bg-amber-100 p-2 text-[10px] leading-snug">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Bindu extraction                                                           */
/* ------------------------------------------------------------------------- */

/**
 * AstrologyAPI's `sarvashtak` / `planet_ashtak/<planet>` responses vary in
 * shape across versions and planets. We try, in order:
 *   1. Recursively walk the data tree for any array of 12 numbers (or 12
 *      objects with a recognisable bindu field).
 *   2. Look for sign-keyed objects (aries..pisces).
 *   3. Look for house-keyed objects ("1".."12" / house_1..house_12).
 *
 * If nothing matches, we return [0]*12 — the UI then surfaces a debug pane
 * so the actual shape can be inspected.
 */
function extractBindus(data: unknown): number[] {
  const fromArray = findArrayOf12(data);
  if (fromArray) return fromArray;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;

    // Sign-keyed
    const fromSigns = ZODIAC_NAMES.map((s) => readNumeric(obj, [s, capitalise(s), s.toUpperCase()]));
    if (fromSigns.some((v) => v > 0)) return fromSigns;

    // House-keyed
    const fromHouses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      const v = readNumeric(obj, [
        String(h),
        `house_${h}`,
        `house${h}`,
        `h${h}`,
        `bhava_${h}`,
        `bhava${h}`,
      ]);
      fromHouses.push(v);
    }
    if (fromHouses.some((v) => v > 0)) return fromHouses;

    // Recurse into nested objects
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") {
        const inner = extractBindus(v);
        if (inner.some((x) => x > 0)) return inner;
      }
    }
  }

  return new Array(12).fill(0);
}

function findArrayOf12(data: unknown): number[] | null {
  if (Array.isArray(data) && data.length === 12) {
    if (data.every((v) => typeof v === "number")) return data as number[];
    if (data.every((v) => v && typeof v === "object")) {
      const vals = data.map((it) => {
        const o = it as Record<string, unknown>;
        return readNumeric(o, [
          "total", "ashtakvarga_point", "ashtakvarga_points",
          "points", "bindu", "bindus", "value", "point",
        ]);
      });
      if (vals.some((v) => v > 0)) return vals;
    }
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const v of Object.values(data as Record<string, unknown>)) {
      const found = findArrayOf12(v);
      if (found) return found;
    }
  }
  return null;
}

function readNumeric(obj: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    if (k in obj) {
      const v = obj[k];
      if (typeof v === "number" && !isNaN(v)) return v;
      if (typeof v === "string") {
        const n = Number(v);
        if (!isNaN(n)) return n;
      }
    }
  }
  return 0;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
