"use client";

import ChartSVG, { looksLikeSvg } from "../ChartSVG";

interface Props {
  /** Raw SVG string returned by `horo_chart_image/<chartId>`, or an object containing one. */
  data: unknown;
}

/**
 * Renders one divisional chart. The AstrologyAPI image endpoints return either
 * a raw `<svg>...` string or a `{ svg: "<svg>..." }` wrapper depending on the
 * call site — accept both.
 */
export default function DivisionalChart({ data }: Props) {
  const svg = extractSvg(data);
  if (!svg) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5C99F] bg-[#FFFDF5] p-6 text-center text-xs text-[#8A6A2A]">
        Chart not available.
      </div>
    );
  }
  return <ChartSVG svg={svg} />;
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
