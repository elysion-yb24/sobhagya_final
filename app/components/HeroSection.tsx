"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Phone, MessageCircle, ShoppingBag, ArrowRight, Users, Clock, Shield } from "lucide-react";

const HeroSection: React.FC = () => {
  // State for active navigation
  const [activeNav, setActiveNav] = useState("chat");
  const [mounted, setMounted] = useState(false);
  const [consultationCount, setConsultationCount] = useState(10023);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Simulate loading and animate consultation count
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Animate consultation count
    const interval = setInterval(() => {
      setConsultationCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => {
      clearTimeout(timer);
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
      iconComponent: Phone,
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

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading your cosmic journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative overflow-hidden">
      {/* Enhanced Hero Section */}
      <motion.section
        className="text-white relative w-full flex items-center px-4 sm:px-8 md:px-12 min-h-screen"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-0" />
        
        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Enhanced Navigation Cards */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2 mx-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {navigationCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                    card.featured 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105' 
                      : 'bg-white hover:bg-gray-50 text-gray-800 hover:scale-105'
                  }`}
                  onClick={() => handleNavClick(card.id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Link href={card.href} target={card.isExternal ? "_blank" : undefined}>
                    <div className="p-6 text-center h-full flex flex-col justify-between min-h-[140px]">
                      {/* Icon with enhanced styling */}
                      <div className="flex justify-center mb-3">
                        <div className={`relative p-3 rounded-full ${
                          card.featured ? 'bg-white/20' : ''
                        } transition-all duration-300 group-hover:scale-110`}>
                          <Image
                            src={card.icon}
                            alt={card.title}
                            width={40}
                            height={40}
                            className="relative z-10"
                          />
                          {/* Hover glow effect */}
                          <div className={`absolute inset-0 rounded-full ${
                            card.featured ? 'bg-white/0 group-hover:bg-white/30' : 'bg-orange-500/0 group-hover:bg-orange-500/20'
                          } transition-all duration-300`} />
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div>
                        <h3 className={`font-semibold text-sm mb-1 ${
                          card.featured ? 'text-white' : 'text-gray-800'
                        }`}>
                          {card.title}
                        </h3>
                        <p className={`text-xs ${
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

                      {/* Featured badge
                      {card.featured && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                            Popular
                          </div>
                        </div>
                      )} */}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="container mx-auto flex flex-col-reverse sm:flex-col md:flex-row items-center justify-between w-full relative z-10">
          {/* Left Side - Enhanced Text Section */}
          <motion.div 
            className="text-center md:text-left md:w-1/2 max-w-full px-4 mt-6 md:mt-0"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
          {/* Stats badge */}
            {/* <motion.div 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {/* <span className="text-sm font-medium">Trusted by 50,000+ users</span> */}
            {/* </motion.div> */}

            {/* Enhanced consultation count */}
            <motion.h1
              className="text-xl sm:text-2xl md:text-2xl lg:text-4xl font-bold mb-4 sm:mb-4"
              style={{
                fontFamily: "EB Garamond",
                fontWeight: "700",
                lineHeight: "1.2",
                letterSpacing: "0%",
                fontSize: "clamp(1.5rem, 4vw, 3rem)",
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
              className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-6 sm:mb-6"
              style={{
                fontFamily: "Poppins",
                fontWeight: "700",
                maxWidth: "320px",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your's might be waiting
            </motion.p>

            {/* Enhanced CTA button */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/call-with-astrologer">
                <motion.button
                  className="group relative bg-white text-orange-600 px-8 py-4 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-10 sm:mb-6 md:mb-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: "100%",
                    maxWidth: "320px",
                    height: "66px",
                    fontFamily: "Poppins",
                    fontWeight: "500",
                    fontSize: "24px",
                    lineHeight: "34px",
                    letterSpacing: "0%",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <Image
                    src="/Group 13380.png"
                    alt="account"
                    className="w-8 h-8 mr-4 relative z-10 group-hover:scale-110 transition-transform duration-300"
                    width={32}
                    height={32}
                  />
                  <span className="relative z-10 group-hover:text-orange-700 transition-colors duration-300">
                    Get a call now
                  </span>
                  <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust indicators
            <motion.div 
              className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Expert Astrologers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>24/7 Available</span>
              </div>
            </motion.div> */}
          </motion.div>

          {/* Right Side - Enhanced Astrologer Image */}
          <motion.div 
            className="relative w-full md:w-1/2 flex justify-center self-end"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Enhanced Background Zodiac Circle */}
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 hidden md:block"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <Image
                src="/Group (1) 3.png"
                alt="Zodiac Background"
                width={400}
                height={300}
                className="opacity-80"
                priority
              />
            </motion.div>

            {/* Enhanced Astrologer Image */}
            <motion.div
              className="relative z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/astrologer.png"
                alt="Astrologer"
                width={670}
                height={400}
                className="object-contain h-auto filter drop-shadow-2xl"
                priority
              />
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-full blur-3xl -z-10" />
            </motion.div>

            {/* Enhanced Floating Zodiac Signs */}
            <motion.div
              className="absolute bottom-[60px] left-[10px] opacity-80"
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
                className="filter drop-shadow-lg"
              />
            </motion.div>

            <motion.div
              className="absolute bottom-[60px] right-[10px] opacity-80"
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
                className="filter drop-shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* NEW: Live Session Section */}

      <section className="bg-white py-32">
        <div className="container mx-auto px-6">
          <h2
            className="text-5xl text-center font-bold text-[#745802] mb-2"
            style={{ fontFamily: "EB Garamond" }}
          >
            Live Session
          </h2>
          <p
            className="text-center text-[#745802] mb-8"
            style={{ fontFamily: "Poppins", fontSize: "15px" }}
          >
            Live astrology session for real-time insights and guidance on your
            life's path!
          </p>

          <div className="flex flex-wrap justify-center gap-20">
            {/* First Astrologer Card - Pt. Shashtri Ji */}
            <div className="w-full sm:w-64 rounded-lg overflow-hidden relative cursor-pointer shadow-md">
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <span className="h-2 w-2 bg-white rounded-lg mr-1 animate-pulse"></span>
                Live
              </div>
              <img
                src="/image (11).png"
                alt="Pt. Shashtri Ji"
                className="w-full h-45 object-contain"
              />
              <div className="p-3 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                <h3
                  className="text-white font-semibold"
                  style={{ fontFamily: "Poppins" }}
                >
                  Pt. Shashtri Ji
                </h3>
                <p
                  className="text-white font-light"
                  style={{ fontFamily: "Poppins" }}
                >
                  Marriage problems expert
                </p>
              </div>
            </div>

            {/* Zodiac Card - Live Astrological Insights */}
            <div className="w-full sm:w-64 rounded-lg overflow-hidden relative cursor-pointer shadow-md">
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></span>
                Live
              </div>
              <img
                src="/image (12).png"
                alt="Live Astrological Insights"
                className="w-full h-full object-cover"
              />
              <div className="p-3 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                <h3
                  className="text-white font-semibold"
                  style={{ fontFamily: "Poppins" }}
                >
                  Live Astrological Insights:
                </h3>
                <p
                  className="text-white text-sm"
                  style={{ fontFamily: "Poppins" }}
                >
                  Get clarity on love, career & more
                </p>
              </div>
            </div>

            {/* Third Card - Pt. Rama Krishna */}
            <div className="w-full sm:w-64 rounded-lg overflow-hidden relative cursor-pointer shadow-md">
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></span>
                Live
              </div>
              <img
                src="/image (13).png"
                alt="Pt. Rama Krishna"
                className="w-full h-full object-cover"
              />
              <div className="p-3 bg-gradient-to-b from-transparent to-black absolute bottom-0 w-full">
                <h3
                  className="text-white font-semibold"
                  style={{ fontFamily: "Poppins" }}
                >
                  Pt. Rama Krishna
                </h3>
                <p
                  className="text-white text-sm"
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
