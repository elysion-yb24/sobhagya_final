"use client";

import { Clock } from "lucide-react";

interface Props {
  /** 24-hour clock value, exactly what BirthDetails stores. */
  hour: number;
  minute: number;
  onChange: (next: { hour: number; minute: number }) => void;
  idPrefix?: string;
}

function pad2(n: number): string {
  return String(Math.max(0, Math.min(99, n))).padStart(2, "0");
}

/**
 * Single native `<input type="time">` time picker.
 *
 * Why native: on mobile it opens the OS time wheel; on desktop it renders the
 * browser's compact HH:MM stepper. Either way the user gets one focusable
 * control instead of the three-input (hour + minute + AM/PM) design that
 * proved confusing in user testing. Birth-details internals stay 24-hour.
 */
export default function AstroTimePicker({ hour, minute, onChange, idPrefix = "tp" }: Props) {
  const value = `${pad2(hour)}:${pad2(minute)}`;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value; // "HH:MM" or "" if user clears it
    if (!v) {
      onChange({ hour: 0, minute: 0 });
      return;
    }
    const [hStr, mStr] = v.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    onChange({
      hour: Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 0,
      minute: Number.isFinite(m) ? Math.max(0, Math.min(59, m)) : 0,
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#E5C99F] bg-white px-3 py-2 focus-within:border-[#F7941D] focus-within:ring-2 focus-within:ring-[#F7941D]/20">
      <Clock size={14} className="text-[#B98A3C]" />
      <input
        id={`${idPrefix}-time`}
        aria-label="Time of birth"
        type="time"
        step={60}
        value={value}
        onChange={handleChange}
        className="flex-1 bg-transparent text-sm tabular-nums text-[#2a1304] focus:outline-none"
      />
    </div>
  );
}
