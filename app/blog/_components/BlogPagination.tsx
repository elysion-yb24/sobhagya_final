"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}

export default function BlogPagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pageNumbers: (number | "ellipsis")[] = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window && i <= page + window)
    ) {
      pageNumbers.push(i);
    } else if (
      (i === page - window - 1 && i > 1) ||
      (i === page + window + 1 && i < totalPages)
    ) {
      pageNumbers.push("ellipsis");
    }
  }
  const deduped = pageNumbers.filter((v, idx, arr) => {
    if (v !== "ellipsis") return true;
    return arr[idx - 1] !== "ellipsis";
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-14 sm:mt-16"
    >
      {/* Prev */}
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="group relative flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fff7ea 100%)",
          color: "#C7831A",
          border: "1.5px solid rgba(247,148,29,0.35)",
          boxShadow: "0 6px 16px -8px rgba(247,148,29,0.4)",
          fontFamily: "Poppins",
        }}
        aria-label="Previous page"
      >
        <ArrowLeft className="w-4 h-4 enabled:group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {deduped.map((p, idx) =>
          p === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="px-1 text-amber-700/60 select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                fontFamily: "Poppins",
              }}
              aria-current={p === page ? "page" : undefined}
            >
              {p === page && (
                <motion.span
                  layoutId="pagination-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #F7941D 100%)",
                    boxShadow:
                      "0 10px 22px -6px rgba(247,148,29,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  p === page ? "text-white" : "text-amber-800/80 hover:text-orange-600"
                }`}
              >
                {p}
              </span>
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="group relative flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:-translate-y-0.5 active:scale-95 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #F7941D 100%)",
          boxShadow: "0 10px 22px -8px rgba(247,148,29,0.55)",
          fontFamily: "Poppins",
        }}
        aria-label="Next page"
      >
        <span className="relative z-10 hidden sm:inline">Next</span>
        <ArrowRight className="w-4 h-4 relative z-10 enabled:group-hover:translate-x-0.5 transition-transform" />
        {/* Shine */}
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full enabled:group-hover:translate-x-full transition-transform duration-700"
          style={{
            background:
              "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
          }}
        />
      </button>
    </motion.div>
  );
}
