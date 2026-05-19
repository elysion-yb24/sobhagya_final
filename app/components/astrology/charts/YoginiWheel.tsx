"use client";

import { useMemo } from "react";

// Canonical Yogini order + year shares (sum = 36).
// Each Yogini has a presiding planet (its "lord") — used only for the inner
// label and the API match (the response uses either name or lord).
const SEQUENCE: { name: string; lord: string; years: number; color: string }[] = [
  { name: "Mangala",  lord: "Moon",    years: 1, color: "#87CEEB" },
  { name: "Pingala",  lord: "Sun",     years: 2, color: "#F5A623" },
  { name: "Dhanya",   lord: "Jupiter", years: 3, color: "#FFD700" },
  { name: "Bhramari", lord: "Mars",    years: 4, color: "#D14040" },
  { name: "Bhadrika", lord: "Mercury", years: 5, color: "#2E8B57" },
  { name: "Ulka",     lord: "Saturn",  years: 6, color: "#4A4A6A" },
  { name: "Siddha",   lord: "Venus",   years: 7, color: "#FF69B4" },
  { name: "Sankata",  lord: "Rahu",    years: 8, color: "#6B4E8A" },
];

const TOTAL_YEARS = SEQUENCE.reduce((s, p) => s + p.years, 0); // 36

interface Props {
  /** Raw `major_yogini_dasha` response. Shape varies — extracted defensively. */
  data: unknown;
}

interface Period {
  name: string;          // yogini name or planet name from the API row
  start?: Date;
  end?: Date;
}

