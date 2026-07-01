"use client";

import { useState } from "react";
import { X, CalendarClock, Loader2 } from "lucide-react";
import AstroDatePicker, { AstroDate } from "../astrology/AstroDatePicker";
import AstroTimePicker from "../astrology/AstroTimePicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Receives the chosen local Date; resolve when the schedule round-trip is done. */
  onSchedule: (scheduledAt: Date) => Promise<void>;
  /** Booking date (order created/paid). Bounds the schedule to within 4 days of it. */
  bookingDate?: string | Date | null;
}

// Mirror the chat-service authoritative bounds: ≥ now + 2h, ≤ booking + 4 days.
const MIN_LEAD_MS = 2 * 60 * 60 * 1000;
const SCHEDULE_WINDOW_MS = 4 * 24 * 60 * 60 * 1000;

function defaultStart(): { date: AstroDate; time: { hour: number; minute: number } } {
  const d = new Date(Date.now() + MIN_LEAD_MS + 5 * 60 * 1000); // just past the 2h min
  return {
    date: { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() },
    time: { hour: d.getHours(), minute: d.getMinutes() },
  };
}

export default function SchedulePujaLiveModal({ isOpen, onClose, onSchedule, bookingDate }: Props) {
  const init = defaultStart();
  const [date, setDate] = useState<AstroDate>(init.date);
  const [time, setTime] = useState(init.time);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const chosen = new Date(date.year, date.month - 1, date.day, time.hour, time.minute, 0, 0);

  const bookingTs = bookingDate ? new Date(bookingDate).getTime() : Date.now();

  const submit = async () => {
    setError(null);
    const t = chosen.getTime();
    if (t < Date.now() + MIN_LEAD_MS) {
      setError("Please choose a time at least 2 hours from now.");
      return;
    }
    if (t > bookingTs + SCHEDULE_WINDOW_MS) {
      setError("Live Puja must be scheduled within 4 days of booking.");
      return;
    }
    setSaving(true);
    try {
      await onSchedule(chosen);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Could not schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 font-sans" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(255,140,0,0.18)] w-full max-w-sm overflow-hidden text-[#4A3B32]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5" />
            <h2 className="font-bold">Schedule Puja Live</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Pick a date & time for the private video puja — at least 2 hours away and within 4 days of your booking. Both of you will get a reminder 10 minutes before.</p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Date</label>
            <AstroDatePicker value={date} onChange={setDate} minYear={new Date().getFullYear()} maxYear={new Date().getFullYear() + 1} idPrefix="puja-dp" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Time</label>
            <AstroTimePicker hour={time.hour} minute={time.minute} onChange={setTime} idPrefix="puja-tp" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={submit}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Schedule Puja Live"}
          </button>
        </div>
      </div>
    </div>
  );
}
