"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/app/components/ui/SectionHeader";

/* ──────────────── Data ──────────────── */
const KEY_FEATURES = [
  { icon: "🪷", title: "Kundli (Birth Chart) Analysis", desc: "Detailed Vedic birth chart interpretation by expert astrologers." },
  { icon: "💼", title: "Career & Business Guidance", desc: "Navigate professional crossroads with planetary insight." },
  { icon: "❤️", title: "Love & Marriage Compatibility", desc: "Discover deep compatibility through Kundli matching." },
  { icon: "🧘", title: "Health & Wellness Astrology", desc: "Align your health decisions with cosmic rhythms." },
  { icon: "🔢", title: "Numerology & Card Readings", desc: "Unlock the hidden power of numbers and tarot." },
  { icon: "💰", title: "Financial Astrology", desc: "Make smarter financial moves guided by the stars." },
  { icon: "📿", title: "Astrological Remedies", desc: "Personalised gemstone, mantra, and ritual suggestions." },
  { icon: "🏡", title: "Vastu Shastra Consultation", desc: "Harmonise your living spaces for prosperity and peace." },
];

const WHY_CHOOSE = [
  { icon: "✅", title: "Trusted & Verified Astrologers", desc: "Every astrologer is rigorously vetted for expertise and accuracy." },
  { icon: "📱", title: "User-Friendly Interface", desc: "Intuitive design that makes astrology accessible to everyone." },
  { icon: "🕐", title: "24/7 Availability", desc: "Get guidance anytime — our astrologers are always online." },
  { icon: "⚡", title: "Instant & Accurate Guidance", desc: "Real-time consultations with precise, actionable insights." },
  { icon: "🌐", title: "Multiple Astrology Systems", desc: "Vedic, numerology, palmistry, and more — all in one place." },
  { icon: "🔒", title: "100% Private & Secure", desc: "Your conversations and data remain completely confidential." },
];

const STATS = [
  { value: "10K+", label: "Happy Users" },
  { value: "500+", label: "Expert Astrologers" },
  { value: "50K+", label: "Consultations" },
  { value: "4.8★", label: "App Rating" },
];

