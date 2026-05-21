import { backendUrl } from "./backendUrl";
import { getAuthToken } from "../../utils/auth-utils";

export interface GeocodeHit {
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
  timezone: string;
  /** Raw Nominatim display_name (full unmodified address). Preferred for
   *  display so we forward the exact string OpenStreetMap suggested to any
   *  downstream service. Open-Meteo results don't supply this. */
  displayName?: string;
  postcode?: string;
}

interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function searchPlaces(query: string): Promise<GeocodeHit[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(
    `${backendUrl()}/api/geocode?q=${encodeURIComponent(query.trim())}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as Envelope<{ results?: GeocodeHit[] }>;
  return json.data?.results ?? [];
}

export async function getTimezone(
  timezone: string,
  date: string,
): Promise<number | null> {
  const res = await fetch(
    `${backendUrl()}/api/geocode?tz=${encodeURIComponent(timezone)}&date=${encodeURIComponent(date)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as Envelope<{ tzone?: number }>;
  return typeof json.data?.tzone === "number" ? json.data.tzone : null;
}

/**
 * Reverse-geocode a (lat, lon) into a structured place hit via our backend,
 * which proxies Nominatim's /reverse endpoint and derives IANA timezone from
 * the coordinates with tz-lookup. Single round-trip, single provider — keeps
 * the data shape identical to forward search.
 */
export async function reverseSearch(lat: number, lon: number): Promise<GeocodeHit | null> {
  try {
    const res = await fetch(
      `${backendUrl()}/api/geocode?lat=${lat}&lon=${lon}`,
      { headers: authHeaders() },
    );
    if (res.ok) {
      const json = (await res.json()) as Envelope<{ result?: GeocodeHit | null }>;
      if (json.data?.result) return json.data.result;
    }
  } catch {
    /* fall through to synthetic hit */
  }

  // Fall back to a synthetic hit so the caller still gets coords/timezone.
  return {
    name: `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
    country: "",
    lat,
    lon,
    timezone: typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC",
  };
}
