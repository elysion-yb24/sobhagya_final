"use client";

import { usePathname } from "next/navigation";

export default function ClientPathname({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Conditionally render children only if not on "/rashi/[name]" pages
  if (pathname && pathname.startsWith("/rashi/")) return null;

  return <>{children}</>;
}