/* ──────────────── Component ──────────────── */
const AboutUs = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">

      {/* ═══════════ HERO ═══════════ */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <Image src="/abour-hero-bg.svg" alt="About Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        {/* floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `rgba(255,${180 + Math.random() * 75},${60 + Math.random() * 60},${0.3 + Math.random() * 0.5})`,
              }}
              animate={{ y: [-8, -28, -8], opacity: [0.2, 0.9, 0.2], scale: [1, 1.4, 1] }}
              transition={{ duration: 2.5 + Math.random() * 2.5, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        <div className="relative z-10 py-20 sm:py-28 md:py-36 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-amber-300/90 mb-4">
              Discover Our Story
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg"
            style={{ fontFamily: "'EB Garamond', serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            About Us
          </motion.h1>
          <motion.p
            className="mt-4 text-base sm:text-lg text-white/70 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            Your trusted companion for cosmic wisdom, spiritual guidance, and astrological insights.
          </motion.p>

          <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <motion.div
              className="mx-auto w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════ INTRODUCTION ═══════════ */}
      <motion.section
        className="relative py-16 sm:py-24 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-50 opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-50 opacity-50 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10">
          <SectionHeader tag="Who We Are" title="Introduction" subtitle="Your Trusted Online Astrology Consulting App!" />

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Text */}
            <motion.div
              className="flex-1 order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="space-y-5">
                <p className="text-gray-600 text-base sm:text-[17px] leading-[1.85] text-justify">
                  <span className="text-orange-600 font-semibold">Sobhagya</span> is a feature-rich astrology app that connects users with expert astrologers for personalized predictions and guidance. Whether you need insights about love, relationships, career, finances, health, or spiritual growth, this app provides accurate astrological solutions based on <strong className="text-gray-700">Vedic astrology, numerology, and palmistry</strong>.
                </p>
                <p className="text-gray-600 text-base sm:text-[17px] leading-[1.85] text-justify">
                  With <strong className="text-gray-700">live chat, voice, and video consultations</strong>, Sobhagya allows you to get real-time answers from professional astrologers anytime, anywhere. The app also provides daily, weekly, and yearly horoscopes to help you plan your life according to planetary movements and cosmic influences.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
                {[
                  { icon: "🎯", label: "Vedic Astrology" },
                  { icon: "🔮", label: "Live Consultations" },
                  { icon: "📖", label: "Daily Horoscopes" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100/60 rounded-full px-4 py-2 text-sm font-medium text-gray-700">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Zodiac Logo */}
            <motion.div
              className="flex justify-center items-center order-1 lg:order-2 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative group">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-orange-400/20 via-amber-300/10 to-orange-400/20 blur-xl group-hover:blur-2xl transition-all duration-700 opacity-70 group-hover:opacity-100" />
                <div className="absolute -inset-3 rounded-full border border-dashed border-orange-200/40 animate-mandala-spin" />
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden shadow-xl">
                  <Image src="/sobhagya-logo.svg" alt="Sobhagya Logo" width={288} height={288} className="w-full h-full object-contain p-4" priority quality={100} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ KEY FEATURES ═══════════ */}
      <motion.section
        className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-orange-50/30 to-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="section-container">
          <SectionHeader tag="What We Offer" title="Key Features of Sobhagya" subtitle="A comprehensive suite of astrology services designed for every aspect of your life." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {KEY_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-orange-100/40 transition-all duration-500 hover:-translate-y-1 cursor-default overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-[15px] sm:text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-orange-700 transition-colors duration-300">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a00] via-[#2d1400] to-[#1a0a00]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(247,148,29,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,215,0,0.2) 0%, transparent 50%)`,
        }} />
        <div className="relative z-10 section-container py-14 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{
                  fontFamily: "'EB Garamond', serif",
                  background: "linear-gradient(135deg, #F7941D, #FFD700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/60 tracking-wider uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ BRIDGE QUOTE ═══════════ */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="section-container">
          <motion.blockquote
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-4xl text-orange-300 mb-4">&ldquo;</div>
            <p className="text-lg sm:text-xl md:text-[22px] leading-[1.8] text-gray-600 italic" style={{ fontFamily: "'EB Garamond', serif" }}>
              Sobhagya makes astrology accessible to everyone, whether you are a beginner or an enthusiast. The app is designed to help users navigate major life challenges with confidence and cosmic wisdom.
            </p>
            <div className="mt-6 mx-auto w-12 h-[2px] bg-orange-300 rounded-full" />
          </motion.blockquote>
        </div>
      </section>

      {/* ═══════════ WHY CHOOSE US ═══════════ */}
      <motion.section
        className="relative py-16 sm:py-24 bg-gradient-to-b from-[#FFFDF9] to-white overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-orange-100/30 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-orange-100/20 pointer-events-none" />

        <div className="section-container relative z-10">
          <SectionHeader tag="Our Promise" title="Why Choose Sobhagya?" subtitle="We're committed to delivering the most trustworthy and personalised astrological experience." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div
                key={i}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-500 hover:-translate-y-1"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-[15px] sm:text-base mb-1 group-hover:text-orange-700 transition-colors duration-300">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ CTA ═══════════ */}
      <motion.section
        className="relative py-16 sm:py-24 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1400] to-[#0f0700]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-400/20"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ y: [-6, -20, -6], opacity: [0.1, 0.6, 0.1] }}
              transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="relative z-10 section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/80 mb-4">Begin Your Journey</span>
          </motion.div>
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight"
            style={{ fontFamily: "'EB Garamond', serif" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Embrace the Power of Astrology with{" "}
            <span style={{
              background: "linear-gradient(135deg, #F7941D, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Sobhagya</span>
          </motion.h2>
          <motion.p
            className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            From love and relationships to career growth and financial stability — expert astrology services tailored to your needs. Your gateway to a brighter future!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link href="/call-with-astrologer" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 text-sm sm:text-base">
              <span>Talk to an Astrologer</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium px-8 py-3.5 rounded-full transition-all duration-300 text-sm sm:text-base hover:bg-white/5">
              Explore Services
            </Link>
          </motion.div>
        </div>
      </motion.section>

    </div>
  );
};

export default AboutUs;
