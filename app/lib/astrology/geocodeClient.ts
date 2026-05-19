import { backendUrl } from "./backendUrl";
import { getAuthToken } from "../../utils/auth-utils";

export interface GeocodeHit {
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
  timezone: string;
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

interface BdcReverse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

/**
 * Reverse-geocode a (lat, lon) into a city/region label.
 *
 * Strategy: call BigDataCloud's open client API for the human-readable label
 * (no key required, CORS-enabled). Then look up that label through our own
 * /api/geocode forward search so we get a structured GeocodeHit that includes
 * a valid IANA timezone — Open-Meteo's records are what the rest of the form
 * already trusts.
 */
export async function reverseSearch(lat: number, lon: number): Promise<GeocodeHit | null> {
  let label = "";
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (r.ok) {
      const j = (await r.json()) as BdcReverse;
      label = j.city || j.locality || j.principalSubdivision || "";
    }
  } catch {
    /* fall through to coordinate-only return */
  }

  if (label) {
    const matches = await searchPlaces(label);
    // Pick the closest match by haversine; the first result is usually fine but
    // not always (city names repeat across countries).
    let best: GeocodeHit | null = null;
    let bestDist = Infinity;
    for (const m of matches) {
      const d = haversine(lat, lon, m.lat, m.lon);
      if (d < bestDist) { bestDist = d; best = m; }
    }
    if (best) return best;
  }

  // Fall back to a synthetic hit so the caller still gets coords/timezone.
  return {
    name: label || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
    country: "",
    lat,
    lon,
    timezone: typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC",
  };
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
