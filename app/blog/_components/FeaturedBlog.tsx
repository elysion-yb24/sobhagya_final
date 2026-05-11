"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { BlogPost } from "@/types";

interface Props {
  blog: BlogPost;
}

export default function FeaturedBlog({ blog }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 130, damping: 24, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 130, damping: 24, mass: 0.5 });

  const rotX = useTransform(sy, [-0.5, 0.5], [4, -4]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-4, 4]);
  const imageX = useTransform(sx, [-0.5, 0.5], ["-3%", "3%"]);
  const imageY = useTransform(sy, [-0.5, 0.5], ["-2%", "2%"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
  };

  const tag = blog.tags && blog.tags.length > 0 ? blog.tags[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 sm:mb-16"
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center gap-3 mb-5 sm:mb-7"
      >
        <span
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.28em] uppercase"
          style={{
            background: "linear-gradient(90deg, #C7831A, #F7941D, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          Featured Article
        </span>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgba(247,148,29,0.6), transparent)",
          }}
        />
      </motion.div>

      <Link
        href={`/blog/${blog.slug || blog.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 rounded-3xl"
      >
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={onLeave}
          className="relative group"
          style={{ perspective: 1400 }}
        >
          {/* Aura glow */}
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2rem] blur-3xl opacity-50 group-hover:opacity-95 transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(247,148,29,0.45) 0%, rgba(255,215,0,0.35) 30%, rgba(184,106,11,0.45) 70%, rgba(247,148,29,0.35) 100%)",
            }}
          />

          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            <div
              className="relative rounded-3xl p-[1.5px]"
              style={{
                background:
                  "linear-gradient(135deg, #F7941D 0%, #FFD58A 25%, #B86A0B 50%, #FFD58A 75%, #F7941D 100%)",
                boxShadow:
                  "0 30px 80px -28px rgba(247,148,29,0.55), 0 0 0 1px rgba(255,213,138,0.15)",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="relative rounded-[22px] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[340px] sm:min-h-[420px]"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 0%, #2d1654 0%, #1a0a2e 60%, #0a0410 100%)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* IMAGE — left on desktop */}
                <div
                  className="relative h-56 sm:h-72 md:h-auto overflow-hidden"
                  style={{ transform: "translateZ(28px)" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ x: imageX, y: imageY, scale: 1.1 }}
                  >
                    <Image
                      src={blog.image || "/default-image.png"}
                      alt={blog.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>

                  {/* Right edge gradient blend into dark panel */}
                  <div
                    className="absolute inset-0 pointer-events-none md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#1a0a2e]/40"
                  />
                  {/* Mobile bottom blend */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0410]/80 via-transparent to-transparent md:bg-none" />

                  {/* Shine sweep */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    initial={{ x: "-120%" }}
                    animate={hovered ? { x: "120%" } : { x: "-120%" }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)",
                      mixBlendMode: "overlay",
                    }}
                  />

                  {/* Tag */}
                  {tag && (
                    <div
                      className="absolute top-5 left-5 z-10"
                      style={{ transform: "translateZ(40px)" }}
                    >
                      <span
                        className="inline-flex items-center px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-full backdrop-blur-md uppercase tracking-wider"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(247,148,29,0.95), rgba(255,179,71,0.95))",
                          color: "white",
                          boxShadow:
                            "0 4px 16px -2px rgba(247,148,29,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
                          fontFamily: "Poppins",
                        }}
                      >
                        {tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONTENT — right */}
                <div
                  className="relative flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12"
                  style={{ transform: "translateZ(20px)" }}
                >
                  {/* Star dust pattern */}
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none opacity-50"
                  >
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span
                        key={i}
                        className="absolute rounded-full bg-amber-200"
                        style={{
                          width: `${1 + (i % 3) * 0.6}px`,
                          height: `${1 + (i % 3) * 0.6}px`,
                          left: `${(i * 19.3) % 100}%`,
                          top: `${(i * 27.1) % 100}%`,
                          opacity: 0.25 + (i % 4) * 0.1,
                          boxShadow: "0 0 6px rgba(255,225,170,0.6)",
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative">
                    {/* Featured pill */}
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.24em] uppercase mb-4 sm:mb-5 px-2.5 py-1 rounded-full"
                      style={{
                        color: "#FFE7B5",
                        background: "rgba(247,148,29,0.15)",
                        border: "1px solid rgba(247,148,29,0.4)",
                        fontFamily: "Poppins",
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Editor&apos;s Pick
                    </span>

                    <h2
                      className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 sm:mb-5"
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        background:
                          "linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 60%, #F7B23A 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        letterSpacing: "0.005em",
                      }}
                    >
                      {blog.title}
                    </h2>

                    <p
                      className="text-sm sm:text-base leading-relaxed mb-5 sm:mb-7 line-clamp-3"
                      style={{
                        fontFamily: "Poppins",
                        color: "rgba(255,240,210,0.78)",
                      }}
                    >
                      {blog.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-5 mb-6 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-amber-200/75">
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span style={{ fontFamily: "Poppins" }}>
                          {blog.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-200/75">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        <span style={{ fontFamily: "Poppins" }}>
                          {blog.readTime}
                        </span>
                      </div>
                    </div>

                    {/* CTA button */}
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold text-white relative overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #F7941D 100%)",
                        boxShadow:
                          "0 12px 26px -8px rgba(247,148,29,0.65), inset 0 1px 0 rgba(255,255,255,0.35)",
                        fontFamily: "Poppins",
                      }}
                    >
                      <span className="relative z-10">Read full article</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <motion.span
                        aria-hidden
                        className="absolute inset-0"
                        initial={{ x: "-100%" }}
                        animate={hovered ? { x: "100%" } : { x: "-100%" }}
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                        style={{
                          background:
                            "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
                        }}
                      />
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
