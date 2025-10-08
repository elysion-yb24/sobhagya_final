"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Users, Clock, Shield, Sparkles, Heart, Globe, Award, PhoneIcon, ArrowRight } from "lucide-react";

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
      {/* Enhanced Background Image for Heading with Animations */}
      <motion.div 
        className="relative bg-cover bg-center py-16 sm:py-20 overflow-hidden"
        style={{ backgroundImage: "url('/service.png')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
          <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
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
        
        <motion.h2 
          className="relative text-center text-white text-3xl sm:text-5xl lg:text-6xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            About Us
        </motion.h2>
      </motion.div>

      {/* Our Story Section */}
      <motion.section 
        className="py-20 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-6" style={{ fontFamily: "EB Garamond" }}>
                Our Story
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6" style={{ fontFamily: "Poppins" }}>
                Sobhagya was born from a vision to make ancient astrological wisdom accessible to everyone in the modern world. We believe that everyone deserves personalized guidance to navigate life's challenges and opportunities.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6" style={{ fontFamily: "Poppins" }}>
                Our platform connects you with certified astrologers who combine traditional Vedic knowledge with contemporary insights, providing accurate predictions and practical solutions for love, career, health, and spiritual growth.
              </p>
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="flex items-center space-x-2 text-[#F7971D]"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold" style={{ fontFamily: "Poppins" }}>50,000+ Happy Clients</span>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative w-full h-80 rounded-2xl overflow-hidden">
                <Image 
                  src="/sobhagya-logo.svg" 
                  alt="Sobhagya Logo" 
                  width={400} 
                  height={320} 
                  className="w-full h-full object-contain p-8" 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* What We Offer Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-orange-50 to-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-4" style={{ fontFamily: "EB Garamond" }}>
              What We Offer
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "Poppins" }}>
              Comprehensive astrology services designed to guide you through every aspect of life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "/Birth Chart Analysis.svg",
                title: "Birth Chart Analysis",
                description: "Detailed Kundli reading with planetary positions, doshas, and remedies",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: "/Love & Compatibility.svg",
                title: "Love & Compatibility",
                description: "Relationship guidance, marriage compatibility, and love predictions",
                color: "from-pink-400 to-rose-500"
              },
              {
                icon: "/Carrer Guidance.svg",
                title: "Career Guidance",
                description: "Professional success insights, business timing, and career path analysis",
                color: "from-blue-400 to-purple-500"
              },
              {
                icon: "/Health and wellness-1.svg",
                title: "Health & Wellness",
                description: "Health predictions, preventive measures, and wellness guidance",
                color: "from-green-400 to-teal-500"
              },
              {
                icon: "/Vastu & Remedies.svg",
                title: "Vastu & Remedies",
                description: "Home harmony, spiritual practices, and powerful astrological remedies",
                color: "from-indigo-400 to-purple-500"
              },
              {
                icon: "/Daily Horoscope.svg",
                title: "Daily Horoscopes",
                description: "Personalized daily, weekly, and yearly predictions for all zodiac signs",
                color: "from-orange-400 to-red-500"
              }
            ].map((service, index) => (
                <motion.div 
                  key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src={service.icon} 
                    alt={service.title} 
                    width={64} 
                    height={64} 
                    className="w-16 h-16" 
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#745802] mb-4" style={{ fontFamily: "Poppins" }}>
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins" }}>
                  {service.description}
                </p>
                </motion.div>
              ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="py-20 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-4" style={{ fontFamily: "EB Garamond" }}>
              Why Choose Sobhagya?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "Poppins" }}>
              Experience the difference with our professional, reliable, and comprehensive astrology services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "/Expert Astrologer.svg",
                title: "Expert Astrologers",
                description: "Certified professionals with years of experience in Vedic astrology",
                stat: "1000+"
              },
              {
                icon: "/7 Availability.svg",
                title: "24/7 Availability",
                description: "Get guidance anytime, anywhere with round-the-clock support",
                stat: "24/7"
              },
              {
                icon: "/Trusted & Secure.svg",
                title: "Trusted & Secure",
                description: "Your privacy and data security are our top priorities",
                stat: "100%"
              },
              {
                icon: "/Accurate Predictions.svg",
                title: "Accurate Predictions",
                description: "Proven track record of accurate predictions and life-changing insights",
                stat: "95%"
              }
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src={feature.icon} 
                    alt={feature.title} 
                    width={80} 
                    height={80} 
                    className="w-20 h-20" 
                  />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#F7971D] mb-2" style={{ fontFamily: "EB Garamond" }}>
                  {feature.stat}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#745802] mb-3" style={{ fontFamily: "Poppins" }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins" }}>
                  {feature.description}
                </p>
                </motion.div>
              ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-orange-50 to-orange-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
            className="bg-white rounded-3xl p-12 border-2 border-orange-200 max-w-4xl mx-auto shadow-lg text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-6" style={{ fontFamily: "Poppins" }}>
              Ready to Discover Your Cosmic Path?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto" style={{ fontFamily: "Poppins" }}>
              Connect with our certified astrologers and unlock the secrets written in your stars. Begin your journey of self-discovery today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button 
                className="bg-[#F7971D] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-orange-600"
                style={{ fontFamily: "Poppins" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Get a Call Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
              
              <motion.button 
                className="bg-white text-[#F7971D] border-2 border-[#F7971D] px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                style={{ fontFamily: "Poppins" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image 
                  src="/Chat with Astrologer.svg" 
                  alt="Chat" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5 mr-2" 
                />
                Chat with Astrologer
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
          </div>
        </motion.div>
      </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;
