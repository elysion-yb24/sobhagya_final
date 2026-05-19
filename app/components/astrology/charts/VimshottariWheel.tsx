"use client";

import { useMemo } from "react";

// Canonical Vimshottari order + year shares (sum = 120).
// Wheel always renders in this order; API data only decides which sector is
// the *current* mahadasha (highlighted).
const SEQUENCE: { name: string; years: number; glyph: string; color: string }[] = [
  { name: "Ketu",    years: 7,  glyph: "☋", color: "#A0522D" },
  { name: "Venus",   years: 20, glyph: "♀", color: "#FF69B4" },
  { name: "Sun",     years: 6,  glyph: "☉", color: "#F5A623" },
  { name: "Moon",    years: 10, glyph: "☽", color: "#87CEEB" },
  { name: "Mars",    years: 7,  glyph: "♂", color: "#D14040" },
  { name: "Rahu",    years: 18, glyph: "☊", color: "#6B4E8A" },
  { name: "Jupiter", years: 16, glyph: "♃", color: "#FFD700" },
  { name: "Saturn",  years: 19, glyph: "♄", color: "#4A4A6A" },
  { name: "Mercury", years: 17, glyph: "☿", color: "#2E8B57" },
];

const TOTAL_YEARS = SEQUENCE.reduce((s, p) => s + p.years, 0); // 120

interface Props {
  /** Raw `major_vdasha` response. Shape varies; we extract a list of {name, start, end}. */
  data: unknown;
}

interface Period {
  name: string;
  start?: Date;
  end?: Date;
}

export default function VimshottariWheel({ data }: Props) {
  const { periods, currentLord } = useMemo(() => extractPeriods(data), [data]);

  const cx = 210, cy = 210;
  const rOuter = 195, rInner = 95;
  const labelRadius = (rOuter + rInner) / 2;

  // Build sectors. Start from 12 o'clock and go clockwise.
  let cumulative = 0;
  const sectors = SEQUENCE.map((planet) => {
    const a0 = (cumulative / TOTAL_YEARS) * 2 * Math.PI - Math.PI / 2;
    cumulative += planet.years;
    const a1 = (cumulative / TOTAL_YEARS) * 2 * Math.PI - Math.PI / 2;
    return {
      ...planet,
      a0,
      a1,
      midAngle: (a0 + a1) / 2,
      isCurrent: currentLord
        ? currentLord.toLowerCase() === planet.name.toLowerCase()
        : false,
    };
  });

  const lookup: Record<string, Period> = {};
  for (const p of periods) lookup[p.name.toLowerCase()] = p;

  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 420 420" className="w-full h-auto" role="img" aria-label="Vimshottari Dasha wheel">
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
                  fontSize="20"
                  y={-10}
                  style={{ paintOrder: "stroke", stroke: "#00000044", strokeWidth: 2 }}
                >
                  {s.glyph}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="11"
                  fontWeight={700}
                  y={10}
                  style={{ paintOrder: "stroke", stroke: "#00000044", strokeWidth: 2 }}
                >
                  {s.name}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="10"
                  y={24}
                  opacity={0.95}
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
            VIMSHOTTARI
          </text>
          <text x={cx} y={cy} textAnchor="middle" fill="#2a1304" fontSize="26" fontWeight={800}>
            {TOTAL_YEARS}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="#8A6A2A" fontSize="9">
            year cycle
          </text>
          {currentLord && (
            <text x={cx} y={cy + 38} textAnchor="middle" fill="#F7941D" fontSize="11" fontWeight={700}>
              {capitalize(currentLord)} Mahādashā
            </text>
          )}
        </svg>
      </div>

      {/* Period list — supplementary table beneath the wheel */}
      {periods.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#F0DAB2]">
          <table className="min-w-full text-xs">
            <thead className="bg-[#FFF6E8]">
              <tr>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Mahadasha</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Start</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">End</th>
                <th className="px-3 py-1.5 text-left font-semibold text-[#6b4a1f]">Years</th>
              </tr>
            </thead>
            <tbody>
              {SEQUENCE.map((planet) => {
                const p = lookup[planet.name.toLowerCase()];
                const isCurrent = currentLord
                  ? currentLord.toLowerCase() === planet.name.toLowerCase()
                  : false;
                return (
                  <tr key={planet.name} className={isCurrent ? "bg-[#FFE9C7]" : "odd:bg-[#FFFDF5]"}>
                    <td className="px-3 py-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full align-middle mr-1.5"
                        style={{ background: planet.color }}
                      />
                      <span className="font-semibold text-[#2a1304]">{planet.name}</span>
                    </td>
                    <td className="px-3 py-1.5 text-[#6b4a1f] tabular-nums">{fmtDate(p?.start)}</td>
                    <td className="px-3 py-1.5 text-[#6b4a1f] tabular-nums">{fmtDate(p?.end)}</td>
                    <td className="px-3 py-1.5 text-[#6b4a1f] tabular-nums">{planet.years}</td>
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

/**
 * AstrologyAPI's dasha endpoints vary across versions. Try several common
 * shapes and fall back gracefully so the wheel always renders.
 */
function extractPeriods(data: unknown): { periods: Period[]; currentLord?: string } {
  if (!data) return { periods: [] };

  // Shape A: `[{ planet|name, start_time|start, end_time|end }, ...]`
  if (Array.isArray(data)) {
    const rows = data.map(rowToPeriod).filter(Boolean) as Period[];
    return { periods: rows, currentLord: detectCurrent(rows) };
  }

  // Shape B: `{ vdasha: [...] }` or similar wrapper
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["vdasha", "vimshottari", "major_vdasha", "periods", "data", "list"]) {
      const v = obj[key];
      if (Array.isArray(v)) {
        const rows = v.map(rowToPeriod).filter(Boolean) as Period[];
        return { periods: rows, currentLord: detectCurrent(rows) };
      }
    }
    // Shape C: single current period { planet, start, end }
    const single = rowToPeriod(obj);
    if (single) return { periods: [single], currentLord: single.name };
  }
  return { periods: [] };
}

function rowToPeriod(row: unknown): Period | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const name = pickString(r, ["planet", "name", "lord", "mahadasha"]);
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
      return p.name;
    }
  }
  return undefined;
}

function parseLooseDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  // Try ISO first (yyyy-mm-dd ...)
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  // Try DD-MM-YYYY or DD/MM/YYYY (with optional time)
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
