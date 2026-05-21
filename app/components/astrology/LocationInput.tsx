"use client";

import { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import CityAutocomplete, { type SelectedPlace } from "./CityAutocomplete";
import { reverseSearch } from "../../lib/astrology/geocodeClient";

interface Props {
  value?: string;
  onSelect: (place: SelectedPlace) => void;
  onTextChange?: (text: string) => void;
  /** Render the "use my location" button. Defaults to true. */
  geolocation?: boolean;
}

type GeoState = "idle" | "loading" | "denied" | "unsupported" | "error";

/**
 * City autocomplete + browser geolocation button. The button is silent on
 * permission-denied — we just disable it and fall back to manual search.
 */
export default function LocationInput({ value, onSelect, onTextChange, geolocation = true }: Props) {
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [seedValue, setSeedValue] = useState<string | undefined>(value);

  async function detect() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const hit = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
          if (!hit) { setGeoState("error"); return; }
          const label = hit.displayName || [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");
          setSeedValue(label);
          onSelect({ label, lat: hit.lat, lon: hit.lon, timezone: hit.timezone });
          setGeoState("idle");
        } catch {
          setGeoState("error");
        }
      },
      (err) => {
        setGeoState(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }

  const disabled = geoState === "loading" || geoState === "denied" || geoState === "unsupported";

  return (
    <div className="space-y-2">
      <CityAutocomplete value={seedValue} onSelect={onSelect} onTextChange={onTextChange} />
      {geolocation && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={detect}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E5C99F] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6b4a1f] hover:bg-[#FFF6E8] disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              geoState === "denied"
                ? "Location permission denied — search by city instead."
                : geoState === "unsupported"
                ? "Your browser doesn't expose location."
                : "Use my current location"
            }
          >
            {geoState === "loading"
              ? <Loader2 size={12} className="animate-spin" />
              : <LocateFixed size={12} />}
            {geoState === "loading" ? "Detecting…" : "Use my location"}
          </button>
          {geoState === "error" && (
            <span className="text-[10px] text-red-600">Couldn&apos;t detect — search by city.</span>
          )}
          {geoState === "denied" && (
            <span className="text-[10px] text-[#8A6A2A]">Permission blocked — search by city.</span>
          )}
        </div>
      )}
    </div>
  );
}
