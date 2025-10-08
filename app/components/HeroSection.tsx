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
      href: "/chat",

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
      title: "Sobhagya Shop",
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
          backgroundImage: "url(/bg-image1111.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background zodiac sign */}
        {/* <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
          <Image
            src="/sobhagya-logo.svg"
            alt="Zodiac Sign"
            width={600}
            height={600}
            className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] object-contain"
          />
        </div> */}

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
          <div className="w-full md:w-5/6 text-center md:text-left order-2 md:order-1 mt-8 sm:-mt-24 md:-mt-6">
            <h1 className="font-bold leading-tight mb-2 sm:whitespace-nowrap" style={{
              fontFamily: "EB Garamond",
              fontSize: 'clamp(32px, 8vw, 55px)',
              fontWeight: 700,
              lineHeight: 1.1
            }}>
              <span>{consultationCount}</span>{" "}
              <span>Consultations Done</span>
            </h1>
            <p className="text-sm sm:text-base md:text-2xl font-semibold mb-4 px-2 sm:px-0" style={{
              fontFamily: "EB Garamond"
            }}>
              Your's might be waiting
            </p>
            <Link href="/call-with-astrologer">
              <button className="bg-white text-orange-600 px-4 sm:px-6 py-3 sm:py-4 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-[#F7971D] hover:text-white transition-all duration-300 flex items-center justify-center mx-auto md:mx-0 mt-4 sm:mt-6 w-full sm:w-auto" style={{
                fontFamily: "Poppins",
                fontSize: "clamp(16px, 4vw, 22px)"
              }}>
                <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Get a call now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
              </button>
            </Link>
          </div>

          {/* Mobile: Right: astrologer image first */}
          {/* Desktop: Right: astrologer image - positioned to touch orange background edge */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative order-1 md:order-2 min-h-[300px] sm:min-h-[400px] md:min-h-[450px]">
            <div className="relative">
              {/* Big zodiac sign behind astrologer - lifted up and smaller width */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 z-0 -translate-y-12 sm:-translate-y-16 -left-10 sm:-left-20">
                <Image
                  src="/zodiac-right.png"
                  alt="Background Zodiac"
                  width={300}
                  height={300}
                  className="w-[180px] h-[220px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] object-contain"
                />
              </div>

              <Image
                src="/astrologer.svg"
                alt="Astrologer"
                width={450}
                height={400}
                className="object-contain max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[650px] translate-y-[52px] sm:translate-y-[10px] md:translate-y-[20px] relative z-10"
                priority
              />
              {/* Two zodiac signs around astrologer image */}
              <motion.div
                className="absolute right-3 sm:right-5 md:right-[-50px] top-1/2 -translate-y-1/2  z-20"
                animate={{ rotate: [0, -12, 12, 0], y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Image src="/Group (1) 4.png" alt="Right Middle Zodiac" width={80} height={80} className="sm:w-[100px] sm:h-[100px]" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Orange background section for cards */}
      <div className="relative">
        {/* Navigation cards: positioned half on orange background */}
        <div className="relative z-20 -mt-1 sm:-mt-28 md:-mt-9 lg:-mt-16 mb-12">
          <div className="w-[100vw] mx-auto px-4 sm:px-6 md:px-8">
            {/* Mobile: Horizontal small buttons */}
            <div className="flex flex-row justify-center gap-2 sm:hidden mb-6 px-2">
              {navigationCards.map((card) => (
                <Link key={card.id} href={card.href} target={card.isExternal ? "_blank" : undefined}>
                  <div
                    className="rounded-lg px-4 py-4 flex items-center justify-center shadow-lg transition-all duration-300 bg-white text-black hover:scale-105 group flex-1 max-w-[140px]"
                  >
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={24}
                      height={24}
                      className="mr-2 block transition-all duration-300"
                      style={{ display: 'block' }}
                    />
                    <span className="text-sm font-normal leading-tight" style={{
                      fontFamily:"Poppins"
                    }}>
                      {card.id === "chat" ? "Chat" : 
                       card.id === "talk" ? "Call" : 
                       card.id === "shop" ? "Shop" : card.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: Original card layout */}
            <div className="hidden sm:grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
              {navigationCards.map((card) => (
                <Link key={card.id} href={card.href} target={card.isExternal ? "_blank" : undefined}>
                  <div
                    className="rounded-xl p-6 sm:p-8 py-8 sm:py-10 flex flex-col items-center text-center shadow-xl transition-all duration-300 group bg-white text-black hover:scale-105"
                  >
                    <div className="flex items-center justify-center">
                      <Image
                        src={card.icon}
                        alt={card.title}
                        width={48}
                        height={48}
                        className="sm:w-[56px] sm:h-[56px] block transition-all duration-300"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <h3 className="font-medium mt-2 sm:mt-3 text-base sm:text-lg" style={{ fontFamily: "Poppins" }}>{card.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* NEW: Live Session Section - Enhanced for Mobile - COMMENTED OUT FOR NOW */}
      {/*
      <section className="bg-white pt-6 sm:pt-12 md:pt-28 pb-12 sm:pb-16 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-xl sm:text-3xl md:text-5xl lg:text-6xl text-center font-bold text-[#745802] mb-2 sm:mb-3 md:mb-4"
            style={{ fontFamily: "EB Garamond" }}
          >
            Live Session
          </h2>
          <p
            className="text-center text-[#745802] mb-6 sm:mb-8 md:mb-12 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto px-2"
            style={{ fontFamily: "Poppins" }}
          >
            Live astrology session for real-time insights and guidance on your life's path!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 max-w-7xl mx-auto">

            {[
              {
                img: "/image (11).png",
                alt: "Pt. Shashtri Ji",
                name: "Pt. Shashtri Ji",
                subtitle: "Marriage problems expert"
              },
              {
                img: "live-astrology-insights.svg",
                alt: "Live Astrological Insights",
                name: "Live Astrological Insights:",
                subtitle: "Get clarity on love, career & more"
              },
              {
                img: "/rama-krishna.svg",
                alt: "Pt. Rama Krishna",
                name: "Pt. Rama Krishna",
                subtitle: "Today horoscope"
              }
            ].map(({ img, alt, name, subtitle }) => (
              <div
                key={name}
                className="w-full rounded-xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-100 hover:border-orange-200"
              >
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-[#F51010] px-3 sm:px-4 py-1.5 sm:py-2 text-base flex items-center z-10">
                  <span className="h-2 w-2 sm:h-3 sm:w-3 bg-[#F51010] rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                  <span
                    style={{
                      fontFamily: "Poppins",
                      color: "#F51010",
                      fontSize: "clamp(12px, 3vw, 14px)",
                      fontWeight: "bold"
                    }}
                  >
                    Live
                  </span>
                </div>

                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50">
                  <Image
                    src={img}
                    alt={alt}
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-b from-transparent via-black/60 to-black/90 absolute bottom-0 w-full">
                  <h3
                    className="text-white font-bold text-base sm:text-lg lg:text-xl mb-1 drop-shadow-lg"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {name}
                  </h3>
                  <p
                    className="text-white/90 font-medium text-xs sm:text-sm lg:text-base drop-shadow-md"
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
      */}

    </div>
  );
};

export default HeroSection;