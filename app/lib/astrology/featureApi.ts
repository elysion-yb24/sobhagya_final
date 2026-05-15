import { backendUrl } from "./backendUrl";
import { getAuthToken } from "../../utils/auth-utils";
import type { BirthDetails, Language, ZodiacSign } from "./types";

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
  requireAuth: boolean,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (requireAuth) {
    const token = getAuthToken();
    if (!token) throw new AuthRequiredError();
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${backendUrl()}${path}`, { ...init, headers });
  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }
  if (!res.ok || !json.success) {
    if (res.status === 401) throw new AuthRequiredError(json.message || "Session expired. Please sign in again.");
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
  return call<KundliResponse>(
    "/api/kundli/generate",
    { method: "POST", body: JSON.stringify(body) },
    true,
  );
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
    true,
  );
}

// feature-service's gun-milan validator does NOT accept `gender` or `tzone`
// fields the way kundli does — match its expected partner shape.
function stripUiFields(b: BirthDetails): Record<string, unknown> {
  const { gender: _gender, ...rest } = b;
  void _gender;
  return rest;
}
