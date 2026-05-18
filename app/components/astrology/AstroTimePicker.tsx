"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";

interface Props {
  /** 24-hour clock value, exactly what BirthDetails stores. */
  hour: number;
  minute: number;
  onChange: (next: { hour: number; minute: number }) => void;
  idPrefix?: string;
}

function to12(h24: number): { h12: number; meridiem: "AM" | "PM" } {
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const raw = h24 % 12;
  return { h12: raw === 0 ? 12 : raw, meridiem };
}

function to24(h12: number, meridiem: "AM" | "PM"): number {
  const normalised = ((h12 % 12) + 12) % 12;
  return meridiem === "AM" ? normalised : normalised + 12;
}

/**
 * 12-hour AM/PM time picker. Birth-details internals stay 24-hour to keep the
 * existing API contracts; only the UI shows AM/PM.
 */
export default function AstroTimePicker({ hour, minute, onChange, idPrefix = "tp" }: Props) {
  const { h12, meridiem } = useMemo(() => to12(hour), [hour]);

  function setH12(next12: number) {
    const clamped = Math.max(1, Math.min(12, next12));
    onChange({ hour: to24(clamped, meridiem), minute });
  }
  function setMin(nextMin: number) {
    const clamped = Math.max(0, Math.min(59, nextMin));
    onChange({ hour, minute: clamped });
  }
  function setMeridiem(next: "AM" | "PM") {
    onChange({ hour: to24(h12, next), minute });
  }

  const inputBase =
    "w-full rounded-md border border-[#E5C99F] bg-white px-2 py-1.5 text-center text-sm tabular-nums text-[#2a1304] focus:border-[#F7941D] focus:ring-2 focus:ring-[#F7941D]/20 focus:outline-none";

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center text-[#B98A3C]">
        <Clock size={14} />
      </span>
      <div className="flex flex-1 items-center gap-1">
        <input
          id={`${idPrefix}-h`}
          aria-label="Hour"
          type="number"
          inputMode="numeric"
          min={1}
          max={12}
          value={h12}
          onChange={(e) => setH12(Number(e.target.value))}
          className={inputBase + " w-14"}
        />
        <span className="text-[#6b4a1f]">:</span>
        <input
          id={`${idPrefix}-m`}
          aria-label="Minute"
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          step={1}
          value={String(minute).padStart(2, "0")}
          onChange={(e) => setMin(Number(e.target.value))}
          className={inputBase + " w-14"}
        />
      </div>
      <div role="radiogroup" aria-label="AM or PM" className="inline-flex overflow-hidden rounded-md border border-[#E5C99F] text-xs">
        {(["AM", "PM"] as const).map((m) => {
          const active = meridiem === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMeridiem(m)}
              className={
                "px-2.5 py-1 font-semibold transition-colors " +
                (active
                  ? "bg-gradient-to-br from-[#F7941D] to-[#E08015] text-white"
                  : "bg-white text-[#6b4a1f] hover:bg-[#FFF6E8]")
              }
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
