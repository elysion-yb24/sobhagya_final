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

  return (
    <>
      <div className="min-h-screen">
        {children}
      </div>
      {showFooter && <footer />}
    </>
  );
}
