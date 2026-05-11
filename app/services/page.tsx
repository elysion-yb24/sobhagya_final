"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/app/components/ui/SectionHeader";
import FeaturedCard from "./_components/FeaturedCard";
import ServiceCard from "./_components/ServiceCard";
import MarbleCTA from "./_components/MarbleCTA";
import { FiligreeDivider, OmRoundel, Mandala } from "./_components/Ornaments";
import ServicesHero3D from "./_components/ServicesHero3D";
import TrustStats from "./_components/TrustStats";

export default function Services() {
  const services = [
    {
      name: "Birth Journal",
      image: "/Group 13384.png",
      description:
        "Your birth journal is a cosmic blueprint, revealing the celestial influences that shape your destiny.",
      link: "/call-with-astrologer",
    },
    {
      name: "Vastu Shastra",
      image: "/Group 13383.png",
      description:
        "Vastu harmonizes cosmic energies with your surroundings, creating a balanced environment.",
      link: "/call-with-astrologer",
    },
    {
      name: "Face Reading",
      image: "/Face Reading.svg",
      description:
        "Your face is a mirror of destiny, revealing secrets about your personality and future.",
      link: "/call-with-astrologer",
    },
    {
      name: "Lal Kitab",
      image: "/Group 13388.png",
      description:
        "Powerful remedies and astrological solutions for harmony and prosperity.",
      link: "/call-with-astrologer",
    },
    {
      name: "Crystal Ball",
      image: "/Group 13385.png",
      description:
        "The crystal ball reveals hidden truths, offering glimpses into past, present, and future.",
      link: "/call-with-astrologer",
    },
    {
      name: "Kundli Dosh",
      image: "/Group 13386.png",
      description:
        "Identifying planetary imbalances in your birth chart and providing remedies.",
      link: "/call-with-astrologer",
    },
    {
      name: "Matrimony",
      image: "/Gun Milan.svg",
      description:
        "Astrology insights for a destined union, ensuring harmony, compatibility, and lifelong happiness.",
      link: "/call-with-astrologer",
    },
    {
      name: "Palm Reading",
      image: "/Group 13387.png",
      description:
        "Decoding the life moments in your hands, guiding you towards true potential.",
      link: "/call-with-astrologer",
    },
    {
      name: "Name Analysis",
      image: "/Group 13396.png",
      description:
        "Your name carries hidden energies that influence your destiny.",
      link: "/call-with-astrologer",
    },
    {
      name: "Festivals",
      image: "/Group 13395.png",
      description:
        "Understanding celestial influences in festivals to align with cosmic energies.",
      link: "/call-with-astrologer",
    },
    {
      name: "Card Reading",
      image: "/Group 13394.png",
      description:
        "Unlocking the mysteries of fate through Card interpretations.",
      link: "/call-with-astrologer",
    },
    {
      name: "Year Analysis",
      image: "/Group 13393.png",
      description:
        "Astrological insights into major life themes and challenges for the year ahead.",
      link: "/call-with-astrologer",
    },
  ];

  return (
    <section className="bg-[#FFFDF9] w-full min-h-screen">
      {/* ===================== HERO ===================== */}
      <div className="relative w-full overflow-hidden">
        {/* Deep night-sky backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, #2a1304 0%, #150802 60%, #080301 100%)",
          }}
        />

        {/* Faint giant mandala behind everything */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Mandala
            className="text-amber-400 animate-rotate-slow"
            size={900}
            opacity={0.05}
          />
        </div>

        {/* Top gold trim */}
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(247,148,29,0.5), rgba(255,213,138,0.7), rgba(247,148,29,0.5), transparent)",
          }}
        />

        <div className="relative z-10 section-container py-6 sm:py-10 md:py-12 lg:py-14">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 md:gap-8 lg:gap-10 items-center">
            {/* ----- LEFT: title block ----- */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="flex justify-center lg:justify-start mb-4">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,212,140,0.16), rgba(247,148,29,0.16))",
                    border: "1px solid rgba(255,212,140,0.4)",
                    color: "#FFE7B5",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <span className="text-amber-300">✦</span>
                  Astrology Help
                  <span className="text-amber-300">✦</span>
                </motion.span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="block text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] font-bold tracking-tight leading-[1.05]"
                style={{
                  fontFamily: "'EB Garamond', serif",
                }}
              >
                <span className="relative inline-block">
                  <span
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 45%, #F7B23A 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "0 0 60px rgba(247,148,29,0.25)",
                    }}
                  >
                    Our Services
                  </span>
                  {/* shimmer sweep */}
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    initial={{ x: "-120%" }}
                    animate={{ x: "120%" }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                    style={{
                      background:
                        "linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                      mixBlendMode: "overlay",
                    }}
                  />
                </span>
              </motion.h1>

              {/* Om filigree divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="mt-5 mx-auto lg:mx-0 origin-center lg:origin-left text-amber-300/80 w-full max-w-[240px]"
              >
                <FiligreeDivider width="100%">
                  <OmRoundel size={32} />
                </FiligreeDivider>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-5 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed"
                style={{
                  fontFamily: "Poppins",
                  color: "rgba(255,240,210,0.82)",
                }}
              >
                Get clear answers from trusted astrologers. Birth chart, marriage match, Vastu and more — to help you take the right step.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <a
                  href="/call-with-astrologer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #F7941D 0%, #E8850B 100%)",
                    boxShadow:
                      "0 14px 28px -10px rgba(247,148,29,0.55), inset 0 1px 0 rgba(255,255,255,0.3)",
                    fontFamily: "Poppins",
                  }}
                >
                  Talk to an Astrologer
                </a>
                <a
                  href="#offerings"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm"
                  style={{
                    color: "#FFE7B5",
                    border: "1.5px solid rgba(255,213,138,0.55)",
                    background: "rgba(255,213,138,0.06)",
                    fontFamily: "Poppins",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  See All Services
                </a>
              </motion.div>
            </div>

            {/* ----- RIGHT: Premium 3D Astrolabe ----- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 lg:order-2 flex items-center justify-center w-full"
            >
              <ServicesHero3D />
            </motion.div>
          </div>

          {/* Trust stats strip */}
          <TrustStats />
        </div>

        {/* fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #FFFDF9 95%)",
          }}
        />
      </div>

      {/* ===================== FEATURED ===================== */}
      <div
        id="offerings"
        className="relative section-container py-12 sm:py-14 lg:py-16"
      >
        {/* Cosmic backdrop continuing the hero vibe */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%]"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(247,148,29,0.10), transparent 70%), radial-gradient(40% 40% at 20% 30%, rgba(255,213,138,0.08), transparent 70%)",
          }}
        />
        <SectionHeader
          tag="Direct Consultations"
          title="Featured Offerings"
          subtitle="Begin with our most-loved tools — instant clarity from time-tested traditions."
          className="!mb-9 sm:!mb-11"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 max-w-6xl mx-auto mb-10 sm:mb-12">
          <FeaturedCard
            icon="/Kundli Generator icon.svg"
            title="Free Kundli Generator"
            description="Generate your complete birth chart (Kundli) with planetary positions, doshas, remedies, and detailed analysis."
            buttonText="Generate Kundli"
            href="/free-kundli"
            delay={0.05}
            chapter={1}
          />
          <FeaturedCard
            icon="/daily-horoscope-.svg"
            title="Daily Horoscope"
            description="Get personalized daily, weekly, monthly and yearly horoscopes based on your zodiac sign with cosmic guidance."
            buttonText="Read Horoscope"
            href="/services/horoscope"
            delay={0.15}
            chapter={2}
          />
          <FeaturedCard
            icon="/Gun Milan (1).svg"
            title="Gun Milan"
            description="Traditional Vedic astrology compatibility analysis for marriage. Calculate 36-point Gun Milan score with detailed insights."
            buttonText="Calculate Now"
            href="/services/gun-milan"
            delay={0.25}
            chapter={3}
          />
        </div>

        {/* ===================== EXPLORE MORE ===================== */}
        <SectionHeader
          tag="Specialized Services"
          title="Explore More Services"
          subtitle="A complete spectrum of Vedic and spiritual services for every life question."
          className="!mb-9 sm:!mb-11"
        />

        <div className="relative max-w-6xl mx-auto mb-10 sm:mb-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 inset-y-0 -z-0 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 40% at 30% 30%, rgba(255,210,140,0.30), transparent 70%), radial-gradient(50% 40% at 70% 70%, rgba(247,148,29,0.20), transparent 70%)",
            }}
          />
          <div className="relative grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xs:gap-3 sm:gap-4 md:gap-5">
            {services.map((service, i) => (
              <ServiceCard key={i} service={service} delay={i * 0.04} index={i} />
            ))}
          </div>
        </div>

        {/* ===================== CTA ===================== */}
        <MarbleCTA />
      </div>
    </section>
  );
}
