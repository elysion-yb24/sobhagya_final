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
}

function defaultStart(): { date: AstroDate; time: { hour: number; minute: number } } {
  const d = new Date(Date.now() + 30 * 60 * 1000); // +30 min
  return {
    date: { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() },
    time: { hour: d.getHours(), minute: d.getMinutes() },
  };
}

export default function SchedulePujaLiveModal({ isOpen, onClose, onSchedule }: Props) {
  const init = defaultStart();
  const [date, setDate] = useState<AstroDate>(init.date);
  const [time, setTime] = useState(init.time);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const chosen = new Date(date.year, date.month - 1, date.day, time.hour, time.minute, 0, 0);

  const submit = async () => {
    setError(null);
    if (chosen.getTime() <= Date.now()) {
      setError("Please pick a time in the future.");
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
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5" />
            <h2 className="font-semibold">Schedule Puja Live</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Pick a date & time for the private video puja. Both of you will get a reminder 5 minutes before.</p>

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
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Schedule Puja Live"}
          </button>
        </div>
      </div>
    </div>
  );
}
