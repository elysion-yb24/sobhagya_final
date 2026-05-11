"use client";

import { motion } from "framer-motion";

export default function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="relative rounded-2xl p-[1.5px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(247,148,29,0.35), rgba(255,213,138,0.25), rgba(184,106,11,0.35))",
          }}
        >
          <div className="rounded-[14px] overflow-hidden bg-white">
            <div className="relative h-52 sm:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100" />
              <motion.div
                aria-hidden
                className="absolute inset-0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.1,
                }}
                style={{
                  background:
                    "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.6) 50%, transparent 65%)",
                }}
              />
            </div>
            <div className="p-5 space-y-3">
              <div className="h-5 rounded-md bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 w-3/4" />
              <div className="h-3.5 rounded-md bg-gradient-to-r from-orange-100/70 via-amber-100/70 to-orange-100/70" />
              <div className="h-3.5 rounded-md bg-gradient-to-r from-orange-100/70 via-amber-100/70 to-orange-100/70 w-2/3" />
              <div className="pt-3 flex items-center justify-between">
                <div className="h-3 w-20 rounded-md bg-orange-100/70" />
                <div className="h-3 w-16 rounded-md bg-orange-100/70" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
