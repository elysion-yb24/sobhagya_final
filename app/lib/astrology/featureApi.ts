import { backendUrl } from "./backendUrl";
import type { BirthDetails, ChartId, Language, ZodiacSign } from "./types";

type Envelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data?: unknown };

export class AuthRequiredError extends Error {
  constructor(message = "Please sign in to use this feature.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

async function call<T>(
  path: string,
  init: RequestInit,
  _requireAuth: boolean,
): Promise<T> {
  // The Next.js proxy at /api/astrology/[...path] handles auth server-side via
  // apiFetch — it reads the HttpOnly auth cookies and forwards both the Bearer
  // token and the refresh cookie that user-service's authMiddleware expects.
  // The browser doesn't need to attach anything beyond Content-Type, and there
  // are no CORS or cross-origin cookie concerns because the call is same-origin.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };

  const res = await fetch(`${backendUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }
  if (!res.ok || !json.success) {
    if (res.status === 401) {
      // Surface a clear error but DO NOT wipe localStorage or force a redirect.
      // The previous behavior caused a feedback loop: a transient backend 401
      // would clear the session, the next render would 401 again, and the
      // user got bounced to /login indefinitely. Let the caller decide how
      // to react — typically just show the error and let the user retry.
      throw new AuthRequiredError(
        json.message || "Session expired. Please sign in again.",
      );
    }
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json.data;
}

export type HoroscopePeriod =
  | "today" | "tomorrow" | "yesterday" | "weekly" | "monthly" | "yearly";

export interface KundliResult {
  birthDetails: unknown;
  astroDetails: unknown;
  planets: unknown;
  d1Chart: unknown;
  manglikDosha: unknown;
  kalsarpaDosha: unknown;
  pitraDosha: unknown;
  rudraksha: unknown;
  gemstone: unknown;
}

export interface KundliResponse {
  fromCache: boolean;
  cacheKey: string;
  result: KundliResult;
}

export interface HoroscopeResponse {
  fromCache: boolean;
  sign: string;
  period: string;
  dateKey: string;
  data: unknown;
}

export interface GunMilanResult {
  ashtakoot: unknown;
  manglik: unknown;
  obstructions: unknown;
  report: unknown;
}

export interface GunMilanResponse {
  fromCache: boolean;
  cacheKey: string;
  result: GunMilanResult;
}

export function generateKundli(
  body: BirthDetails & { language?: Language },
): Promise<KundliResponse> {
  // Public endpoint — auth is opportunistic so a logged-in user's results can
  // later be linked to their profile, but a guest can generate freely.
  return call<KundliResponse>(
    "/api/kundli/generate",
    { method: "POST", body: JSON.stringify(body) },
    false,
  );
}

export async function generateMobileKundli(
  query: { userName?: string; userGender?: string; userDOB?: string; userTOB?: string; userGeo?: string; language?: Language }
): Promise<KundliResponse> {
  const qs = new URLSearchParams();
  if (query.userName) qs.set("userName", query.userName);
  if (query.userGender) qs.set("userGender", query.userGender);
  if (query.userDOB) qs.set("userDOB", query.userDOB);
  if (query.userTOB) qs.set("userTOB", query.userTOB);
  if (query.userGeo) qs.set("userGeo", query.userGeo);
  if (query.language) qs.set("language", query.language);

  const res = await fetch(`${backendUrl()}/api/kundli/mobile?${qs.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }
  
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }

  return {
    fromCache: !!json.cached,
    cacheKey: json.meta?.cacheKey || "",
    result: json.data as KundliResult,
  };
}

export function getHoroscope(
  sign: ZodiacSign,
  period: HoroscopePeriod,
  language?: Language,
): Promise<HoroscopeResponse> {
  const qs = new URLSearchParams({ sign, period });
  if (language) qs.set("language", language);
  return call<HoroscopeResponse>(
    `/api/horoscope?${qs.toString()}`,
    { method: "GET" },
    false,
  );
}

export function computeGunMilan(
  male: BirthDetails,
  female: BirthDetails,
  language?: Language,
): Promise<GunMilanResponse> {
  return call<GunMilanResponse>(
    "/api/gun-milan/match",
    {
      method: "POST",
      body: JSON.stringify({
        male: stripUiFields(male),
        female: stripUiFields(female),
        ...(language ? { language } : {}),
      }),
    },
    false,
  );
}

// feature-service's gun-milan validator does NOT accept `gender` or `tzone`
// fields the way kundli does — match its expected partner shape.
function stripUiFields(b: BirthDetails): Record<string, unknown> {
  const { gender: _gender, ...rest } = b;
  void _gender;
  return rest;
}

export interface DivisionalChartResponse {
  fromCache: boolean;
  cacheKey: string;
  chartId: ChartId;
  /** Upstream returns `{ svg: "<svg ...>...</svg>" }`. */
  result: { svg?: string } | unknown;
}

/**
 * Lazy fetch for a single divisional chart (D2, D3, ..., chalit, moon, sun).
 * Auth is required — the route is gated by `authMiddleware` on the backend.
 */
export function generateDivisionalChart(
  birth: BirthDetails & { language?: Language },
  chartId: ChartId,
): Promise<DivisionalChartResponse> {
  return call<DivisionalChartResponse>(
    `/api/kundli/chart/${chartId}`,
    { method: "POST", body: JSON.stringify(birth) },
    true,
  );
}

// ── Dasha ──────────────────────────────────────────────────────────────────

export type DashaKind = "vimshottari" | "yogini";

export interface DashaResponse {
  fromCache: boolean;
  cacheKey: string;
  kind: DashaKind;
  result: unknown;
}

export function getVimshottariDasha(
  birth: BirthDetails & { language?: Language },
): Promise<DashaResponse> {
  return call<DashaResponse>(
    "/api/kundli/dasha/vimshottari",
    { method: "POST", body: JSON.stringify(birth) },
    true,
  );
}

export function getYoginiDasha(
  birth: BirthDetails & { language?: Language },
): Promise<DashaResponse> {
  return call<DashaResponse>(
    "/api/kundli/dasha/yogini",
    { method: "POST", body: JSON.stringify(birth) },
    true,
  );
}

// ── Ashtakvarga ────────────────────────────────────────────────────────────

export type AshtakPlanet = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn";

export interface AshtakvargaResponse {
  fromCache: boolean;
  cacheKey: string;
  scope: string;
  result: unknown;
}

export function getSarvashtak(
  birth: BirthDetails & { language?: Language },
): Promise<AshtakvargaResponse> {
  return call<AshtakvargaResponse>(
    "/api/kundli/ashtakvarga/sarva",
    { method: "POST", body: JSON.stringify(birth) },
    true,
  );
}

export function getPlanetAshtak(
  birth: BirthDetails & { language?: Language },
  planet: AshtakPlanet,
): Promise<AshtakvargaResponse> {
  return call<AshtakvargaResponse>(
    `/api/kundli/ashtakvarga/${planet}`,
    { method: "POST", body: JSON.stringify(birth) },
    true,
  );
}

// ── KP (Krishnamurti Paddhati) ─────────────────────────────────────────────

export type KpKind = "planets" | "cusps" | "chart" | "house-sigs" | "planet-sigs";

export interface KpResponse {
  fromCache: boolean;
  cacheKey: string;
  kind: KpKind;
  result: unknown;
}

export function getKp(
  birth: BirthDetails & { language?: Language },
  kind: KpKind,
): Promise<KpResponse> {
  return call<KpResponse>(
    `/api/kundli/kp/${kind}`,
    { method: "POST", body: JSON.stringify(birth) },
    true,
  );
}