export default function YoginiWheel({ data }: Props) {
  const { periods, currentKey } = useMemo(() => extractPeriods(data), [data]);

  const cx = 210, cy = 210;
  const rOuter = 195, rInner = 95;
  const labelRadius = (rOuter + rInner) / 2;

  let cumulative = 0;
  const sectors = SEQUENCE.map((y) => {
    const a0 = (cumulative / TOTAL_YEARS) * 2 * Math.PI - Math.PI / 2;
    cumulative += y.years;
    const a1 = (cumulative / TOTAL_YEARS) * 2 * Math.PI - Math.PI / 2;
    return {
      ...y,
      a0,
      a1,
      midAngle: (a0 + a1) / 2,
      isCurrent: currentKey
        ? currentKey === y.name.toLowerCase() || currentKey === y.lord.toLowerCase()
        : false,
    };
  });

  const lookup: Record<string, Period> = {};
  for (const p of periods) lookup[p.name.toLowerCase()] = p;

  const currentSector = sectors.find((s) => s.isCurrent);

  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 420 420" className="w-full h-auto" role="img" aria-label="Yogini Dasha wheel">
          {sectors.map((s) => (
            <path
              key={s.name}
              d={donutSectorPath(cx, cy, rOuter, rInner, s.a0, s.a1)}
              fill={s.color}
              fillOpacity={s.isCurrent ? 1 : 0.7}
              stroke={s.isCurrent ? "#2a1304" : "#FFFDF5"}
              strokeWidth={s.isCurrent ? 3 : 1.5}
            />
          ))}

          {sectors.map((s) => {
            const pos = polar(cx, cy, labelRadius, s.midAngle);
            return (
              <g key={`label-${s.name}`} transform={`translate(${pos.x},${pos.y})`}>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight={700}
                  y={-10}
                  style={{ paintOrder: "stroke", stroke: "#00000044", strokeWidth: 2 }}
                >
                  {s.name}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="10"
                  y={4}
                  opacity={0.95}
                  style={{ paintOrder: "stroke", stroke: "#00000044", strokeWidth: 2 }}
                >
                  {s.lord}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="10"
                  y={18}
                  style={{ paintOrder: "stroke", stroke: "#00000044", strokeWidth: 2 }}
                >
                  {s.years}y
                </text>
              </g>
            );
          })}

          {/* Inner hub */}
          <circle cx={cx} cy={cy} r={rInner - 3} fill="#FFFDF5" stroke="#E5C99F" strokeWidth={1.5} />
          <text x={cx} y={cy - 18} textAnchor="middle" fill="#8A6A2A" fontSize="10" fontWeight={700}>
            YOGINI
          </text>
          <text x={cx} y={cy} textAnchor="middle" fill="#2a1304" fontSize="26" fontWeight={800}>
            {TOTAL_YEARS}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="#8A6A2A" fontSize="9">
            year cycle
          </text>
          {currentSector && (
            <text x={cx} y={cy + 38} textAnchor="middle" fill="#F7941D" fontSize="11" fontWeight={700}>
              {currentSector.name}
            </text>
          )}
        </svg>
      </div>

      {/* Period list table */}
      {periods.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#F0DAB2]">
          <table className="min-w-full text-xs">
            <thead className="bg-[#FFF6E8]">
              <tr>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Yogini</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Lord</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Start</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">End</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Years</th>
              </tr>
            </thead>
            <tbody>
              {SEQUENCE.map((y) => {
                const p =
                  lookup[y.name.toLowerCase()] ?? lookup[y.lord.toLowerCase()];
                const isCurrent = currentKey
                  ? currentKey === y.name.toLowerCase() || currentKey === y.lord.toLowerCase()
                  : false;
                return (
                  <tr key={y.name} className={isCurrent ? "bg-[#FFE9C7]" : "odd:bg-[#FFFDF5]"}>
                    <td className="px-3 py-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full align-middle mr-1.5"
                        style={{ background: y.color }}
                      />
                      <span className="font-semibold text-[#2a1304]">{y.name}</span>
                    </td>
                    <td className="px-3 py-1.5 text-[#6b4a1f]">{y.lord}</td>
                    <td className="px-3 py-1.5 text-[#6b4a1f] tabular-nums">{fmtDate(p?.start)}</td>
                    <td className="px-3 py-1.5 text-[#6b4a1f] tabular-nums">{fmtDate(p?.end)}</td>
                    <td className="px-3 py-1.5 text-[#6b4a1f] tabular-nums">{y.years}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function donutSectorPath(
  cx: number, cy: number,
  rOuter: number, rInner: number,
  a0: number, a1: number,
): string {
  const p0o = polar(cx, cy, rOuter, a0);
  const p1o = polar(cx, cy, rOuter, a1);
  const p0i = polar(cx, cy, rInner, a0);
  const p1i = polar(cx, cy, rInner, a1);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${p0o.x},${p0o.y}`,
    `A ${rOuter},${rOuter} 0 ${largeArc} 1 ${p1o.x},${p1o.y}`,
    `L ${p1i.x},${p1i.y}`,
    `A ${rInner},${rInner} 0 ${largeArc} 0 ${p0i.x},${p0i.y}`,
    "Z",
  ].join(" ");
}

function extractPeriods(data: unknown): { periods: Period[]; currentKey?: string } {
  if (!data) return { periods: [] };

  if (Array.isArray(data)) {
    const rows = data.map(rowToPeriod).filter(Boolean) as Period[];
    return { periods: rows, currentKey: detectCurrent(rows) };
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["yogini_dasha", "yogini", "major_yogini_dasha", "periods", "data", "list"]) {
      const v = obj[key];
      if (Array.isArray(v)) {
        const rows = v.map(rowToPeriod).filter(Boolean) as Period[];
        return { periods: rows, currentKey: detectCurrent(rows) };
      }
    }
    const single = rowToPeriod(obj);
    if (single) return { periods: [single], currentKey: single.name.toLowerCase() };
  }
  return { periods: [] };
}

function rowToPeriod(row: unknown): Period | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  // Yogini responses commonly have BOTH a yogini name and its planet lord.
  // Prefer the yogini-name field, fall back to planet.
  const name = pickString(r, ["yogini_name", "yogini", "name", "planet", "lord"]);
  if (!name) return null;
  return {
    name,
    start: parseLooseDate(pickString(r, ["start_time", "start_date", "start", "from"])),
    end: parseLooseDate(pickString(r, ["end_time", "end_date", "end", "to"])),
  };
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function detectCurrent(periods: Period[]): string | undefined {
  const now = Date.now();
  for (const p of periods) {
    if (p.start && p.end && p.start.getTime() <= now && now <= p.end.getTime()) {
      return p.name.toLowerCase();
    }
  }
  return undefined;
}

function parseLooseDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const y = Number(m[3]);
    const h = m[4] ? Number(m[4]) : 0;
    const mi = m[5] ? Number(m[5]) : 0;
    const se = m[6] ? Number(m[6]) : 0;
    const dt = new Date(y, mo, d, h, mi, se);
    if (!isNaN(dt.getTime())) return dt;
  }
  return undefined;
}

function fmtDate(d: Date | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
