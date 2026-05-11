"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Gem, Hash, Leaf, Layers } from "lucide-react";

type Category = {
  id: number | null;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const CATEGORIES: Category[] = [
  { id: null, name: "All", Icon: Sparkles },
  { id: 3, name: "Horoscope", Icon: Star },
  { id: 10, name: "Gems", Icon: Gem },
  { id: 11, name: "Rudraksha", Icon: Leaf },
  { id: 13, name: "Tarot Cards", Icon: Layers },
  { id: 12, name: "Angel Numbers", Icon: Hash },
];

interface Props {
  activeId: number | null;
  onChange: (id: number | null) => void;
}

export default function CategoryFilter({ activeId, onChange }: Props) {
  return (
    <div className="section-container -mt-12 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Outer glow */}
        <div
          aria-hidden
          className="absolute -inset-2 rounded-3xl blur-xl opacity-50 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(247,148,29,0.18), rgba(255,215,0,0.18), rgba(184,106,11,0.18))",
          }}
        />

        {/* Gilt-edged container */}
        <div
          className="relative rounded-2xl p-[1.5px]"
          style={{
            background:
              "linear-gradient(135deg, #F7941D 0%, #FFD58A 30%, #B86A0B 55%, #FFD58A 80%, #F7941D 100%)",
            boxShadow:
              "0 18px 40px -18px rgba(247,148,29,0.45), 0 0 0 1px rgba(255,213,138,0.15)",
          }}
        >
          <div className="relative rounded-[14px] bg-white/95 backdrop-blur-md p-2 sm:p-3 flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat, idx) => {
              const isActive = activeId === cat.id;
              const Icon = cat.Icon;
              return (
                <motion.button
                  key={cat.name}
                  onClick={() => onChange(cat.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex-shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 group ${
                    isActive ? "text-white" : "text-gray-600 hover:text-orange-600"
                  }`}
                  style={{
                    fontFamily: "Poppins",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Active background — animated layout pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="category-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #F7941D 100%)",
                          boxShadow:
                            "0 8px 20px -6px rgba(247,148,29,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 6px rgba(120,60,0,0.2)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hover halo for inactive */}
                  {!isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(247,148,29,0.08), rgba(255,215,0,0.08))",
                      }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 relative z-10 transition-transform ${
                      isActive ? "scale-110" : "group-hover:rotate-12"
                    }`}
                  />
                  <span className="relative z-10">{cat.name}</span>

                  {/* Sparkle on active */}
                  {isActive && (
                    <motion.span
                      aria-hidden
                      className="absolute -top-1 -right-1 z-20"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <span className="block w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_10px_rgba(255,225,170,0.9)]" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { CATEGORIES };
