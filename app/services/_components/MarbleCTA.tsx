"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { PhoneIcon } from "@heroicons/react/24/solid";
import { ArrowRight } from "lucide-react";

function MagneticButton({
  children,
  className = "",
  primary = false,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  primary?: boolean;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = e.clientX - (r.left + r.width / 2);
    const cy = e.clientY - (r.top + r.height / 2);
    x.set(cx * 0.25);
    y.set(cy * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="w-full sm:w-auto"
    >
      <motion.div style={{ x: sx, y: sy }} className="w-full sm:w-auto">
        <motion.button
          whileTap={{ scale: 0.96 }}
          className={`relative group/btn overflow-hidden inline-flex items-center justify-center gap-2.5 py-3 px-7 rounded-xl font-semibold text-sm w-full ${className}`}
          style={
            primary
              ? {
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #F7941D 100%)",
                  backgroundSize: "200% 200%",
                  boxShadow:
                    "0 18px 38px -14px rgba(247,148,29,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
                }
              : {
                  color: "#B86A0B",
                  background: "rgba(255,255,255,0.9)",
                  border: "2px solid #F7941D",
                  boxShadow: "0 10px 24px -14px rgba(199,131,26,0.5)",
                }
          }
        >
          {primary && (
            <span
              aria-hidden
              className="absolute -inset-1 rounded-2xl opacity-60 blur-md animate-pulse"
              style={{
                background:
                  "linear-gradient(135deg, #F7941D, #FFD58A, #F7941D)",
                zIndex: -1,
              }}
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
          {primary && (
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}
        </motion.button>
      </motion.div>
    </Link>
  );
}

export default function MarbleCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const auroraX = useTransform(mx, [0, 1], ["20%", "80%"]);
  const auroraY = useTransform(my, [0, 1], ["20%", "80%"]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      className="relative py-9 sm:py-11 md:py-12 px-6 sm:px-10 text-center rounded-[2rem] overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,243,219,0.95))",
        border: "1px solid rgba(247,148,29,0.18)",
        boxShadow:
          "0 40px 80px -40px rgba(199,131,26,0.45), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Aurora gradient that follows pointer */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: useTransformAurora(auroraX, auroraY),
          mixBlendMode: "screen" as any,
        }}
      />

      {/* Slow rotating sigil */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none select-none">
        <Image
          src="/sobhagya-logo.svg"
          alt=""
          fill
          className="object-contain p-20 animate-rotate-slow"
        />
      </div>

      {/* Top filigree line */}
      <span
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[3px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #F7941D, #FFD58A, #F7941D, transparent)",
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.span
          className="inline-block text-[11px] font-semibold tracking-[0.3em] uppercase mb-3 text-orange-500"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Get Started
        </motion.span>
        <h2
          className="section-heading !text-2xl sm:!text-3xl md:!text-4xl mb-3"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #745802 0%, #C7831A 45%, #F7941D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Need Answers?
        </h2>
        <p
          className="text-gray-600 text-sm sm:text-base mb-7 leading-relaxed font-medium max-w-xl mx-auto"
          style={{ fontFamily: "Poppins" }}
        >
          Talk to top astrologers for help with birth chart, marriage match, career and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <MagneticButton href="/call-with-astrologer" primary>
            <PhoneIcon className="w-5 h-5 group-hover/btn:animate-pulse" />
            Talk Now
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </MagneticButton>
          <MagneticButton href="/call-with-astrologer">See Astrologers</MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

// helper to build aurora background from two motion values
function useTransformAurora(x: any, y: any) {
  return useMotionTemplate`radial-gradient(600px circle at ${x} ${y}, rgba(255,210,140,0.55), transparent 60%), radial-gradient(900px circle at ${y} ${x}, rgba(247,148,29,0.25), transparent 65%)`;
}
