"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LotusDivider, StarDust } from "./Ornaments";

interface Service {
  name: string;
  image: string;
  description: string;
  link: string;
}

interface Props {
  service: Service;
  delay?: number;
  index?: number;
}

const container: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.07,
    },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Cosmic amulet — quiet edition.
 * Dark cosmic surface, static gilt frame (no rotation), large glowing medallion,
 * gold gradient title, lotus divider, gold link.
 */
export default function ServiceCard({ service, delay = 0, index = 0 }: Props) {
  return (
    <motion.article
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay }}
      className="group relative h-full"
    >
      {/* Static gilt frame — gold gradient edge, no rotation */}
      <div
        className="relative h-full rounded-2xl p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_24px_46px_-22px_rgba(247,148,29,0.45)]"
        style={{
          background:
            "linear-gradient(135deg, #F7941D 0%, #FFD58A 30%, #B86A0B 55%, #FFD58A 80%, #F7941D 100%)",
          boxShadow:
            "0 12px 26px -22px rgba(122,69,18,0.55), 0 0 0 1px rgba(255,213,138,0.10)",
        }}
      >
        {/* Inner cosmic surface */}
        <div
          className="relative h-full rounded-[14px] overflow-hidden flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #2e1605 0%, #170902 65%, #0a0401 100%)",
          }}
        >
          {/* faint star dust */}
          <StarDust count={10} opacity={0.45} seed={index + 1} />

          {/* very faint inner gold trim */}
          <div
            aria-hidden
            className="absolute inset-1.5 rounded-[10px] pointer-events-none"
            style={{ border: "1px solid rgba(247,148,29,0.10)" }}
          />

          <div className="relative px-3 pt-5 pb-4 xs:px-3.5 sm:px-5 sm:pt-6 sm:pb-5 flex-1 flex flex-col">
            {/* Glowing medallion (large + prominent) */}
            <motion.div
              variants={item}
              className="relative mt-1 flex justify-center"
            >
              {/* outer halo */}
              <span
                aria-hidden
                className="absolute inset-0 -m-3 rounded-full blur-2xl opacity-65 group-hover:opacity-90 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle, rgba(247,148,29,0.65), transparent 70%)",
                }}
              />
              {/* idle breathing ring */}
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 0 4px rgba(247,148,29,0.14)",
                }}
              />
              <div
                className="relative w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, #FFFCF1 0%, #FFEED0 60%, #FFE3A8 100%)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255,255,255,0.95), inset 0 -3px 8px rgba(170,100,20,0.18), 0 6px 14px -5px rgba(122,69,18,0.55)",
                  border: "1.5px solid #C7831A",
                }}
              >
                <img
                  src={encodeURI(service.image || "/default-image.png")}
                  alt=""
                  className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
                  style={{
                    filter:
                      "drop-shadow(0 1px 1px rgba(120,60,0,0.25))",
                  }}
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Title — gold gradient */}
            <motion.h3
              variants={item}
              className="mt-4 text-center font-bold leading-tight text-base sm:text-[17px]"
              style={{
                fontFamily: "'EB Garamond', serif",
                backgroundImage:
                  "linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 50%, #F7B23A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.005em",
              }}
            >
              {service.name}
            </motion.h3>

            {/* Lotus divider */}
            <motion.div
              variants={item}
              className="mt-2 flex justify-center"
              style={{ color: "#FFD58A" }}
            >
              <LotusDivider width={92} height={14} />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="mt-2.5 text-center text-[12.5px] sm:text-[13px] leading-relaxed flex-1"
              style={{
                fontFamily: "Poppins",
                color: "rgba(255,240,210,0.78)",
              }}
            >
              {service.description}
            </motion.p>

            {/* Read more */}
            <motion.div variants={item} className="mt-4 text-center">
              <Link
                href={service.link}
                className="inline-flex items-center gap-1 font-semibold text-[12.5px] group/explore"
                style={{ color: "#FFD58A", fontFamily: "Poppins" }}
              >
                <span className="relative">
                  Read more
                  <span
                    className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 group-hover/explore:w-full transition-all duration-300"
                    style={{
                      background:
                        "linear-gradient(90deg, #F7941D, #FFD58A, #F7941D)",
                    }}
                  />
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/explore:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
