"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useTilt } from "@/app/hooks/useTilt";
import { useCountUp } from "@/app/hooks/useCountUp";

interface MagneticButtonProps {
  href: string;
  src: string;
  alt: string;
  delay: number;
  inView: boolean;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ href, src, alt, delay, inView }) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < rect.width) {
      const pull = (1 - dist / rect.width) * 8;
      x.set((dx / dist) * pull);
      y.set((dy / dist) * pull);
    } else {
      x.set(0);
      y.set(0);
    }
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x, y }}
      className="w-[44%] xs:w-40 sm:w-44 transition-transform active:scale-95 hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
    >
      <Image
        src={src}
        alt={alt}
        width={160}
        height={60}
        className="cursor-pointer w-full h-auto object-contain drop-shadow-md"
      />
    </motion.a>
  );
};

const DownloadAppSection: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const tilt = useTilt({ max: 12, perspective: 1000, scale: 1.02, disabled: reduced });
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const downloads = useCountUp(1000000, { duration: 2, start: inView });
  const downloadsLabel =
    downloads >= 1_000_000
      ? `${(downloads / 1_000_000).toFixed(1)}M+`
      : downloads >= 1000
      ? `${Math.floor(downloads / 1000)}K+`
      : `${downloads}+`;

  // 6 orbiting ornaments
  const orbs = [
    { size: 14, distance: 130, delay: 0, color: "#F7941D" },
    { size: 10, distance: 160, delay: -3, color: "#ECB212" },
    { size: 18, distance: 110, delay: -6, color: "#FFC56B" },
    { size: 8, distance: 180, delay: -9, color: "#FFFFFF" },
    { size: 12, distance: 140, delay: -1.5, color: "#F7941D" },
    { size: 9, distance: 170, delay: -4.5, color: "#ECB212" },
  ];

  return (
    <section
      ref={sectionRef}
      className="section-spacing px-4 sm:px-6 relative overflow-hidden"
      style={{
        backgroundImage: "url('/orange.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Phone mockup with tilt + orbiting orbs */}
          <div className="w-full lg:w-1/2 flex justify-center mb-4 sm:mb-6 lg:mb-0">
            <div
              ref={tilt.ref}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
              style={tilt.style}
              className="relative"
            >
              {/* Orbiting ornaments — only on lg+ where we have space */}
              {!reduced && (
                <div
                  aria-hidden
                  className="hidden md:block absolute inset-0 pointer-events-none z-0"
                >
                  {orbs.map((o, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 animate-float-orbit"
                      style={{
                        animationDelay: `${o.delay}s`,
                        animationDuration: `${14 + i}s`,
                      }}
                    >
                      <div
                        className="absolute animate-float-orbit-counter"
                        style={{
                          left: `${o.distance}px`,
                          top: 0,
                          animationDelay: `${o.delay}s`,
                          animationDuration: `${14 + i}s`,
                        }}
                      >
                        <span
                          className="block rounded-full"
                          style={{
                            width: `${o.size}px`,
                            height: `${o.size}px`,
                            background: o.color,
                            boxShadow: `0 0 12px ${o.color}99`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Image
                src="/download-app.svg"
                alt="Meditation"
                width={500}
                height={563}
                className="w-2/3 xs:w-3/4 sm:w-2/3 md:w-1/2 lg:w-auto max-w-[260px] sm:max-w-sm md:max-w-md xl:max-w-lg h-auto object-contain devotional-glow relative z-10"
                priority
              />
            </div>
          </div>

          {/* Text & Download */}
          <div className="w-full lg:w-1/2 max-w-xl mx-auto lg:mx-0">
            <motion.h2
              className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-center lg:text-left tracking-tight"
              style={{ fontFamily: "EB Garamond" }}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7 }}
            >
              Download Our Mobile App
            </motion.h2>

            {/* Downloads chip */}
            <motion.div
              className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 rounded-full px-3 py-1 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tabular-nums">
                {downloadsLabel}
              </span>
              <span className="text-[10px] sm:text-xs opacity-90">downloads</span>
            </motion.div>

            <motion.p
              className="mt-3 sm:mt-4 text-white/95 text-sm sm:text-base font-medium leading-relaxed px-2 sm:px-0 text-center lg:text-left"
              style={{ fontFamily: "Poppins" }}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Get daily horoscope updates, personalized astrological insights, and expert guidance anytime, anywhere.
              Explore zodiac predictions, remedies, and live consultations all at your fingertips. Download now and unlock the wisdom of the stars.
            </motion.p>

            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-5 mt-5 sm:mt-6">
              <MagneticButton
                href="https://apps.apple.com/in/app/sobhagya/id6755958411"
                src="/app-store.svg"
                alt="App Store"
                delay={0.45}
                inView={inView}
              />
              <MagneticButton
                href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en"
                src="/play-store.svg"
                alt="Google Play"
                delay={0.55}
                inView={inView}
              />
            </div>

            <motion.p
              className="mt-4 italic text-white/90 text-xs sm:text-sm font-medium text-center lg:text-left tracking-wide"
              style={{ fontFamily: "Poppins" }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Stay Connected with Astrology!
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
