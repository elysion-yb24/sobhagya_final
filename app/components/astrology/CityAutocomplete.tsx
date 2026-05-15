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
}

export default function CityAutocomplete({ value, onSelect }: Props) {
  const [query, setQuery] = useState(value ?? "");
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(query.trim());
        setHits(results);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  function pick(h: GeocodeHit) {
    const label = [h.name, h.admin1, h.country].filter(Boolean).join(", ");
    setQuery(label);
    setOpen(false);
    onSelect({ label, lat: h.lat, lon: h.lon, timezone: h.timezone });
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-[#E5C99F] bg-white px-3 py-2 focus-within:border-[#F7941D] focus-within:ring-2 focus-within:ring-[#F7941D]/20">
        <Search size={14} className="text-[#B98A3C]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          placeholder="City, country (e.g. Mumbai, India)"
          className="flex-1 bg-transparent text-sm text-[#333] placeholder-[#A78A5A] focus:outline-none"
        />
        {loading && <span className="text-[10px] text-[#A78A5A]">…</span>}
      </div>
      {open && hits.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#E5C99F] bg-white shadow-xl">
          {hits.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(h)}
              className="block w-full px-3 py-2 text-left text-sm text-[#333] hover:bg-[#FFF6E8]"
            >
              <div className="font-medium">
                {h.name}
                {h.admin1 ? <span className="text-[#8A6A2A]">, {h.admin1}</span> : null}
                <span className="text-[#8A6A2A]">, {h.country}</span>
              </div>
              <div className="text-[10px] text-[#A78A5A]">
                {h.lat.toFixed(4)}°, {h.lon.toFixed(4)}° · {h.timezone}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
