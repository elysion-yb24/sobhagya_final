"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AboutUs = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header Section with Animations */}
      <motion.div 
        className="relative py-8 sm:py-12 md:py-16 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src="/about2.png" 
            alt="About Background" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight" 
            style={{ fontFamily: 'EB Garamond' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            About Us
          </motion.h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Introduction Section */}
        <motion.div 
          className="mb-12 sm:mb-16 mx-auto flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-2 mx-auto text-center" 
            style={{ fontFamily: 'EB Garamond' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Introduction
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-[#8B7355] mb-6 sm:mb-8 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Your Trusted Online Astrology Consulting App!
          </motion.p>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center w-full max-w-6xl mx-auto">
            {/* Left Content */}
            <motion.div 
              className="flex-1 order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-[#373737] text-base sm:text-lg leading-relaxed text-justify">
                Sobhagya is a feature-rich astrology app that connects users with expert astrologers for personalized predictions and guidance. Whether you need insights about love, relationships, career, finances, health, or spiritual growth, this app provides accurate astrological solutions based on Vedic astrology, numerology, and palmistry.
              </p>
              <p className="text-[#373737] text-base sm:text-lg leading-relaxed mt-4 text-justify">
                With live chat, voice, video-consultations, Sobhagya allows you to get real-time answers from professional astrologers anytime, anywhere through live chat, voice, and video consultations. The app also provides daily, weekly, and yearly horoscopes to help you plan your life according to planetary movements and cosmic influences.
              </p>
            </motion.div>
            
            {/* Right Content - Zodiac Wheel */}
            <motion.div 
              className="flex justify-center items-center order-1 lg:order-2 flex-shrink-0 mx-auto lg:mx-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
                {/* Using the zodiac wheel image that appears to be in the screenshot */}
                <img 
                  src="/sobhagya-logo.png" 
                  alt="Sobhagya Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to sobhagya logo if zodiac wheel not found
                    (e.target as HTMLImageElement).src = "/sobhagya-logo.png";
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Key Features Section */}
        <motion.div 
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <motion.h2 
            className="text-xl sm:text-2xl font-bold text-[#745802] mb-6 sm:mb-8 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            Key Features of Sobhagya:
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column */}
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {[
                "Kundli (Birth Chart) Analysis",
                "Career & Business Guidance", 
                "Health & Wellness Astrology",
                "Astrological Remedies",
                "Palmistry Readings"
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Right Column */}
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {[
                "Love & Marriage Compatibility",
                "Financial Astrology",
                "Numerology & Tarot Readings",
                "Auspicious Muhurat Selection",
                "Vastu Shastra Consultation"
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: -5 }}
                >
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Intermediate Text */}
        <motion.div 
          className="mb-12 sm:mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto px-4">
            Sobhagya makes astrology accessible to everyone, whether you are a beginner or an enthusiast. The app is designed to help users navigate major life challenges with confidence and cosmic wisdom.
          </p>
        </motion.div>

        {/* Why Choose Section */}
        <motion.div 
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
        >
          <motion.h2 
            className="text-xl sm:text-2xl font-bold text-[#745802] mb-6 sm:mb-8 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.1 }}
          >
            Why Choose Sobhagya?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column */}
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              {[
                "Trusted & Verified Astrologers",
                "User-Friendly Interface",
                "24/7 Availability"
              ].map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 2.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Right Column */}
            <motion.div 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              {[
                "Instant & Accurate Guidance",
                "Multiple Astrology Systems"
              ].map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 2.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: -5 }}
                >
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Concluding Paragraph */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.6 }}
        >
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto px-4">
            From love and relationships to career growth and financial stability, Sobhagya provides expert astrology services tailored to your needs. Whether you are seeking solutions to life's obstacles or wish to enhance your spiritual journey, this app serves as your personal astrology guide. Embrace the power of astrology with Sobhagya - Your gateway to a brighter future!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
