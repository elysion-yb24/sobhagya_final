"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Download, Copy, Check } from "lucide-react";
import ChartSVG, { looksLikeSvg, looksLikeImageUrl } from "./ChartSVG";
import type { ApiResult } from "../../lib/astrology/call";

interface Props {
  result: ApiResult;
  title?: string;
  onClose?: () => void;
}

export default function ResultCard({ result, title, onClose }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyRaw() {
    try {
      const payload = getPayload(result);
      await navigator.clipboard.writeText(
        typeof payload === "string" ? payload : JSON.stringify(payload, null, 2),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-xl border border-[#E5C99F] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#F0DAB2] bg-[#FFF6E8] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-[#2a1304] truncate">{title ?? "Result"}</h3>
          <span className="text-[10px] uppercase tracking-wider text-[#8A6A2A] hidden sm:inline">
            {result.kind}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(result.kind === "json" || result.kind === "text") && (
            <button
              type="button"
              onClick={() => setShowRaw((s) => !s)}
              className="rounded-md border border-[#E5C99F] bg-white px-2 py-1 text-[10px] text-[#6b4a1f] hover:text-[#F7941D] hover:border-[#F7941D]"
            >
              {showRaw ? "Pretty" : "Raw JSON"}
            </button>
          )}
          <button
            type="button"
            onClick={copyRaw}
            className="rounded-md border border-[#E5C99F] bg-white px-2 py-1 text-[10px] text-[#6b4a1f] hover:text-[#F7941D] hover:border-[#F7941D] inline-flex items-center gap-1"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#E5C99F] bg-white px-2 py-1 text-[10px] text-[#6b4a1f] hover:text-red-600 hover:border-red-400"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {result.kind === "svg" ? (
          <ChartSVG svg={result.svg} />
        ) : result.kind === "pdf" ? (
          <PdfPreview base64={result.base64} mime={result.mime} />
        ) : result.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="chart" src={`data:${result.mime};base64,${result.base64}`} className="max-w-full mx-auto rounded-lg bg-white p-2 border border-[#F0DAB2]" />
        ) : result.kind === "text" ? (
          showRaw ? (
            <pre className="whitespace-pre-wrap text-xs text-[#333] font-mono">{result.text}</pre>
          ) : looksLikeSvg(result.text) ? (
            <ChartSVG svg={result.text} />
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-[#333]">{result.text}</pre>
          )
        ) : showRaw ? (
          <pre className="whitespace-pre-wrap text-xs text-[#333] font-mono">{JSON.stringify(result.data, null, 2)}</pre>
        ) : (
          <JsonView data={result.data} />
        )}
      </div>
    </div>
  );
}

function getPayload(r: ApiResult): unknown {
  if (r.kind === "json") return r.data;
  if (r.kind === "text") return r.text;
  if (r.kind === "svg") return r.svg;
  return { kind: r.kind, endpoint: r.endpoint };
}

function PdfPreview({ base64, mime }: { base64: string; mime: string }) {
  const dataUrl = `data:${mime};base64,${base64}`;
  return (
    <div className="space-y-3">
      <a
        href={dataUrl}
        download="astrology-report.pdf"
        className="inline-flex items-center gap-2 rounded-lg bg-[#F7941D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#E08015]"
      >
        <Download size={14} /> Download PDF
      </a>
      <iframe src={dataUrl} className="w-full h-[600px] rounded-lg border border-[#E5C99F]" title="PDF preview" />
    </div>
  );
}

