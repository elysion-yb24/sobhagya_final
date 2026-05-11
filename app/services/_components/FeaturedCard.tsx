"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LotusDivider, StarDust } from "./Ornaments";

interface Props {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  delay?: number;
  /** retained for compatibility but not rendered */
  chapter?: number;
}

const container: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.09,
    },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Cosmic amulet — featured edition (quiet).
 * Same dark cosmic surface and gilt frame as the small cards, scaled up,
 * with a larger glowing medallion and a gold-shimmer CTA.
 */
export default function FeaturedCard({
  icon,
  title,
  description,
  buttonText,
  href,
  delay = 0,
  chapter,
}: Props) {
  // chapter intentionally unused — alignment kept simple
  void chapter;

  return (
    <motion.article
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
      className="group relative h-full"
    >
      {/* Static gilt frame */}
      <div
        className="relative h-full rounded-2xl p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_36px_64px_-26px_rgba(247,148,29,0.55)]"
        style={{
          background:
            "linear-gradient(135deg, #F7941D 0%, #FFD58A 30%, #B86A0B 55%, #FFD58A 80%, #F7941D 100%)",
          boxShadow:
            "0 18px 38px -22px rgba(122,69,18,0.55), 0 0 0 1px rgba(255,213,138,0.12)",
        }}
      >
        <div
          className="relative h-full rounded-[14px] overflow-hidden flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #361a06 0%, #190a02 60%, #0b0501 100%)",
          }}
        >
          {/* faint star dust */}
          <StarDust count={16} opacity={0.55} seed={1} />

          {/* faint inner gold trim */}
          <div
            aria-hidden
            className="absolute inset-2 rounded-xl pointer-events-none"
            style={{ border: "1px solid rgba(247,148,29,0.14)" }}
          />

          <div className="relative px-5 pt-7 pb-5 sm:px-7 sm:pt-9 sm:pb-7 flex-1 flex flex-col">
            {/* Glowing medallion */}
            <motion.div
              variants={item}
              className="relative flex justify-center"
            >
              {/* outer halo */}
              <span
                aria-hidden
                className="absolute inset-0 -m-3 rounded-full blur-2xl opacity-65 group-hover:opacity-90 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle, rgba(247,148,29,0.7), transparent 70%)",
                }}
              />
              {/* idle breathing ring */}
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 0 6px rgba(247,148,29,0.14)",
                }}
              />
              <div
                className="relative w-[92px] h-[92px] rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, #FFFCF1 0%, #FFEED0 60%, #FFE3A8 100%)",
                  boxShadow:
                    "inset 0 1px 3px rgba(255,255,255,0.95), inset 0 -4px 10px rgba(170,100,20,0.20), 0 12px 22px -8px rgba(122,69,18,0.55)",
                  border: "1.5px solid #C7831A",
                }}
              >
                <Image
                  src={icon}
                  alt=""
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(120,60,0,0.30))",
                  }}
                />
              </div>
            </motion.div>

            {/* Title — gold gradient */}
            <motion.h3
              variants={item}
              className="mt-5 text-center font-bold leading-tight"
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: 26,
                backgroundImage:
                  "linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 50%, #F7B23A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.005em",
                textShadow: "0 0 20px rgba(247,148,29,0.18)",
              }}
            >
              {title}
            </motion.h3>

            {/* Lotus divider */}
            <motion.div
              variants={item}
              className="mt-3 flex justify-center"
              style={{ color: "#FFD58A" }}
            >
              <LotusDivider width={130} height={18} />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="mt-3 text-center text-[14px] leading-relaxed mx-auto max-w-[34ch] flex-1"
              style={{
                fontFamily: "Poppins",
                color: "rgba(255,240,210,0.82)",
              }}
            >
              {description}
            </motion.p>

            {/* CTA */}
            <motion.div variants={item} className="mt-7">
              <Link href={href} className="block">
                <motion.button
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/btn relative w-full overflow-hidden rounded-md py-2.5 px-4 font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #E8850B 100%)",
                    boxShadow:
                      "0 14px 28px -10px rgba(247,148,29,0.65), inset 0 1px 0 rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,213,138,0.55)",
                    fontFamily: "Poppins",
                  }}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 text-[14px] tracking-wide">
                    {buttonText}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  {/* shimmer sweep on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
