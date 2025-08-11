"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, MessageCircle, ShoppingBag, ArrowRight, Users, Clock, Shield } from "lucide-react";
import { PhoneIcon } from '@heroicons/react/24/solid';

const HeroSection: React.FC = () => {
  // State for active navigation
  const [activeNav, setActiveNav] = useState("chat");
  const [mounted, setMounted] = useState(false);
  const [consultationCount] = useState(10023);
  const [particlePositions, setParticlePositions] = useState<{ left: number, top: number, delay: number, duration: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random positions for floating particles only on client
    setParticlePositions(
      Array.from({ length: 20 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      }))
    );
  }, []);

  // Handle navigation click
  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
  };

  const navigationCards = [
    {
      id: "chat",
      title: "Chat with Astrologer",
      icon: "/chat2.png",
      iconComponent: MessageCircle,
      href: "/calls/call1",

      color: "from-blue-500 to-blue-600"
    },
    {
      id: "talk",
      title: "Talk to Astrologer",
      icon: "/contact2.png",
      iconComponent: PhoneIcon,
      href: "/call-with-astrologer",

      color: "from-green-500 to-green-600"
    },
    {
      id: "shop",
      title: "Astromall Shop",
      icon: "/astromall.png",
      iconComponent: ShoppingBag,
      href: "https://store.sobhagya.in",

      color: "from-orange-500 to-orange-600",
      isExternal: true,
      featured: false
    }
  ];

  return (
    <div className="flex flex-col w-full relative overflow-hidden">
      {/* Enhanced Hero Section */}
      <motion.section
        className="text-white relative w-full flex flex-col justify-start pt-0 md:pt-0 pb-4 sm:pb-6"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background zodiac sign */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
          <Image
            src="/sobhagya_logo.avif"
            alt="Zodiac Sign"
            width={600}
            height={600}
            className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] object-contain"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-0" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
              animate={{ y: [-20, -100, -20], opacity: [0, 1, 0] }}
              transition={{
                duration: pos.duration,
                repeat: Infinity,
                delay: pos.delay,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-8 relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-0 md:gap-8">

          {/* Mobile: Astrologer image first, then text */}
          {/* Desktop: Left: text */}
          <div className="w-full md:w-5/6 text-center md:text-left order-2 md:order-1 -mt-12 md:-mt-6">
            <h1 className="font-bold leading-tight mb-2 whitespace-nowrap" style={{
              fontFamily: "EB Garamond",
              fontSize: '55px',
              fontWeight: 700,
              lineHeight: 1.1
            }}>
              <span>{consultationCount}</span>{" "}
              <span>Consultations Done</span>
            </h1>
            <p className="text-sm sm:text-base md:text-2xl font-semibold mb-4" style={{
              fontFamily: "EB Garamond"
            }}>
              Your's might be waiting
            </p>
            <Link href="/call-with-astrologer">
              <button className="bg-white text-orange-600 px-5 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-[#F7971D] hover:text-white transition-all duration-300 flex items-center justify-center mx-auto md:mx-0" style={{
                fontFamily: "Poppins"
              }}>
                <PhoneIcon className="w-5 h-5 mr-2" />
                Get a call now
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </Link>
          </div>

          {/* Mobile: Right: astrologer image first */}
          {/* Desktop: Right: astrologer image - positioned to touch orange background edge */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative order-1 md:order-2">
            <div className="relative">
              {/* Big zodiac sign behind astrologer - full visible */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 z-0">
                <Image
                  src="/zodiac-right.png"
                  alt="Background Zodiac"
                  width={300}
                  height={300}
                  className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[470px] md:h-[470px] object-contain"
                />
              </div>

              <Image
                src="/astrologer.png"
                alt="Astrologer"
                width={600}
                height={600}
                className="object-contain max-w-[280px] sm:max-w-[400px] md:max-w-[650px] translate-y-[10px] sm:translate-y-[20px] relative z-10"
                priority
              />
              {/* Three zodiac signs around astrologer image */}
              <motion.div
                className="absolute left-3 bottom-8 md:bottom-20 md:left-[-50px] z-20"
                animate={{ rotate: [0, 10, -10, 0], y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image src="/Group (1) 5.png" alt="Bottom Left Zodiac" width={70} height={70} />
              </motion.div>
              <motion.div
                className="absolute right-5 md:right-[-50px] top-1/2 -translate-y-1/2  z-20"
                animate={{ rotate: [0, -12, 12, 0], y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Image src="/Group (1) 4.png" alt="Right Middle Zodiac" width={100} height={100} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Orange background section for cards */}
      <div className="relative">
        {/* Navigation cards: positioned half on orange background */}
        <div className="relative z-20 -mt-1 sm:-mt-28 md:-mt-9 lg:-mt-16">
          <div className="w-[100vw] mx-auto px-4 sm:px-6 md:px-8">
            {/* Mobile: Horizontal small buttons */}
            <div className="flex flex-row justify-center gap-2 sm:hidden mb-6">
              {navigationCards.map((card) => (
                <Link key={card.id} href={card.href} target={card.isExternal ? "_blank" : undefined}>
                  <div
                    className="rounded-lg px-3 py-2.5 flex items-center text-center shadow-md transition-all duration-300 hover:shadow-lg bg-white text-gray-800 hover:bg-[#F7971D] hover:text-white group"
                  >
                    <div className="mr-1.5 flex items-center justify-center">
                      <Image
                        src={card.icon}
                        alt={card.title}
                        width={20}
                        height={20}
                        className="block transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <span className="text-xs font-medium">{card.title}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: Original card layout */}
            <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {navigationCards.map((card) => (
                <Link key={card.id} href={card.href} target={card.isExternal ? "_blank" : undefined}>
                  <div
                    className="rounded-xl p-6 py-8 flex flex-col items-center text-center shadow-md transition-all duration-300 hover:shadow-lg group bg-white text-gray-800 hover:bg-[#F7971D] hover:text-white"
                  >
                    <div className="flex items-center justify-center">
                      <Image
                        src={card.icon}
                        alt={card.title}
                        width={48}
                        height={48}
                        className="block transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <h3 className="font-semibold mt-2">{card.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* NEW: Live Session Section - Enhanced for Mobile */}
      <section className="bg-white pt-8 sm:pt-36 md:pt-28 pb-16 sm:pb-20 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold text-[#745802] mb-3 sm:mb-4"
            style={{ fontFamily: "EB Garamond" }}
          >
            Live Session
          </h2>
          <p
            className="text-center text-[#745802] mb-8 sm:mb-12 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto"
            style={{ fontFamily: "Poppins" }}
          >
            Live astrology session for real-time insights and guidance on your life's path!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 lg:gap-8 xl:gap-12 max-w-7xl mx-auto">

            {/* Card Component - Reusable */}
            {[
              {
                img: "/image (11).png",
                alt: "Pt. Shashtri Ji",
                name: "Pt. Shashtri Ji",
                subtitle: "Marriage problems expert"
              },
              {
                img: "/image (12).png",
                alt: "Live Astrological Insights",
                name: "Live Astrological Insights:",
                subtitle: "Get clarity on love, career & more"
              },
              {
                img: "/image (13).png",
                alt: "Pt. Rama Krishna",
                name: "Pt. Rama Krishna",
                subtitle: "Today horoscope"
              }
            ].map(({ img, alt, name, subtitle }) => (
              <div
                key={name}
                className="w-full rounded-xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Live Badge */}
                <div className="absolute top-4 left-4 text-[#F51010] px-4 py-2 text-base flex items-center z-10">
                  <span className="h-3 w-3 bg-[#F51010] rounded-full mr-2 animate-pulse"></span>
                  <span
                    style={{
                      fontFamily: "Poppins",
                      color: "#F51010",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                  >
                    Live
                  </span>
                </div>

                {/* Image */}
                <img
                  src={img}
                  alt={alt}
                  className="w-full h-56 sm:h-64 lg:h-96 xl:h-[500px] object-cover object-center"
                />

                {/* Overlay */}
                <div className="p-4 lg:p-6 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                  <h3
                    className="text-white font-bold text-lg sm:text-lg lg:text-xl mb-1"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {name}
                  </h3>
                  <p
                    className="text-white font-medium text-sm sm:text-sm lg:text-base"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HeroSection;