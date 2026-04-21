// app/history/call-history/page.tsx
"use client";

import Link from "next/link";
import { PhoneCall, ArrowLeft, Sparkles } from "lucide-react";
import CallHistory from "../../components/history/CallHistory";

export default function CallHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20">
      {/* Premium Hero Banner */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white"
        aria-label="Call History header"
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='4' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        {/* Soft blurred orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />

        <div className="relative section-container py-8 sm:py-10 md:py-14">
          {/* Back link on mobile */}
          <Link
            href="/my-profile"
            className="inline-flex sm:hidden items-center gap-1.5 text-white/80 hover:text-white text-xs font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-3.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <PhoneCall className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
                  style={{ fontFamily: "EB Garamond, serif" }}
                >
                  Call History
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base mt-1">
                  Every consultation, preserved for reflection
                </p>
              </div>
            </div>

            <Link
              href="/call-with-astrologer"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 hover:text-orange-700 font-semibold text-sm sm:text-base px-5 py-2.5 sm:py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all w-full md:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              New Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="section-container py-6 sm:py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <CallHistory />
        </div>
      </main>
    </div>
  );
}
