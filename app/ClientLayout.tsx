"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Partners (role === 'friend' | 'astrologer') may only access these paths.
// Any other route redirects them back to the partner dashboard.
// NB: `/live-sessions` (exact) is the *user-facing* browse page and is NOT
// allowed for partners. Only the broadcasting sub-route `/live-sessions/<id>`
// is permitted, plus the astrologer's incoming-call screens.
const PARTNER_EXACT_PATHS = new Set([
  "/partner-info",
  "/login",
  "/logout",
]);

const PARTNER_ALLOWED_SUBTREES = [
  "/partner-info/",
  "/live-sessions/",
  "/astrologer-video-call",
  "/login/",
];

function isPartnerAllowed(pathname: string | null): boolean {
  if (!pathname) return true;
  if (PARTNER_EXACT_PATHS.has(pathname)) return true;
  return PARTNER_ALLOWED_SUBTREES.some((p) => pathname.startsWith(p));
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showFooter, setShowFooter] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Restrict partner roles to a small allow-list of pages.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("userDetails");
      if (!raw) return;
      const user = JSON.parse(raw);
      const role = user?.role;
      if (role !== "friend" && role !== "astrologer") return;
      if (!isPartnerAllowed(pathname)) {
        router.replace("/partner-info");
      }
    } catch {
      // Ignore parse errors — fail-open for non-partner users.
    }
  }, [pathname, router]);

  useEffect(() => {
    if (pathname && pathname.startsWith("/rashi/")) {
      const timer = setTimeout(() => {
        setShowFooter(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowFooter(true);
    }
  }, [pathname]);

  const isFullScreenPage = pathname?.startsWith('/live-sessions/') ||
                           pathname?.startsWith('/video-call') ||
                           pathname?.startsWith('/audio-call') ||
                           pathname === '/partner-info' ||
                           pathname === '/login';

  return (
    <>
      <main className={`flex flex-col flex-1 ${isFullScreenPage ? 'min-h-screen' : 'min-h-screen pt-[58px] md:pt-16 lg:pt-28 pb-safe'}`}>
        {children}
      </main>
      {showFooter && <div />}
    </>
  );
}
