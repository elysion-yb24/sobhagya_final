"use client";

import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] to-[#FFF6E8] text-[#2a1304]">
      <div className="section-container py-10 sm:py-14 space-y-6">
        <header className="text-center sm:text-left">
          <h1 className="font-garamond text-3xl sm:text-4xl font-semibold tracking-tight text-[#2a1304]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-[#6b4a1f] max-w-3xl">
              {subtitle}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
