import type { BirthDetails, MatchDetails } from "./types";

export function birthBody(b: BirthDetails): Record<string, unknown> {
  return {
    day: b.day, month: b.month, year: b.year,
    hour: b.hour, min: b.min,
    lat: b.lat, lon: b.lon, tzone: b.tzone,
  };
}

export function matchBody(male: BirthDetails, female: BirthDetails): MatchDetails {
  return {
    m_day: male.day, m_month: male.month, m_year: male.year,
    m_hour: male.hour, m_min: male.min,
    m_lat: male.lat, m_lon: male.lon, m_tzone: male.tzone,
    f_day: female.day, f_month: female.month, f_year: female.year,
    f_hour: female.hour, f_min: female.min,
    f_lat: female.lat, f_lon: female.lon, f_tzone: female.tzone,
  };
}

export function varshaphalBody(birth: BirthDetails, varshaphalYear: number): Record<string, unknown> {
  return { ...birthBody(birth), varshaphal_year: varshaphalYear };
}
