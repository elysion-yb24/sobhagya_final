"use client";

import { useMemo } from "react";
import {
  Heart, Sparkles, ShieldAlert, ShieldCheck,
  Mars, Venus, BookHeart, AlertTriangle, CheckCircle2,
} from "lucide-react";
import type { GunMilanResponse } from "../../lib/astrology/featureApi";

interface Props {
  response: GunMilanResponse;
}

/**
 * Hand-styled Gun Milan report. The upstream `match_ashtakoot_points`,
 * `match_manglik_report`, `match_obstructions` and `match_compatibility_report`
 * shapes differ slightly across versions, so each extractor is defensive —
 * it walks the object and falls back to a "data not available" state rather
 * than crashing the UI.
 */
export default function GunMilanReport({ response }: Props) {
  const { ashtakoot, manglik, obstructions, report } = response.result;

  const ashta = useMemo(() => extractAshtakoot(ashtakoot), [ashtakoot]);
  const mang = useMemo(() => extractManglik(manglik), [manglik]);
  const obst = useMemo(() => extractObstructions(obstructions), [obstructions]);
  const rep = useMemo(() => extractReport(report), [report]);

  return (
    <div className="space-y-6">
      <HeroScore received={ashta.totalReceived} total={ashta.totalMax} />
      {ashta.categories.length > 0 && <AshtakootGrid categories={ashta.categories} />}
      {(mang.male || mang.female || mang.conclusion) && <ManglikCompare data={mang} />}
      {obst.items.length > 0 && <ObstructionsPanel items={obst.items} score={obst.score} />}
      {rep && <ReportCard text={rep} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Hero score — big circular progress + verdict                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

function verdictFor(score: number, max: number): { label: string; color: string; accent: string; ring: string } {
  if (max <= 0) return { label: "—", color: "text-[#6b4a1f]", accent: "from-[#FFF6E8] to-[#FFE9C7]", ring: "#E5C99F" };
  const pct = (score / max) * 100;
  if (pct >= 75) return { label: "Excellent Match", color: "text-emerald-700", accent: "from-emerald-50 to-emerald-100", ring: "#10b981" };
  if (pct >= 55) return { label: "Good Match",      color: "text-[#C66C0D]",   accent: "from-[#FFF6E8] to-[#FFE9C7]", ring: "#F7941D" };
  if (pct >= 35) return { label: "Acceptable",      color: "text-amber-700",   accent: "from-amber-50 to-amber-100",  ring: "#f59e0b" };
  return                  { label: "Low Score",      color: "text-red-700",     accent: "from-red-50 to-red-100",       ring: "#ef4444" };
}

function HeroScore({ received, total }: { received: number; total: number }) {
  const max = total > 0 ? total : 36;
  const v = verdictFor(received, max);
  const pct = max > 0 ? Math.min(100, (received / max) * 100) : 0;
  const radius = 64;
  const C = 2 * Math.PI * radius;
  const dash = (pct / 100) * C;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#E5C99F] bg-gradient-to-br ${v.accent} p-6 shadow-sm`}
    >
      <div className="absolute right-4 top-4 opacity-20">
        <Sparkles size={64} className="text-[#F7941D]" />
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative h-40 w-40 shrink-0">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle cx="80" cy="80" r={radius} stroke="#FFFFFF" strokeWidth="14" fill="none" />
              <circle
                cx="80" cy="80" r={radius}
                stroke={v.ring}
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${dash} ${C - dash}`}
                style={{ transition: "stroke-dasharray 600ms ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-[#2a1304]">{received}</span>
              <span className="text-xs font-medium text-[#8A6A2A]">of {max}</span>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#C66C0D] backdrop-blur">
              <Heart size={12} /> Guna Milan
            </div>
            <h2 className={`mt-2 text-2xl font-bold ${v.color}`}>{v.label}</h2>
            <p className="mt-1 max-w-md text-sm text-[#5a3d1a]">
              Based on the 8-fold Ashtakoot system — higher scores indicate stronger natural harmony.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Ashtakoot category cards                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

interface AshtaCategory {
  key: string;
  label: string;
  received: number;
  total: number;
  maleAttr?: string;
  femaleAttr?: string;
  description?: string;
}

function AshtakootGrid({ categories }: { categories: AshtaCategory[] }) {
  return (
    <section>
      <SectionHeading icon={<Sparkles size={14} />} title="Ashtakoot — 8 Compatibility Factors" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <AshtaCard key={c.key} cat={c} />
        ))}
      </div>
    </section>
  );
}

function AshtaCard({ cat }: { cat: AshtaCategory }) {
  const pct = cat.total > 0 ? (cat.received / cat.total) * 100 : 0;
  const barColor = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-[#F7941D]" : pct > 0 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-[#2a1304]">{cat.label}</h4>
        <div className="text-right">
          <div className="text-lg font-bold leading-none text-[#2a1304]">
            <span className="text-[#F7941D]">{cat.received}</span>
            <span className="text-xs text-[#8A6A2A]"> / {cat.total}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#FFF1DA]">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {(cat.maleAttr || cat.femaleAttr) && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-md bg-[#F4F8FF] px-2 py-1.5">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#5b7bbf]">
              <Mars size={10} /> Male
            </div>
            <div className="font-semibold text-[#2a1304] break-words">{cat.maleAttr || "—"}</div>
          </div>
          <div className="rounded-md bg-[#FFF1F5] px-2 py-1.5">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#c4477b]">
              <Venus size={10} /> Female
            </div>
            <div className="font-semibold text-[#2a1304] break-words">{cat.femaleAttr || "—"}</div>
          </div>
        </div>
      )}
      {cat.description && (
        <p className="mt-3 line-clamp-3 text-[11px] leading-snug text-[#6b4a1f]" title={cat.description}>
          {cat.description}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Manglik comparison                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

interface ManglikSide { present?: boolean; status?: string; report?: string }
interface ManglikData { male: ManglikSide | null; female: ManglikSide | null; conclusion?: string }

function ManglikCompare({ data }: { data: ManglikData }) {
  return (
    <section>
      <SectionHeading icon={<ShieldAlert size={14} />} title="Manglik Comparison" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ManglikCard side="male" data={data.male} />
        <ManglikCard side="female" data={data.female} />
      </div>
      {data.conclusion && (
        <div className="mt-3 rounded-xl border border-[#E5C99F] bg-white p-4 text-sm text-[#3a2510]">
          <span className="font-semibold text-[#C66C0D]">Conclusion: </span>
          {data.conclusion}
        </div>
      )}
    </section>
  );
}

function ManglikCard({ side, data }: { side: "male" | "female"; data: ManglikSide | null }) {
  const isMale = side === "male";
  const Icon = isMale ? Mars : Venus;
  const accentBg = isMale ? "bg-[#F4F8FF]" : "bg-[#FFF1F5]";
  const accentText = isMale ? "text-[#5b7bbf]" : "text-[#c4477b]";

  const present = data?.present ?? null;
  const verdict = present === null ? "Unknown" : present ? "Manglik" : "Non-Manglik";
  const verdictColor = present === null ? "text-[#8A6A2A]" : present ? "text-amber-700" : "text-emerald-700";
  const VerdictIcon = present === null ? AlertTriangle : present ? ShieldAlert : ShieldCheck;

  return (
    <div className="rounded-xl border border-[#E5C99F] bg-white p-4 shadow-sm">
      <div className={`mb-3 flex items-center gap-2 rounded-lg ${accentBg} px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${accentText}`}>
        <Icon size={14} /> {isMale ? "Male" : "Female"}
      </div>
      <div className={`flex items-center gap-2 text-base font-bold ${verdictColor}`}>
        <VerdictIcon size={18} /> {verdict}
      </div>
      {data?.status && <p className="mt-1 text-xs text-[#6b4a1f]">{data.status}</p>}
      {data?.report && <p className="mt-2 text-xs leading-relaxed text-[#3a2510]">{data.report}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Obstructions / Doshas                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

interface Obstruction {
  key: string;
  label: string;
  present: boolean;
  description?: string;
  cancellation?: string;
}

function ObstructionsPanel({ items, score }: { items: Obstruction[]; score?: number | null }) {
  const present = items.filter((o) => o.present);
  return (
    <section>
      <SectionHeading icon={<AlertTriangle size={14} />} title="Doshas & Obstructions" />
      {present.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 size={20} />
          <div>
            <div className="text-sm font-semibold">No major obstructions detected.</div>
            <p className="text-xs text-emerald-700">The pairing is free of the typical compatibility doshas checked here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {present.map((o) => (
            <div key={o.key} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                  <AlertTriangle size={16} /> {o.label} Dosha
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                  Present
                </span>
              </div>
              {o.description && <p className="mt-2 text-xs leading-relaxed text-amber-900">{o.description}</p>}
              {o.cancellation && (
                <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                  <span className="font-semibold">Cancellation: </span>{o.cancellation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {typeof score === "number" && (
        <p className="mt-2 text-right text-[11px] text-[#8A6A2A]">Obstruction score: {score}</p>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Narrative report                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function ReportCard({ text }: { text: string }) {
  return (
    <section>
      <SectionHeading icon={<BookHeart size={14} />} title="Detailed Compatibility Report" />
      <div className="rounded-xl border border-[#E5C99F] bg-gradient-to-br from-[#FFFDF5] to-[#FFF6E8] p-5 shadow-sm">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#3a2510]">{text}</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Section heading                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F7941D] text-white shadow-sm">
        {icon}
      </span>
      <h3 className="text-base font-bold text-[#2a1304]">{title}</h3>
      <div className="h-px flex-1 bg-gradient-to-r from-[#E5C99F] to-transparent" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Extractors — defensive, walks the upstream shape with sane fallbacks         */
/* ─────────────────────────────────────────────────────────────────────────── */

type Obj = Record<string, unknown>;

function asObj(v: unknown): Obj | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : null;
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function str(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function bool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "yes", "1", "present", "haan", "हाँ"].includes(s)) return true;
    if (["false", "no", "0", "absent", "nahi", "नहीं"].includes(s)) return false;
  }
  if (typeof v === "number") return v !== 0;
  return undefined;
}

/* ── Ashtakoot ────────────────────────────────────────────────────────────── */

const ASHTAKOOT_CATEGORIES: { key: string; label: string; aliases: string[]; defaultTotal: number }[] = [
  { key: "varna",       label: "Varna",        aliases: ["varna"],                                      defaultTotal: 1 },
  { key: "vasya",       label: "Vashya",       aliases: ["vasya", "vashya"],                            defaultTotal: 2 },
  { key: "tara",        label: "Tara",         aliases: ["tara", "dina"],                               defaultTotal: 3 },
  { key: "yoni",        label: "Yoni",         aliases: ["yoni"],                                       defaultTotal: 4 },
  { key: "grahamaitri", label: "Graha Maitri", aliases: ["grahamaitri", "graha_maitri", "rashyadipati"], defaultTotal: 5 },
  { key: "gan",         label: "Gan",          aliases: ["gan", "gana"],                                defaultTotal: 6 },
  { key: "bhakut",      label: "Bhakut",       aliases: ["bhakut", "bhakoot", "rashi"],                 defaultTotal: 7 },
  { key: "nadi",        label: "Nadi",         aliases: ["nadi"],                                       defaultTotal: 8 },
];

function pickByAliases(obj: Obj, aliases: string[]): Obj | null {
  for (const a of aliases) {
    if (a in obj && obj[a] && typeof obj[a] === "object") return obj[a] as Obj;
  }
  return null;
}

function extractAshtakoot(data: unknown): { categories: AshtaCategory[]; totalReceived: number; totalMax: number } {
  const root = asObj(data);
  if (!root) return { categories: [], totalReceived: 0, totalMax: 36 };

  const categories: AshtaCategory[] = [];
  let totalReceived = 0;
  let totalMax = 0;

  for (const def of ASHTAKOOT_CATEGORIES) {
    const node = pickByAliases(root, def.aliases);
    if (!node) continue;
    const received = num(node.received_points ?? node.point_received ?? node.received ?? node.points ?? node.score);
    const total = num(node.total_points ?? node.total ?? node.max_points) || def.defaultTotal;
    const maleAttr = str(node.male_koot_attribute ?? node.boy_koot_attribute ?? node.boy ?? node.male);
    const femaleAttr = str(node.female_koot_attribute ?? node.girl_koot_attribute ?? node.girl ?? node.female);
    const description = str(node.description ?? node.desc);
    categories.push({ key: def.key, label: def.label, received, total, maleAttr, femaleAttr, description });
    totalReceived += received;
    totalMax += total;
  }

  // If upstream provides an explicit total, prefer it.
  const totalNode = asObj(root.total) ?? asObj(root.score_summary);
  const explicitReceived = num(root.score ?? root.received_points ?? (totalNode && totalNode.received_points));
  const explicitMax = num(root.total_points ?? (totalNode && totalNode.total_points));
  if (explicitReceived) totalReceived = explicitReceived;
  if (explicitMax) totalMax = explicitMax;
  if (totalMax === 0) totalMax = 36;

  return { categories, totalReceived, totalMax };
}

/* ── Manglik ──────────────────────────────────────────────────────────────── */

function extractManglikSide(node: Obj | null): ManglikSide | null {
  if (!node) return null;
  const present = bool(node.is_present ?? node.manglik_present ?? node.present);
  const status = str(node.manglik_status ?? node.status);
  const report = str(node.manglik_report ?? node.report ?? node.description);
  if (present === undefined && !status && !report) return null;
  return { present, status, report };
}

function extractManglik(data: unknown): ManglikData {
  const root = asObj(data);
  if (!root) return { male: null, female: null };

  const male = extractManglikSide(asObj(root.male) ?? asObj(root.boy));
  const female = extractManglikSide(asObj(root.female) ?? asObj(root.girl));
  const conclusion = str(
    (asObj(root.conclusion) && (asObj(root.conclusion)!.match_report))
      ?? root.conclusion
      ?? root.match_report
      ?? root.bot_response,
  );
  return { male, female, conclusion };
}

/* ── Obstructions ─────────────────────────────────────────────────────────── */

const OBSTRUCTION_KEYS: { key: string; label: string; aliases: string[] }[] = [
  { key: "nadi",    label: "Nadi",    aliases: ["nadi"] },
  { key: "bhakoot", label: "Bhakoot", aliases: ["bhakoot", "bhakut"] },
  { key: "gan",     label: "Gan",     aliases: ["gan", "gana"] },
];

function extractObstructions(data: unknown): { items: Obstruction[]; score: number | null } {
  const root = asObj(data);
  if (!root) return { items: [], score: null };

  const items: Obstruction[] = [];
  for (const def of OBSTRUCTION_KEYS) {
    const node = pickByAliases(root, def.aliases);
    if (!node) continue;
    items.push({
      key: def.key,
      label: def.label,
      present: bool(node.is_present ?? node.present) ?? false,
      description: str(node.dosha_description ?? node.description),
      cancellation: str(node.dosha_cancellation ?? node.cancellation),
    });
  }
  const score = "score" in root ? num(root.score) : null;
  return { items, score };
}

/* ── Report ───────────────────────────────────────────────────────────────── */

function extractReport(data: unknown): string {
  if (typeof data === "string") return data.trim();
  const root = asObj(data);
  if (!root) return "";
  return str(
    root.bot_response
      ?? root.match_report
      ?? root.report
      ?? root.description
      ?? root.text,
  ) ?? "";
}
