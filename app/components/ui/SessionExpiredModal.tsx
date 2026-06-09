"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { LogIn, ShieldAlert } from "lucide-react";

/**
 * Global "session expired" modal.
 *
 * Listens for the `session-expired` window event (dispatched by
 * handleSessionExpired() in auth-utils once a token refresh has genuinely
 * failed). It blocks interaction and routes the user to a clean re-login,
 * preserving the current path via `?next=`. Auth state is already cleared by
 * the handler before this shows, so there is no "logged-in but broken" state.
 */
const REDIRECT_DELAY_MS = 4000;

const SessionExpiredModal: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToLogin = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const next =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    // Don't bounce back to auth pages.
    const safeNext = next.startsWith("/login") ? "/" : next;
    router.push(`/login?next=${encodeURIComponent(safeNext)}`);
  };

  useEffect(() => {
    const onExpired = () => {
      setOpen(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(goToLogin, REDIRECT_DELAY_MS);
    };
    window.addEventListener("session-expired", onExpired as EventListener);
    return () => {
      window.removeEventListener("session-expired", onExpired as EventListener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold">Session Expired</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 text-sm">
            Your session has expired for security reasons. Please log in again to continue.
          </p>
          <button
            onClick={goToLogin}
            className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <LogIn className="w-5 h-5" /> Login Again
          </button>
          <p className="text-xs text-gray-400 mt-3">Redirecting you to login…</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SessionExpiredModal;
