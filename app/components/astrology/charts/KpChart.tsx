"use client";

import ChartSVG, { looksLikeSvg } from "../ChartSVG";

interface Props {
  data: unknown;
}

function extractSvg(data: unknown): string | null {
  if (typeof data === "string" && looksLikeSvg(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["svg", "chart_svg", "chart", "image", "svgChart"]) {
      const v = obj[key];
      if (typeof v === "string" && looksLikeSvg(v)) return v;
    }
  }
  return null;
}

export default function KpChart({ data }: Props) {
  const svg = extractSvg(data);
  if (svg) return <ChartSVG svg={svg} />;

  // Fallback: render tabular JSON if no SVG
  return <KpChartTable data={data} />;
}

function KpChartTable({ data }: { data: unknown }) {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5C99F] bg-[#FFFDF5] p-6 text-center text-xs text-[#8A6A2A]">
        KP Birth Chart data not available.
      </div>
    );
  }
  const keys = Object.keys(rows[0] as Record<string, unknown>).filter(
    (k) => k !== "svg" && k !== "chart_svg"
  );
  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5C99F]">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gradient-to-r from-[#FFF6E8] to-[#FFFDF5]">
            {keys.map((k) => (
              <th key={k} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-[#6b4a1f] capitalize">
                {k.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const r = row as Record<string, unknown>;
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FFFDF5]"}>
                {keys.map((k) => (
                  <td key={k} className="whitespace-nowrap px-3 py-1.5 text-[#2a1304]">
                    {String(r[k] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
