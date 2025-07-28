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
  const [consultationCount, setConsultationCount] = useState(10023);
  const [particlePositions, setParticlePositions] = useState<{left: number, top: number, delay: number, duration: number}[]>([]);

  useEffect(() => {
    setMounted(true);
    // Animate consultation count
    const interval = setInterval(() => {
      setConsultationCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    // Generate random positions for floating particles only on client
    setParticlePositions(
      Array.from({ length: 20 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      }))
    );
    return () => {
      clearInterval(interval);
    };
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
      description: "Get instant guidance",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "talk",
      title: "Talk to Astrologer",
      icon: "/contact2.png",
      iconComponent: PhoneIcon,
      href: "/call-with-astrologer",
      description: "Voice consultation",
      color: "from-green-500 to-green-600"
    },
    {
      id: "shop",
      title: "Shop",
      icon: "/shopping mart.png",
      iconComponent: ShoppingBag,
      href: "https://store.sobhagya.in",
      description: "Spiritual products",
      color: "from-orange-500 to-orange-600",
      isExternal: true,
      featured: true
    }
  ];

  return (
    <div className="flex flex-col w-full relative overflow-hidden">
      {/* Enhanced Hero Section */}
      <motion.section
        className="text-white relative w-full flex items-center px-4 sm:px-8 md:px-12  min-h-0 sm:min-h-0 md:min-h-0 pb-2 sm:pb-4 md:pb-4"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Large faded zodiac sign background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
          <Image src="/sobhagya_logo.avif" alt="Zodiac Sign" width={600} height={600} className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] object-contain" />
        </div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-0" />
        
        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: pos.duration,
                repeat: Infinity,
                delay: pos.delay,
              }}
            />
          ))}
        </div>

        {/* Enhanced Navigation Cards - Mobile Optimized */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/4 mx-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: mounted ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {navigationCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                    card.featured 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105' 
                      : 'bg-white hover:bg-gray-50 text-gray-800 hover:scale-105'
                  }`}
                  onClick={() => handleNavClick(card.id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: mounted ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Link href={card.href} target={card.isExternal ? "_blank" : undefined}>
                    <div className="p-5 sm:p-6 text-center h-full flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
                      {/* Icon with enhanced styling */}
                      <div className="flex justify-center mb-2 sm:mb-3">
                        <div className={`relative p-2.5 sm:p-3 rounded-full ${
                          card.featured ? 'bg-white/20' : ''
                        } transition-all duration-300 group-hover:scale-110`}>
                          <Image
                            src={card.icon}
                            alt={card.title}
                            width={36}
                            height={36}
                            className="relative z-10 w-9 h-9 sm:w-10 sm:h-10"
                          />
                          {/* Hover glow effect */}
                          <div className={`absolute inset-0 rounded-full ${
                            card.featured ? 'bg-white/0 group-hover:bg-white/30' : 'bg-orange-500/0 group-hover:bg-orange-500/20'
                          } transition-all duration-300`} />
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div>
                        <h3 className={`font-semibold text-sm sm:text-base mb-1 ${
                          card.featured ? 'text-white' : 'text-gray-800'
                        }`}>
                          {card.title}
                        </h3>
                        <p className={`text-xs sm:text-sm ${
                          card.featured ? 'text-white/80' : 'text-gray-600'
                        }`}>
                          {card.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                        card.featured ? 'text-white' : 'text-orange-500'
                      }`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="container mx-auto flex flex-col-reverse sm:flex-col md:flex-row items-center justify-between w-full relative z-10 px-4 sm:px-6 md:px-8 pb-32 sm:pb-40 md:pb-48">
          {/* Left Side - Enhanced Text Section */}
          <motion.div 
            className="text-center md:text-left md:w-1/2 w-full max-w-full mt-4 sm:mt-6 md:mt-0"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3"
              style={{
                fontFamily: "EB Garamond",
                fontWeight: "700",
                lineHeight: "1.2",
                letterSpacing: "0%",
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={consultationCount}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {consultationCount.toLocaleString()}
                </motion.span>
              </AnimatePresence>
              {" "}Consultations Done
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-3 sm:mb-4"
              style={{
                fontFamily: "Poppins",
                fontWeight: "700",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your's might be waiting
            </motion.p>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center md:justify-start"
            >
              <Link href="/call-with-astrologer">
                <motion.button
                  className="group relative bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: "500",
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <PhoneIcon className="w-6 h-6 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300 text-orange-600" />
                  <span className="relative z-10 group-hover:text-orange-700 transition-colors duration-300">
                    Get a call now
                  </span>
                  <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Astrologer Image */}
          <motion.div 
            className="relative w-full md:w-1/2 flex justify-center md:justify-end items-end"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative z-10 w-full flex justify-center md:justify-end items-end transform translate-y-20 sm:translate-y-24 md:translate-y-28 lg:translate-y-32"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/astrologer.png"
                alt="Astrologer"
                width={670}
                height={400}
                className="object-contain sm:object-cover h-auto w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-3xl filter drop-shadow-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-full blur-3xl -z-10" />
            </motion.div>
            <motion.div
              className="absolute bottom-[40px] left-[10px] opacity-80"
              animate={{ 
                rotate: [0, 15, -15, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/Group (1) 5.png"
                alt="Left Zodiac Sign"
                width={100}
                height={100}
                className="filter drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
              />
            </motion.div>
            <motion.div
              className="absolute bottom-[40px] right-[10px] opacity-80"
              animate={{ 
                rotate: [0, -15, 15, 0],
                y: [0, -8, 0]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Image
                src="/Group (1) 4.png"
                alt="Right Zodiac Sign"
                width={100}
                height={100}
                className="filter drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* NEW: Live Session Section - Enhanced for Desktop */}
      <section className="bg-white pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold text-[#745802] mb-4"
            style={{ fontFamily: "EB Garamond" }}
          >
            Live Session
          </h2>
          <p
            className="text-center text-[#745802] mb-8 sm:mb-12 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto"
            style={{ fontFamily: "Poppins" }}
          >
            Live astrology session for real-time insights and guidance on your
            life's path!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12 max-w-7xl mx-auto">
            {/* First Astrologer Card - Pt. Shashtri Ji */}
            <div className="w-full rounded-xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center z-10">
                <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Live
              </div>
              <img
                src="/image (11).png"
                alt="Pt. Shashtri Ji"
                className="w-full h-64 lg:h-72 xl:h-80 object-cover object-center"
              />
              <div className="p-4 lg:p-6 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                <h3
                  className="text-white font-bold text-lg lg:text-xl mb-1"
                  style={{ fontFamily: "Poppins" }}
                >
                  Pt. Shashtri Ji
                </h3>
                <p
                  className="text-white font-medium text-sm lg:text-base"
                  style={{ fontFamily: "Poppins" }}
                >
                  Marriage problems expert
                </p>
              </div>
            </div>

            {/* Zodiac Card - Live Astrological Insights */}
            <div className="w-full rounded-xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center z-10">
                <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Live
              </div>
              <img
                src="/image (12).png"
                alt="Live Astrological Insights"
                className="w-full h-64 lg:h-72 xl:h-80 object-contain object-center bg-gradient-to-br from-orange-50 to-orange-100"
              />
              <div className="p-4 lg:p-6 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                <h3
                  className="text-white font-bold text-lg lg:text-xl mb-1"
                  style={{ fontFamily: "Poppins" }}
                >
                  Live Astrological Insights:
                </h3>
                <p
                  className="text-white font-medium text-sm lg:text-base"
                  style={{ fontFamily: "Poppins" }}
                >
                  Get clarity on love, career & more
                </p>
              </div>
            </div>

            {/* Third Card - Pt. Rama Krishna */}
            <div className="w-full rounded-xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center z-10">
                <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Live
              </div>
              <img
                src="/image (13).png"
                alt="Pt. Rama Krishna"
                className="w-full h-64 lg:h-72 xl:h-80 object-cover"
              />
              <div className="p-4 lg:p-6 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                <h3
                  className="text-white font-bold text-lg lg:text-xl mb-1"
                  style={{ fontFamily: "Poppins" }}
                >
                  Pt. Rama Krishna
                </h3>
                <p
                  className="text-white font-medium text-sm lg:text-base"
                  style={{ fontFamily: "Poppins" }}
                >
                  Today horoscope
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;