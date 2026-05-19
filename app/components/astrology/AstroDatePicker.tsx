"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export interface AstroDate {
  day: number;
  month: number; // 1-12
  year: number;
}

interface Props {
  value: AstroDate;
  onChange: (next: AstroDate) => void;
  /** Earliest selectable year. Default 1900. */
  minYear?: number;
  /** Latest selectable year. Default current year + 1. */
  maxYear?: number;
  idPrefix?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

function clampDay(day: number, month: number, year: number): number {
  return Math.min(Math.max(1, day), daysInMonth(year, month));
}

/**
 * Self-contained calendar picker. We render a textual summary as the trigger and
 * a popover grid on click. The form receives `{ day, month, year }` numerics so
 * the upstream BirthDetails shape stays unchanged.
 */
export default function AstroDatePicker({
  value, onChange,
  minYear = 1900,
  maxYear = new Date().getFullYear() + 1,
  idPrefix = "dp",
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value.month);
  const [viewYear, setViewYear] = useState(value.year);
  const popRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setViewMonth(value.month);
    setViewYear(value.year);
  }, [value.month, value.year]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        popRef.current && !popRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const firstWeekday = useMemo(
    () => new Date(viewYear, viewMonth - 1, 1).getDay(),
    [viewYear, viewMonth],
  );
  const totalDays = daysInMonth(viewYear, viewMonth);

  function step(deltaMonths: number) {
    const totalMonth = (viewYear * 12) + (viewMonth - 1) + deltaMonths;
    const ny = Math.floor(totalMonth / 12);
    const nm = (totalMonth % 12) + 1;
    if (ny < minYear || ny > maxYear) return;
    setViewYear(ny);
    setViewMonth(nm);
  }

  function pick(d: number) {
    onChange({ day: clampDay(d, viewMonth, viewYear), month: viewMonth, year: viewYear });
    setOpen(false);
  }

  const yearOptions = useMemo(() => {
    const arr: number[] = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [minYear, maxYear]);

  const label = `${String(value.day).padStart(2, "0")} ${MONTHS[value.month - 1]} ${value.year}`;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={`${idPrefix}-trigger`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#E5C99F] bg-white px-3 py-2 text-left text-sm text-[#333] focus:border-[#F7941D] focus:ring-2 focus:ring-[#F7941D]/20 focus:outline-none"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <Calendar size={14} className="text-[#B98A3C]" />
          {label}
        </span>
        <span className="text-[10px] text-[#A78A5A]">change</span>
      </button>
      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="Pick a date"
          className="absolute z-30 mt-1 w-[280px] rounded-xl border border-[#E5C99F] bg-white p-3 shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 pb-2">
            <button
              type="button"
              onClick={() => step(-1)}
              className="rounded p-1 text-[#6b4a1f] hover:bg-[#FFF6E8] focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="rounded border border-[#E5C99F] bg-white px-1.5 py-0.5 text-xs"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="rounded border border-[#E5C99F] bg-white px-1.5 py-0.5 text-xs"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              className="rounded p-1 text-[#6b4a1f] hover:bg-[#FFF6E8] focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-[#8A6A2A]">
            {WEEKDAYS.map((w) => <div key={w} className="text-center">{w}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const selected = d === value.day && viewMonth === value.month && viewYear === value.year;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => pick(d)}
                  className={
                    "h-8 rounded text-xs font-medium transition-colors " +
                    (selected
                      ? "bg-gradient-to-br from-[#F7941D] to-[#E08015] text-white shadow"
                      : "text-[#2a1304] hover:bg-[#FFF6E8]")
                  }
                  aria-pressed={selected}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
