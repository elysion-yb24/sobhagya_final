"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/app/components/ui/SectionHeader";

import AboutHero3D from "./_components/AboutHero3D";
import IntroYantra from "./_components/IntroYantra";
import TiltCard from "./_components/TiltCard";
import StatsConstellation from "./_components/StatsConstellation";
import MandalaQuote from "./_components/MandalaQuote";
import AuroraCTA from "./_components/AuroraCTA";
import ZodiacIcon, { ZodiacName } from "./_components/ZodiacIcon";

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

const INTRO_CHIPS = [
  { icon: "🎯", label: "Vedic Astrology" },
  { icon: "🔮", label: "Live Consultations" },
  { icon: "📖", label: "Daily Horoscopes" },
];

/* ──────────────── Page ──────────────── */
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* ═══════════ HERO (R3F Cosmic Scene) ═══════════ */}
      <AboutHero3D />

      {/* ═══════════ INTRODUCTION ═══════════ */}
      <motion.section
        className="relative py-12 sm:py-16 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-50 opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-50 opacity-50 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10">
          <SectionHeader
            tag="Who We Are"
            title="Introduction"
            subtitle="Your Trusted Online Astrology Consulting App!"
          />

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
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
                  <span className="text-orange-600 font-semibold">Sobhagya</span> is a
                  feature-rich astrology app that connects users with expert astrologers
                  for personalized predictions and guidance. Whether you need insights about
                  love, relationships, career, finances, health, or spiritual growth, this
                  app provides accurate astrological solutions based on{" "}
                  <strong className="text-gray-700">
                    Vedic astrology, numerology, and palmistry
                  </strong>
                  .
                </p>
                <p className="text-gray-600 text-base sm:text-[17px] leading-[1.85] text-justify">
                  With{" "}
                  <strong className="text-gray-700">
                    live chat, voice, and video consultations
                  </strong>
                  , Sobhagya allows you to get real-time answers from professional
                  astrologers anytime, anywhere. The app also provides daily, weekly, and
                  yearly horoscopes to help you plan your life according to planetary
                  movements and cosmic influences.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
                {INTRO_CHIPS.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-orange-300/80 cursor-default"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 3D Zodiac Yantra */}
            <motion.div
              className="flex justify-center items-center order-1 lg:order-2 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <IntroYantra />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ KEY FEATURES (3D Tilt Cards) ═══════════ */}
      <motion.section
        className="relative py-12 sm:py-16 bg-gradient-to-b from-white via-orange-50/30 to-white overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        {/* drifting zodiac glyphs background — crisp SVG icons */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          {(
            [
              "Aries", "Leo", "Sagittarius", "Cancer", "Scorpio", "Pisces",
              "Taurus", "Virgo", "Capricorn", "Gemini", "Libra", "Aquarius",
            ] as ZodiacName[]
          ).map((sign, i) => (
            <motion.span
              key={i}
              className="absolute inline-flex"
              style={{
                left: `${(i * 13.7 + 5) % 95}%`,
                top: `${(i * 17.3 + 10) % 90}%`,
                color: "rgba(247,148,29,0.22)",
                filter: "drop-shadow(0 0 8px rgba(247,148,29,0.15))",
              }}
              animate={{ y: [-12, -30, -12], opacity: [0.35, 0.75, 0.35] }}
              transition={{
                duration: 6 + (i % 4),
                repeat: Infinity,
                delay: (i % 5) * 0.6,
                ease: "easeInOut",
              }}
            >
              <ZodiacIcon name={sign} size={38 + (i % 3) * 14} strokeWidth={1.6} />
            </motion.span>
          ))}
        </div>

        <div className="section-container relative z-10">
          <SectionHeader
            tag="What We Offer"
            title="Key Features of Sobhagya"
            subtitle="A comprehensive suite of astrology services designed for every aspect of your life."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {KEY_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard max={9} depth={36} className="h-full">
                  <div
                    className="group relative bg-white rounded-2xl p-6 border border-orange-100/70 shadow-sm hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 cursor-default overflow-hidden h-full"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* top gradient bar */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    {/* icon — lifted in 3D */}
                    <div
                      className="text-3xl mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl"
                      style={{
                        transform: "translateZ(30px)",
                        background:
                          "linear-gradient(135deg, rgba(247,148,29,0.12), rgba(255,213,138,0.06))",
                        boxShadow:
                          "0 6px 20px -8px rgba(247,148,29,0.3), inset 0 1px 0 rgba(255,255,255,0.7)",
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      className="text-[15px] sm:text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-orange-700 transition-colors duration-300"
                      style={{ transform: "translateZ(20px)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm text-gray-500 leading-relaxed"
                      style={{ transform: "translateZ(10px)" }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ STATS BAR (Animated Counters + Constellation) ═══════════ */}
      <StatsConstellation />

      {/* ═══════════ BRIDGE QUOTE (Mandala Reveal) ═══════════ */}
      <MandalaQuote />

      {/* ═══════════ WHY CHOOSE US (3D Tilt + Flip Icon) ═══════════ */}
      <motion.section
        className="relative py-12 sm:py-16 bg-gradient-to-b from-[#FFFDF9] to-white overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        {/* Contra-rotating decorative rings */}
        <motion.div
          aria-hidden
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-orange-100/30 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-orange-100/40 pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-orange-100/25 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

        <div className="section-container relative z-10">
          <SectionHeader
            tag="Our Promise"
            title="Why Choose Sobhagya?"
            subtitle="We're committed to delivering the most trustworthy and personalised astrological experience."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard max={10} depth={40} className="h-full">
                  <div
                    className="group relative bg-white rounded-2xl p-6 border border-orange-100/70 shadow-sm hover:shadow-2xl hover:shadow-orange-200/40 transition-all duration-500 h-full overflow-hidden"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* aurora gradient border on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        padding: 1,
                        background:
                          "conic-gradient(from 0deg, #F7941D, #FFD700, #FFE7B5, #F7941D)",
                        WebkitMask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />

                    <div className="flex items-start gap-4 relative">
                      <motion.div
                        className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-2xl shadow-sm"
                        style={{
                          transform: "translateZ(50px)",
                          boxShadow:
                            "0 8px 22px -10px rgba(247,148,29,0.45), inset 0 1px 0 rgba(255,255,255,0.8)",
                        }}
                        whileHover={{ rotateY: 360 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                      >
                        {item.icon}
                      </motion.div>
                      <div style={{ transform: "translateZ(20px)" }}>
                        <h3 className="font-bold text-gray-800 text-[15px] sm:text-base mb-1 group-hover:text-orange-700 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ CTA (Aurora + Magnetic Button) ═══════════ */}
      <AuroraCTA />
    </div>
  );
}
