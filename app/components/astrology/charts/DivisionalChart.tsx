"use client";

import ChartSVG, { looksLikeSvg, looksLikeImageUrl } from "../ChartSVG";

interface Props {
  /** Either `{ svgUrl }` (Azure Blob), `{ svg: "<svg>" }` (legacy inline), or a raw SVG string. */
  data: unknown;
}

/**
 * Renders one divisional chart. Backend now persists charts to Azure Blob and
 * returns `{ svgUrl, blobName }`; legacy cache entries may still arrive as
 * `{ svg: "<svg>..." }` until they expire.
 */
export default function DivisionalChart({ data }: Props) {
  const svgUrl = extractSvgUrl(data);
  const svg = svgUrl ? null : extractSvg(data);
  if (!svgUrl && !svg) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5C99F] bg-[#FFFDF5] p-6 text-center text-xs text-[#8A6A2A]">
        Chart not available.
      </div>
    );
  }
  return <ChartSVG svgUrl={svgUrl ?? undefined} svg={svg ?? undefined} />;
}

function extractSvgUrl(data: unknown): string | null {
  if (typeof data === "string" && looksLikeImageUrl(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["svgUrl", "svg_url", "url", "imageUrl"]) {
      const v = obj[key];
      if (typeof v === "string" && /^https?:\/\//i.test(v)) return v;
    }
  }
  return null;
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
