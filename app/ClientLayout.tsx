"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showWebsite, setShowWebsite] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="shadow-[0px_0px_50px_rgba(255,215,0,0.3)]"
      >
        {children}
      </motion.div>

      {/* Conditionally render footer after delay */}
      {showFooter && <footer />}
    </>
  );
}
