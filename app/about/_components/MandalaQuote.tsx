"use client";

import { motion } from "framer-motion";
import { Mandala, SunburstYantra } from "@/app/services/_components/Ornaments";

const QUOTE =
  "Sobhagya makes astrology accessible to everyone, whether you are a beginner or an enthusiast. The app is designed to help users navigate major life challenges with confidence and cosmic wisdom.";

export default function MandalaQuote() {
  const words = QUOTE.split(" ");

  return (
    <section className="relative py-12 sm:py-16 bg-white overflow-hidden">
      {/* Rotating mandala backdrop */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-300 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <Mandala size={520} opacity={0.12} />
      </motion.div>

      {/* Sunburst behind */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <SunburstYantra size={420} opacity={0.07} />
      </motion.div>

      {/* Drifting sparkle */}
      <motion.span
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "-5%",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "rgba(255,213,138,1)",
          boxShadow: "0 0 12px rgba(255,213,138,1)",
        }}
        animate={{ x: ["0%", "2400%"], y: [0, -30, 40, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
      />

      <div className="section-container relative z-10">
        <motion.blockquote
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0.2 },
            },
          }}
        >
          {/* Opening quote mark */}
          <motion.div
            className="text-6xl text-orange-300 mb-6 leading-none"
            style={{ fontFamily: "'EB Garamond', serif" }}
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            &ldquo;
          </motion.div>

          <p
            className="text-lg sm:text-xl md:text-[24px] leading-[1.85] text-gray-700 italic"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {words.map((w, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.28em]"
                variants={{
                  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </p>

          {/* Closing decorative line */}
          <motion.div
            className="mt-8 mx-auto w-16 h-[2px] rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, #F7941D, transparent)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 + words.length * 0.05 }}
          />
        </motion.blockquote>
      </div>
    </section>
  );
}
