"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import { BlogPost } from "@/types";

interface Props {
  blog: BlogPost;
  index: number;
}

export default function BlogCard3D({ blog, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 22, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 160, damping: 22, mass: 0.4 });

  const rotX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  const glareBg = useTransform<number, string>(
    [sx as MotionValue<number>, sy as MotionValue<number>],
    ([xv, yv]: number[]) => {
      const xp = (xv + 0.5) * 100;
      const yp = (yv + 0.5) * 100;
      return `radial-gradient(circle at ${xp}% ${yp}%, rgba(255,231,181,0.5) 0%, rgba(247,148,29,0.18) 30%, transparent 65%)`;
    }
  );

  const imageShiftX = useTransform(sx, [-0.5, 0.5], ["-4%", "4%"]);
  const imageShiftY = useTransform(sy, [-0.5, 0.5], ["-3%", "3%"]);

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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: (index % 9) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <Link
        href={`/blog/${blog.slug || blog.id}`}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 rounded-2xl"
      >
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={onLeave}
          className="relative h-full group"
          style={{ perspective: 1100 }}
        >
          {/* Outer glow on hover */}
          <div
            aria-hidden
            className="absolute -inset-3 rounded-3xl blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(247,148,29,0.4) 0%, rgba(255,215,0,0.3) 50%, rgba(184,106,11,0.4) 100%)",
            }}
          />

          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-full"
          >
            {/* Gilt edge wrapper */}
            <div
              className="relative h-full rounded-2xl p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-22px_rgba(247,148,29,0.55)]"
              style={{
                background:
                  "linear-gradient(135deg, #F7941D 0%, #FFD58A 30%, #B86A0B 55%, #FFD58A 80%, #F7941D 100%)",
                boxShadow:
                  "0 14px 32px -22px rgba(122,69,18,0.5), 0 0 0 1px rgba(255,213,138,0.1)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Inner card */}
              <div
                className="relative h-full rounded-[14px] overflow-hidden flex flex-col bg-white"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* IMAGE with parallax */}
                <div
                  className="relative h-52 sm:h-56 overflow-hidden"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ x: imageShiftX, y: imageShiftY, scale: 1.12 }}
                  >
                    <Image
                      src={blog.image || "/default-image.png"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </motion.div>

                  {/* Gradient overlay for legibility */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(15,8,2,0) 50%, rgba(15,8,2,0.65) 100%)",
                    }}
                  />

                  {/* Animated shine on hover */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    initial={{ x: "-120%" }}
                    animate={hovered ? { x: "120%" } : { x: "-120%" }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
                      mixBlendMode: "overlay",
                    }}
                  />

                  {/* Tag chip */}
                  {tag && (
                    <div
                      className="absolute top-3 left-3 z-10"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <span
                        className="inline-flex items-center px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full backdrop-blur-md uppercase tracking-wider"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(247,148,29,0.95), rgba(255,179,71,0.95))",
                          color: "white",
                          boxShadow:
                            "0 4px 12px -2px rgba(247,148,29,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                          fontFamily: "Poppins",
                        }}
                      >
                        {tag}
                      </span>
                    </div>
                  )}

                  {/* Arrow CTA — appears on hover */}
                  <motion.div
                    className="absolute top-3 right-3 z-10"
                    style={{ transform: "translateZ(36px)" }}
                    initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
                    animate={
                      hovered
                        ? { opacity: 1, scale: 1, rotate: 0 }
                        : { opacity: 0, scale: 0.6, rotate: -45 }
                    }
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 25%, #FFFCF1 0%, #FFEED0 50%, #F7B23A 100%)",
                        boxShadow:
                          "inset 0 1.5px 2px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(170,100,20,0.25), 0 6px 14px -4px rgba(122,69,18,0.55)",
                        border: "1.5px solid #C7831A",
                      }}
                    >
                      <ArrowUpRight
                        className="w-5 h-5 text-[#3a2208]"
                        strokeWidth={2.4}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div
                  className="relative flex-1 flex flex-col p-5"
                  style={{ transform: "translateZ(18px)" }}
                >
                  <h3
                    className="text-base sm:text-lg font-bold leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors"
                    style={{
                      fontFamily: "'EB Garamond', serif",
                      color: "#1a0e2e",
                      letterSpacing: "0.005em",
                    }}
                  >
                    {blog.title}
                  </h3>

                  <p
                    className="text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 flex-1"
                    style={{
                      fontFamily: "Poppins",
                      color: "rgba(74,50,20,0.7)",
                    }}
                  >
                    {blog.excerpt}
                  </p>

                  {/* Divider */}
                  <div
                    aria-hidden
                    className="h-px w-full mb-3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(247,148,29,0.25), transparent)",
                    }}
                  />

                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-orange-500/80" />
                      <span style={{ fontFamily: "Poppins" }}>{blog.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-orange-500/80" />
                      <span style={{ fontFamily: "Poppins" }}>
                        {blog.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Read more underline */}
                  <div
                    className="mt-3.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold"
                    style={{
                      color: "#C7831A",
                      fontFamily: "Poppins",
                    }}
                  >
                    <span className="relative">
                      Read article
                      <span
                        className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 group-hover:w-full transition-all duration-400"
                        style={{
                          background:
                            "linear-gradient(90deg, #F7941D, #FFD58A, #F7941D)",
                        }}
                      />
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Holographic glare overlay */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[14px]"
                  style={{
                    background: glareBg,
                    mixBlendMode: "overlay",
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 300ms",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
