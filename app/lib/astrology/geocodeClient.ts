import { backendUrl } from "./backendUrl";

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

export async function searchPlaces(query: string): Promise<GeocodeHit[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(
    `${backendUrl()}/api/geocode?q=${encodeURIComponent(query.trim())}`,
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
  );
  if (!res.ok) return null;
  const json = (await res.json()) as Envelope<{ tzone?: number }>;
  return typeof json.data?.tzone === "number" ? json.data.tzone : null;
}
