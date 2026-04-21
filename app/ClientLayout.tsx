"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Partners (role === 'friend' | 'astrologer') may only access these paths.
// Any other route redirects them back to the partner dashboard.
const PARTNER_ALLOWED_PREFIXES = [
  "/partner-info",
  "/live-sessions",
  "/login",
  "/logout",
];

function isPartnerAllowed(pathname: string | null): boolean {
  if (!pathname) return true;
  return PARTNER_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
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
                           pathname === '/partner-info';

  return (
    <>
      <main className={`flex flex-col ${isFullScreenPage ? 'min-h-screen' : 'min-h-screen pt-[72px] md:pt-[80px] lg:pt-[96px]'}`}>
        {children}
      </main>
      {showFooter && <div />}
    </>
  );
}
