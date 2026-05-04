"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Clock } from "lucide-react";

interface AwayCountdownOverlayProps {
  /** Seconds left before the session is auto-ended. */
  secondsRemaining: number;
  /** Astrologer name for the message body. */
  astrologerName?: string;
  /** Called when the user taps "Stay in chat" — parent should clear the deadline. */
  onStay: () => void;
}

/**
 * Shown when the chat tab is hidden (locked screen, switched apps, switched
 * tab) while a session is active. Counts down from 10s; if the user returns
 * before 0 the parent clears the deadline and dismisses this overlay. Hitting
 * 0 triggers the parent's existing end-session flow.
 */
export default function AwayCountdownOverlay({
  secondsRemaining,
  astrologerName = "Astrologer",
  onStay,
}: AwayCountdownOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const safeSeconds = Math.max(0, Math.ceil(secondsRemaining));

  const overlay = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Blurred backdrop — matches ChatConnectingModal pattern */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Card */}
      <div
        role="alertdialog"
        aria-live="assertive"
        aria-label="Trying to reconnect"
        className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-7 max-w-sm w-full text-center border border-orange-100"
      >
        <div className="flex justify-center mb-4">
          <div className="relative p-4 rounded-full bg-orange-100 text-orange-600">
            <Loader2 className="w-7 h-7 animate-spin" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-orange-400/30 blur-md animate-pulse" />
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 no-justify">
          Trying to reconnect…
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed no-justify">
          Your chat with{" "}
          <span className="font-semibold text-gray-800">{astrologerName}</span>{" "}
          will end in
        </p>

        <div className="my-4 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="tabular-nums text-3xl font-extrabold text-orange-600">
            {safeSeconds}s
          </span>
        </div>

        <button
          type="button"
          onClick={onStay}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all"
        >
          Stay in chat
        </button>

        <p className="mt-3 text-[11px] text-gray-400 no-justify">
          Return to this tab to keep the session alive.
        </p>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