function JsonView({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <p className="text-xs text-[#8A6A2A]">No data.</p>;
  }
  if (looksLikeSvg(data)) {
    return <ChartSVG svg={data as string} />;
  }
  if (looksLikeImageUrl(data)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={data as string} alt="chart" className="max-w-full mx-auto rounded-lg bg-white p-2 border border-[#F0DAB2]" />;
  }
  const unwrappedSvg = extractSvgFromObject(data);
  if (unwrappedSvg) {
    return <ChartSVG svg={unwrappedSvg} />;
  }
  if (typeof data === "string") {
    return <p className="text-sm text-[#333] whitespace-pre-wrap">{data}</p>;
  }
  if (typeof data === "number" || typeof data === "boolean") {
    return <p className="text-sm text-[#333]">{String(data)}</p>;
  }
  if (Array.isArray(data)) {
    return <ArrayView items={data} />;
  }
  if (typeof data === "object") {
    return <ObjectView obj={data as Record<string, unknown>} />;
  }
  return <pre className="text-xs text-[#333] whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}

function ArrayView({ items }: { items: unknown[] }) {
  if (items.length === 0) return <p className="text-xs text-[#8A6A2A]">Empty list.</p>;

  if (items.length === 1 && (looksLikeSvg(items[0]) || looksLikeImageUrl(items[0]))) {
    return <JsonView data={items[0]} />;
  }

  const firstObj = items[0];
  if (firstObj && typeof firstObj === "object" && !Array.isArray(firstObj)) {
    const keys = Array.from(
      new Set(
        items.flatMap((it) =>
          it && typeof it === "object" ? Object.keys(it as object) : [],
        ),
      ),
    );
    return (
      <div className="overflow-x-auto rounded-lg border border-[#F0DAB2]">
        <table className="min-w-full text-xs">
          <thead className="bg-[#FFF6E8]">
            <tr>
              {keys.map((k) => (
                <th key={k} className="border-b border-[#F0DAB2] px-3 py-2 text-left text-[#6b4a1f] font-semibold whitespace-nowrap">
                  {humanise(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="odd:bg-[#FFFDF5] hover:bg-[#FFF6E8]">
                {keys.map((k) => (
                  <td key={k} className="border-t border-[#F0DAB2] px-3 py-1.5 text-[#333] align-top">
                    {renderCell((row as Record<string, unknown>)[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <ul className="space-y-1 text-sm text-[#333] list-disc pl-5">
      {items.map((it, i) => <li key={i}>{renderCell(it)}</li>)}
    </ul>
  );
}

function ObjectView({ obj }: { obj: Record<string, unknown> }) {
  const entries = Object.entries(obj);
  if (entries.length === 0) return <p className="text-xs text-[#8A6A2A]">Empty.</p>;

  const scalars: [string, unknown][] = [];
  const complex: [string, unknown][] = [];
  for (const [k, v] of entries) {
    if (v !== null && typeof v === "object" && !looksLikeSvg(v) && !looksLikeImageUrl(v)) complex.push([k, v]);
    else scalars.push([k, v]);
  }

  return (
    <div className="space-y-3">
      {scalars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {scalars.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
              <div className="text-[11px] uppercase tracking-wider text-[#8A6A2A]">{humanise(k)}</div>
              <div className="text-[#333] break-words">{renderCell(v)}</div>
            </div>
          ))}
        </div>
      )}
      {complex.map(([k, v]) => <Collapsible key={k} label={humanise(k)} value={v} />)}
    </div>
  );
}

function Collapsible({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-[#F0DAB2] bg-[#FFFDF5]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-[#6b4a1f] hover:text-[#2a1304]"
      >
        <span className="inline-flex items-center gap-1">
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {label}
        </span>
        <span className="text-[10px] text-[#A78A5A]">{describeShape(value)}</span>
      </button>
      {open && <div className="border-t border-[#F0DAB2] px-3 py-3"><JsonView data={value} /></div>}
    </div>
  );
}

function renderCell(v: unknown): React.ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-[#C7A26A]">—</span>;
  if (looksLikeSvg(v)) return <ChartSVG svg={v as string} />;
  if (looksLikeImageUrl(v)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={v as string} alt="" className="max-w-xs rounded bg-white p-1 border border-[#F0DAB2]" />;
  }
  if (typeof v === "string" && /^https?:\/\//i.test(v)) {
    return <a href={v} target="_blank" rel="noreferrer" className="text-[#F7941D] hover:underline break-all">{v}</a>;
  }
  if (typeof v === "object") return <JsonView data={v} />;
  if (typeof v === "number") return <span className="font-mono text-[#333]">{formatNumber(v)}</span>;
  return String(v);
}

function extractSvgFromObject(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const obj = data as Record<string, unknown>;
  for (const key of ["svg", "chart_svg", "chart", "image", "svgChart"]) {
    const v = obj[key];
    if (typeof v === "string" && looksLikeSvg(v)) return v;
  }
  return null;
}

function describeShape(v: unknown): string {
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  if (v && typeof v === "object") {
    const n = Object.keys(v as object).length;
    return `${n} field${n === 1 ? "" : "s"}`;
  }
  return "";
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toFixed(abs < 1 ? 4 : 2);
}

function humanise(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
