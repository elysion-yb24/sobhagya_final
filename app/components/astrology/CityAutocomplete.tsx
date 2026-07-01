"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchPlaces, type GeocodeHit } from "../../lib/astrology/geocodeClient";

export interface SelectedPlace {
  label: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface Props {
  value?: string;
  onSelect: (place: SelectedPlace) => void;
  /** Fires on every keystroke so the parent can detect free-typed text that
   *  doesn't match a picked suggestion (stale-location guard). */
  onTextChange?: (text: string) => void;
}

export default function CityAutocomplete({ value, onSelect, onTextChange }: Props) {
  const [query, setQuery] = useState(value ?? "");
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // When the query change comes from picking a suggestion (not typing), skip
  // the next search so the dropdown doesn't immediately reopen.
  const skipNextSearch = useRef(false);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (query.trim().length < 2) {
      setHits([]);
      setLookupError(null);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(query.trim());
        setHits(results);
        setLookupError(null);
        setOpen(results.length > 0);
      } catch (err) {
        // searchPlaces throws on a transport/upstream failure (vs an empty
        // result for a genuine "no match"). Show it in the dropdown instead of
        // a silent empty list so the user knows to retry.
        setHits([]);
        setLookupError(
          err instanceof Error ? err.message : "Location lookup failed. Please try again.",
        );
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  function pick(h: GeocodeHit) {
    // Prefer the raw Nominatim display_name so downstream consumers (the
    // backend kundli call, persisted history, third-party astrology APIs we
    // integrate with) receive the exact string OpenStreetMap returned —
    // no lossy "City, State, Country" reformat.
    const label = h.displayName || [h.name, h.admin1, h.country].filter(Boolean).join(", ");
    skipNextSearch.current = true;
    setQuery(label);
    setHits([]);
    setOpen(false);
    onSelect({ label, lat: h.lat, lon: h.lon, timezone: h.timezone });
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-[#E5C99F] bg-white px-3 py-2 focus-within:border-[#F7941D] focus-within:ring-2 focus-within:ring-[#F7941D]/20">
        <Search size={14} className="text-[#B98A3C]" />
        <input
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            onTextChange?.(next);
          }}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder="City, country (e.g. Mumbai, India)"
          className="flex-1 bg-transparent text-sm text-[#333] placeholder-[#A78A5A] focus:outline-none"
        />
        {loading && <span className="text-[10px] text-[#A78A5A]">…</span>}
      </div>
      {open && lookupError && hits.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 shadow-xl" role="alert">
          {lookupError}
        </div>
      )}
      {open && hits.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#E5C99F] bg-white shadow-xl">
          {hits.map((h, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(h)}
              className="block w-full px-3 py-2 text-left text-sm text-[#333] hover:bg-[#FFF6E8]"
            >
              <div className="font-medium text-[#333] break-words">
                {h.displayName || (
                  <>
                    {h.name}
                    {h.admin1 ? <span className="text-[#8A6A2A]">, {h.admin1}</span> : null}
                    <span className="text-[#8A6A2A]">, {h.country}</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-[#A78A5A] mt-0.5">
                {h.lat.toFixed(4)}°, {h.lon.toFixed(4)}° · {h.timezone}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
