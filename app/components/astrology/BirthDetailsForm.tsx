"use client";

import { useEffect, useState } from "react";
import type { BirthDetails } from "../../lib/astrology/types";
import { type SelectedPlace } from "./CityAutocomplete";
import LocationInput from "./LocationInput";
import AstroDatePicker from "./AstroDatePicker";
import AstroTimePicker from "./AstroTimePicker";
import { getTimezone, searchPlaces } from "../../lib/astrology/geocodeClient";

const STORAGE_KEY = "astro:birth";

interface Props {
  value?: Partial<BirthDetails>;
  onSubmit: (details: BirthDetails) => void;
  submitLabel?: string;
  persist?: boolean;
  idPrefix?: string;
}

export function loadStoredBirth(): BirthDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as BirthDetails : null;
  } catch { return null; }
}

function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

// Deterministic defaults so the first render matches between server and client.
// Anything time-or-storage-derived must be applied AFTER mount via useEffect.
const DEFAULTS = {
  name: "",
  gender: "male" as const,
  day: 1,
  month: 1,
  year: 2000,
  hour: 12,
  min: 0,
  place: "",
  lat: 19.076,
  lon: 72.877,
  tzone: 5.5,
};

export default function BirthDetailsForm({
  value, onSubmit, submitLabel = "Generate", persist = true, idPrefix = "b",
}: Props) {
  const init = (value ?? {}) as Partial<BirthDetails>;
  const [name, setName] = useState(init.name ?? DEFAULTS.name);
  const [gender, setGender] = useState<"male" | "female" | "other">(init.gender ?? DEFAULTS.gender);
  const [day, setDay] = useState<number>(init.day ?? DEFAULTS.day);
  const [month, setMonth] = useState<number>(init.month ?? DEFAULTS.month);
  const [year, setYear] = useState<number>(init.year ?? DEFAULTS.year);
  const [hour, setHour] = useState<number>(init.hour ?? DEFAULTS.hour);
  const [minute, setMinute] = useState<number>(init.min ?? DEFAULTS.min);
  const [place, setPlace] = useState(init.place ?? DEFAULTS.place);
  const [lat, setLat] = useState<number>(init.lat ?? DEFAULTS.lat);
  const [lon, setLon] = useState<number>(init.lon ?? DEFAULTS.lon);
  const [tzone, setTzone] = useState<number>(init.tzone ?? DEFAULTS.tzone);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [locationTouched, setLocationTouched] = useState<boolean>(
    !!(init.place || (init.lat && init.lon)),
  );
  // Tracks the displayed autocomplete text. When it diverges from `place`
  // (the last successfully-resolved label), the location is "stale" — the
  // user has typed but not picked a suggestion, so lat/lon are wrong.
  const [placeQuery, setPlaceQuery] = useState<string>(init.place ?? DEFAULTS.place);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage (or "today" defaults) after mount so SSR markup
  // matches the client's first paint. We skip this when the parent supplied
  // an explicit `value` prop — that already overrides defaults.
  useEffect(() => {
    if (value) return;
    const stored = persist ? loadStoredBirth() : null;
    if (stored) {
      setName(stored.name ?? "");
      setGender(stored.gender ?? "male");
      setDay(stored.day);
      setMonth(stored.month);
      setYear(stored.year);
      setHour(stored.hour);
      setMinute(stored.min);
      if (stored.place) {
        setPlace(stored.place);
        setPlaceQuery(stored.place);
      }
      setLat(stored.lat);
      setLon(stored.lon);
      setTzone(stored.tzone);
      setLocationTouched(true);
      return;
    }
    // No stored data — seed sensible "25 years ago today" defaults.
    const now = new Date();
    setDay(now.getDate());
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear() - 25);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPlace(p: SelectedPlace) {
    setPlace(p.label);
    setPlaceQuery(p.label);
    setLat(p.lat);
    setLon(p.lon);
    setLocationTouched(true);
    setError(null);
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    try {
      const tz = await getTimezone(p.timezone, date);
      if (tz !== null) setTzone(tz);
    } catch { /* keep prior */ }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (year < 1900 || year > 2100) { setError("Year out of range (1900-2100)"); return; }
    if (month < 1 || month > 12) { setError("Invalid month"); return; }
    // Calendar can't produce an invalid (month, day) combo but manual paste can.
    if (day < 1 || day > daysInMonth(year, month)) {
      setError(`Day must be 1-${daysInMonth(year, month)} for the selected month`);
      return;
    }
    if (hour < 0 || hour > 23) { setError("Invalid hour"); return; }
    if (minute < 0 || minute > 59) { setError("Invalid minute"); return; }
    if (!Number.isFinite(tzone) || Math.abs(tzone) > 14) { setError("Timezone out of range"); return; }
    let finalLat = lat;
    let finalLon = lon;
    let finalTzone = tzone;
    let finalPlace = (placeQuery || place || "").trim();

    if (mode === "auto") {
      if (!finalPlace) {
        setError("Please enter a place of birth (or switch to manual coordinates).");
        return;
      }

      // Whenever the typed text doesn't exactly match the last successfully
      // picked place, resolve it again. We never trust raw typed text — the
      // first geocode hit becomes the canonical place. If geocoding returns
      // no hits, the input is treated as invalid.
      if (finalPlace !== (place ?? "").trim()) {
        let hits;
        try {
          hits = await searchPlaces(finalPlace);
        } catch {
          setError("Couldn't verify location — please try again.");
          return;
        }
        if (!hits || hits.length === 0) {
          setError("Incorrect location input — please enter a valid place of birth.");
          return;
        }
        const h = hits[0];
        finalLat = h.lat;
        finalLon = h.lon;
        finalPlace = h.displayName || [h.name, h.admin1, h.country].filter(Boolean).join(", ");
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        try {
          const tz = await getTimezone(h.timezone, date);
          if (tz !== null) finalTzone = tz;
        } catch { /* keep prior tzone */ }
        // Persist the canonical resolution into form state so the displayed
        // summary and any subsequent submit see the verified place.
        setPlace(finalPlace);
        setPlaceQuery(finalPlace);
        setLat(finalLat);
        setLon(finalLon);
        setTzone(finalTzone);
      }
    }

    if (!Number.isFinite(finalLat) || Math.abs(finalLat) > 90) { setError("Latitude out of range"); return; }
    if (!Number.isFinite(finalLon) || Math.abs(finalLon) > 180) { setError("Longitude out of range"); return; }

    const details: BirthDetails = {
      name: name || undefined,
      gender,
      day, month, year, hour, min: minute,
      lat: finalLat, lon: finalLon, tzone: finalTzone,
      place: finalPlace || undefined,
    };
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(details)); } catch { /* ignore */ }
    }
    onSubmit(details);
  }

  const labelClass = "text-[11px] uppercase tracking-wider text-[#8A6A2A] font-medium mb-1 block";
  const input = "w-full rounded-lg border border-[#E5C99F] bg-white px-3 py-2 text-sm text-[#333] placeholder-[#A78A5A] focus:border-[#F7941D] focus:ring-2 focus:ring-[#F7941D]/20 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-4" autoComplete="off" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelClass}>Name (optional)</label>
          <input
            id={`${idPrefix}-name`}
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rohit"
            autoComplete="name"
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-gender`} className={labelClass}>Gender</label>
          <select
            id={`${idPrefix}-gender`}
            className={input}
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date of birth</label>
          <AstroDatePicker
            value={{ day, month, year }}
            onChange={(d) => { setDay(d.day); setMonth(d.month); setYear(d.year); }}
            idPrefix={`${idPrefix}-date`}
            maxYear={new Date().getFullYear()}
          />
        </div>
        <div>
          <label className={labelClass}>Time of birth</label>
          <AstroTimePicker
            hour={hour}
            minute={minute}
            onChange={({ hour: h, minute: m }) => { setHour(h); setMinute(m); }}
            idPrefix={`${idPrefix}-time`}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={labelClass.replace("mb-1 ", "")}>Place of birth</span>
          <button
            type="button"
            onClick={() => setMode(mode === "auto" ? "manual" : "auto")}
            className="text-[10px] text-[#F7941D] hover:underline focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 rounded"
          >
            {mode === "auto" ? "Enter coordinates manually" : "Search by city"}
          </button>
        </div>
        {mode === "auto" ? (
          <LocationInput
            value={place}
            onSelect={onPlace}
            onTextChange={(t) => {
              setPlaceQuery(t);
              if (error) setError(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-[#8A6A2A] mb-1 block">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className={input}
                value={lat}
                onChange={(e) => { setLat(Number(e.target.value)); setLocationTouched(true); }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8A6A2A] mb-1 block">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className={input}
                value={lon}
                onChange={(e) => { setLon(Number(e.target.value)); setLocationTouched(true); }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8A6A2A] mb-1 block">Tz (hrs)</label>
              <input
                type="number"
                step="0.25"
                className={input}
                value={tzone}
                onChange={(e) => setTzone(Number(e.target.value))}
              />
            </div>
          </div>
        )}
        {mode === "auto" && (place || (lat && lon)) && (
          <p className="mt-1 text-[10px] text-[#8A6A2A]">
            {place ? `${place} · ` : ""}{lat.toFixed(3)}°, {lon.toFixed(3)}° · UTC{tzone >= 0 ? "+" : ""}{tzone}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-[#F7941D] to-[#E08015] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-[#E08015] hover:to-[#C66C0D] focus:outline-none focus:ring-2 focus:ring-[#F7941D]/40 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}
