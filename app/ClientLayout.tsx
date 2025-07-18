"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showWebsite, setShowWebsite] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    setShowWebsite(true);

    if (pathname && pathname.startsWith("/rashi/")) {
      const timer = setTimeout(() => {
        setShowFooter(true);
      }, 1000); 
      return () => clearTimeout(timer);
    } else {
      setShowFooter(true);
    }
  }, [pathname]);

  // Prevent hydration mismatch by not rendering motion until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>

      {/* Conditionally render footer after delay */}
      {showFooter && <footer />}
    </>
  );
}
