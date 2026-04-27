"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PhoneIcon } from '@heroicons/react/24/solid';

const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const targetCount = 10023;
  const [particlePositions, setParticlePositions] = useState<{ left: number; top: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticlePositions(
      Array.from({ length: shouldReduceMotion ? 8 : 30 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
        size: 1 + Math.random() * 2,
      }))
    );
  }, [shouldReduceMotion]);

  // Animated counter
  useEffect(() => {
    if (!mounted) return;
    if (shouldReduceMotion) {
      setDisplayCount(targetCount);
      return;
    }
    let start = 0;
    const duration = 2000;
    const step = targetCount / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= targetCount) {
        setDisplayCount(targetCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [mounted, shouldReduceMotion]);

  const navigationCards = [
    {
      id: "chat",
      title: "Chat with Astrologer",
      icon: "/chat2.png",
      href: "/chat",
    },
    {
      id: "talk",
      title: "Talk to Astrologer",
      icon: "/contact2.png",
      href: "/call-with-astrologer",
    },
    {
      id: "shop",
      title: "Sobhagya Shop",
      icon: "/astromall.png",
      href: "https://www.ramvarna.com",
      isExternal: true,
    }
  ];

  return (
    <div className="flex flex-col w-full relative overflow-hidden">
      {/* Hero Section */}
      <motion.section
        className="text-white relative w-full flex flex-col justify-start pt-2 sm:pt-3 pb-6 sm:pb-8 md:pb-10"
        style={{
          backgroundImage: "url(/bg-image1111.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/10 z-0" />

        {/* Floating star particles */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
            {particlePositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/40"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: `${pos.size}px`,
                  height: `${pos.size}px`,
                }}
                animate={{
                  y: [-10, -80, -10],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: pos.duration,
                  repeat: Infinity,
                  delay: pos.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="section-container relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-2 md:gap-6 lg:gap-10">
          {/* Left: Text Content */}
          <motion.div
            className="w-full md:w-1/2 lg:w-3/5 text-center md:text-left order-2 md:order-1 mt-2 sm:-mt-10 md:mt-0"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -40 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="font-bold leading-tight mb-2 sm:mb-3" style={{
              fontFamily: "EB Garamond",
              fontSize: 'clamp(26px, 7vw, 55px)',
              fontWeight: 700,
              lineHeight: 1.15,
            }}>
              <span className="tabular-nums">{displayCount.toLocaleString()}</span>{" "}
              <span>Consultations Done</span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 opacity-90 px-2 sm:px-0" style={{
              fontFamily: "EB Garamond"
            }}>
              Yours might be waiting
            </p>
            <Link href="/call-with-astrologer">
              <motion.button
                className="bg-white text-orange-600 px-5 sm:px-7 py-3 sm:py-4 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:bg-saffron-500 hover:text-white transition-all duration-300 flex items-center justify-center mx-auto md:mx-0 w-full xs:w-auto max-w-xs group border border-white/60"
                style={{ fontFamily: "Poppins", fontSize: "clamp(15px, 3.5vw, 20px)" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:animate-pulse" />
                Get a call now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right: Astrologer Image */}
          <motion.div
            className="w-full md:w-1/2 lg:w-2/5 flex justify-center md:justify-end relative order-1 md:order-2 min-h-[260px] xs:min-h-[300px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[460px]"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 40 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative">
              {/* Zodiac background behind astrologer */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25 z-0 -translate-y-10 sm:-translate-y-14 -left-8 sm:-left-16">
                <Image
                  src="/zodiac-right.png"
                  alt="Background Zodiac"
                  width={400}
                  height={400}
                  className="w-[160px] h-[200px] xs:w-[200px] xs:h-[240px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] lg:w-[400px] lg:h-[400px] object-contain animate-mandala-spin"
                />
              </div>

              <Image
                src="/astrologer.svg"
                alt="Astrologer"
                width={450}
                height={400}
                className="object-contain max-w-[240px] xs:max-w-[280px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[440px] xl:max-w-[500px] translate-y-[40px] xs:translate-y-[30px] sm:translate-y-[10px] md:translate-y-[16px] relative z-10 devotional-glow"
                priority
              />
              {/* Floating zodiac accent */}
              <motion.div
                className="absolute right-0 xs:right-2 sm:right-4 md:right-[-30px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-20"
                animate={{ rotate: [0, -10, 10, 0], y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Image src="/Group (1) 4.png" alt="Zodiac Accent" width={70} height={70} className="w-[50px] h-[50px] xs:w-[60px] xs:h-[60px] sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px]" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Navigation Cards */}
      <div className="relative">
        <div className="relative z-20 -mt-2 xs:-mt-4 sm:-mt-20 md:-mt-8 lg:-mt-14 mb-6 sm:mb-10 md:mb-12">
          <div className="section-container">
            {/* Mobile: Compact horizontal buttons */}
            <div className="flex justify-start gap-3 sm:hidden px-1 overflow-x-auto scrollbar-hide scroll-touch pb-1">
              {navigationCards.map((card, idx) => (
                <Link
                  key={card.id}
                  href={card.href}
                  target={card.isExternal ? "_blank" : undefined}
                  className="flex-shrink-0 min-w-[132px]"
                >
                  <motion.div
                    className="premium-surface rounded-2xl px-3 py-3.5 min-h-[108px] flex flex-col items-center justify-center shadow-lg text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 astro-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                  >
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={28}
                      height={28}
                      className="mb-2 block"
                    />
                    <span className="text-[11px] xs:text-xs font-semibold leading-tight text-center" style={{ fontFamily: "Poppins" }}>
                      {card.title}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Tablet & Desktop: Card layout */}
            <div className="hidden sm:grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-4xl xl:max-w-5xl mx-auto">
              {navigationCards.map((card, idx) => (
                <Link key={card.id} href={card.href} target={card.isExternal ? "_blank" : undefined}>
                  <motion.div
                    className="rounded-xl p-5 sm:p-6 md:p-7 lg:p-8 flex flex-col items-center text-center shadow-xl bg-white text-gray-800 hover:bg-orange-50 hover:text-orange-600 hover:shadow-2xl transition-all duration-300 astro-card border border-gray-100"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
                    transition={{ delay: 0.9 + idx * 0.15, duration: 0.5 }}
                    whileHover={{ y: -4 }}
                  >
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={48}
                      height={48}
                      className="sm:w-[48px] sm:h-[48px] md:w-[52px] md:h-[52px] lg:w-[56px] lg:h-[56px] block"
                    />
                    <h3 className="font-medium mt-2 sm:mt-3 text-sm sm:text-base md:text-lg" style={{ fontFamily: "Inter" }}>{card.title}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;