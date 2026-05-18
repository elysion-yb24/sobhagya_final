"use client";

import { useState } from "react";
import type { BirthDetails } from "../../lib/astrology/types";
import { type SelectedPlace } from "./CityAutocomplete";
import LocationInput from "./LocationInput";
import AstroDatePicker from "./AstroDatePicker";
import AstroTimePicker from "./AstroTimePicker";
import { getTimezone } from "../../lib/astrology/geocodeClient";

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

export default function BirthDetailsForm({
  value, onSubmit, submitLabel = "Generate", persist = true, idPrefix = "b",
}: Props) {
  const stored = persist ? loadStoredBirth() : null;
  const init = { ...(stored ?? {}), ...(value ?? {}) } as Partial<BirthDetails>;
  const now = new Date();
  const [name, setName] = useState(init.name ?? "");
  const [gender, setGender] = useState<"male" | "female" | "other">(init.gender ?? "male");
  const [day, setDay] = useState<number>(init.day ?? now.getDate());
  const [month, setMonth] = useState<number>(init.month ?? now.getMonth() + 1);
  const [year, setYear] = useState<number>(init.year ?? now.getFullYear() - 25);
  const [hour, setHour] = useState<number>(init.hour ?? 12);
  const [minute, setMinute] = useState<number>(init.min ?? 0);
  const [place, setPlace] = useState(init.place ?? "");
  const [lat, setLat] = useState<number>(init.lat ?? 19.076);
  const [lon, setLon] = useState<number>(init.lon ?? 72.877);
  const [tzone, setTzone] = useState<number>(init.tzone ?? 5.5);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [locationTouched, setLocationTouched] = useState<boolean>(
    !!(init.place || (init.lat && init.lon)),
  );
  const [error, setError] = useState<string | null>(null);

  async function onPlace(p: SelectedPlace) {
    setPlace(p.label);
    setLat(p.lat);
    setLon(p.lon);
    setLocationTouched(true);
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    try {
      const tz = await getTimezone(p.timezone, date);
      if (tz !== null) setTzone(tz);
    } catch { /* keep prior */ }
  }

  function submit(e: React.FormEvent) {
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
    if (!Number.isFinite(lat) || Math.abs(lat) > 90) { setError("Latitude out of range"); return; }
    if (!Number.isFinite(lon) || Math.abs(lon) > 180) { setError("Longitude out of range"); return; }
    if (!Number.isFinite(tzone) || Math.abs(tzone) > 14) { setError("Timezone out of range"); return; }
    if (mode === "auto" && !locationTouched) {
      setError("Please pick a place of birth (or switch to manual coordinates).");
      return;
    }

    const details: BirthDetails = {
      name: name || undefined,
      gender,
      day, month, year, hour, min: minute,
      lat, lon, tzone, place: place || undefined,
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
          <LocationInput value={place} onSelect={onPlace} />
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
