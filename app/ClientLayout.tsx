"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showFooter, setShowFooter] = useState(false);
  const pathname = usePathname();

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
                           pathname?.startsWith('/audio-call');

  return (
    <>
      <main className={`min-h-screen ${isFullScreenPage ? '' : 'pt-[56px] md:pt-16 lg:pt-[88px]'}`}>
        {children}
      </main>
      {showFooter && <div />}
    </>
  );
}
