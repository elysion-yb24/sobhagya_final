'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Users, Clock, Shield, Zap, Target, PhoneIcon, ArrowRight, CheckCircle, Sparkles, Globe, Heart, Brain, Crown, Shield as ShieldIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const WhyConsult: React.FC = () => {
  const [activeTab, setActiveTab] = useState('benefits');
  
  const cosmicJourney = [
    {
      phase: "Discovery",
      icon: Star,
      title: "Birth Chart Analysis",
      description: "Uncover your cosmic blueprint and understand your unique planetary influences",
      color: "from-yellow-400 to-orange-500",
      step: "01"
    },
    {
      phase: "Understanding", 
      icon: Brain,
      title: "Personality Insights",
      description: "Discover your strengths, weaknesses, and hidden potential through planetary positions",
      color: "from-blue-400 to-purple-500",
      step: "02"
    },
    {
      phase: "Guidance",
      icon: Heart,
      title: "Life Path Direction",
      description: "Navigate life's challenges with celestial wisdom and personalized guidance",
      color: "from-pink-400 to-rose-500",
      step: "03"
    },
    {
      phase: "Transformation",
      icon: Crown,
      title: "Personal Growth",
      description: "Transform your life using powerful astrological remedies and spiritual practices",
      color: "from-emerald-400 to-teal-500",
      step: "04"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      sign: "Libra",
      rating: 5,
      text: "The astrologer helped me understand my career path. Now I'm running my own successful business!",
      avatar: "/astrologer.png"
    },
    {
      name: "Rajesh Kumar",
      sign: "Aries", 
      rating: 5,
      text: "Relationship compatibility analysis saved my marriage. We're happier than ever now.",
      avatar: "/astrologer.png"
    },
    {
      name: "Meera Patel",
      sign: "Cancer",
      rating: 5,
      text: "Found my life purpose through birth chart reading. Everything makes sense now!",
      avatar: "/astrologer.png"
    }
  ];

  const uniqueFeatures = [
    {
      icon: Globe,
      title: "Global Astrology",
      description: "Combining Vedic, Western, and Chinese astrology for comprehensive insights",
      highlight: "Multi-Tradition"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Analysis", 
      description: "Advanced algorithms combined with expert astrologer insights for accuracy",
      highlight: "Tech + Tradition"
    },
    {
      icon: ShieldIcon,
      title: "Privacy First",
      description: "Your birth data is encrypted and never shared with third parties",
      highlight: "100% Secure"
    }
  ];

  return (
    <section className="bg-white w-full">
      {/* Hero Section */}
      <motion.div
        className="relative py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 via-white to-orange-50"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#F7971D] opacity-5 rounded-full"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div 
            className="inline-flex items-center px-6 py-3 bg-[#F7971D] text-white rounded-full text-sm font-medium mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Professional Astrology Services
          </motion.div>
          
          <div className="px-6 sm:px-8">
            <motion.h1 
              className="text-3xl md:text-7xl font-bold text-[#745802] mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ fontFamily: "EB Garamond" }}
            >
              Why Consult our <span className="text-[#F7971D]">Astrologers?</span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-xl text-gray-600 leading-relaxed text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{ fontFamily: "Poppins" }}
            >
              Discover how celestial wisdom can transform your life. <br></br>Get personalized guidance, accurate predictions from certified professionals.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content with Flowing Text and Animations */}
      <div className="container mx-auto px-4">
        {/* Section 1: The Power of Astrology */}
        <motion.div 
          className="max-w-5xl mx-auto mb-20 px-6 sm:px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-6" style={{ fontFamily: "EB Garamond" }}>
                The Power of Astrological Wisdom
              </h2>
              <p className="text-sm sm:text-lg text-gray-600 leading-relaxed mb-6" style={{ fontFamily: "Poppins" }}>
                Astrology is not just about predicting the future—it's about understanding yourself at a deeper level. Your birth chart is a cosmic blueprint that reveals your unique personality, strengths, challenges, and life purpose.
              </p>
              <p className="text-sm sm:text-lg text-gray-600 leading-relaxed mb-6" style={{ fontFamily: "Poppins" }}>
                Through careful analysis of planetary positions, astrologers can provide insights that help you make informed decisions, understand your relationships better, and navigate life's challenges with confidence.
              </p>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative w-full h-80 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[#F7971D] opacity-10 rounded-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <Image 
                  src="/the-power-of-astrological-wisdom.svg" 
                  alt="The Power of Astrological Wisdom" 
                  width={400} 
                  height={320} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Section 2: Benefits with Animated Icons */}
        <motion.div 
          className="max-w-6xl mx-auto mb-20 px-6 sm:px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-4" style={{ fontFamily: "EB Garamond" }}>
              Transform Your Life Through Astrology
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "Poppins" }}>
              Discover how professional astrological guidance can bring clarity, direction, and positive change to every aspect of your life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="flex items-start space-x-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Image src="/relationship-harmony.svg" alt="Relationship Harmony" width={48} height={48} className="w-12 h-12" />
              </motion.div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#745802] mb-3" style={{ fontFamily: "Poppins" }}>
                  Relationship Harmony
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins" }}>
                  Understand compatibility, resolve conflicts, and build stronger bonds. Astrology reveals the dynamics between different personalities and helps you navigate relationships with wisdom and compassion.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start space-x-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Image src="/career-excellence.svg" alt="Career Excellence" width={48} height={48} className="w-12 h-12" />
              </motion.div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#745802] mb-3" style={{ fontFamily: "Poppins" }}>
                  Career Excellence
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins" }}>
                  Discover your natural talents and career path. Astrology helps identify the best timing for career moves, business decisions, and professional development opportunities.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start space-x-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Image src="/Health and wellness.svg" alt="Health & Wellness" width={48} height={48} className="w-12 h-12" />
              </motion.div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#745802] mb-3" style={{ fontFamily: "Poppins" }}>
                  Health & Wellness
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins" }}>
                  Understand how planetary influences affect your well-being. Receive guidance on preventive health measures and lifestyle choices that align with your cosmic energy.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start space-x-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Image src="/effective-remedies.svg" alt="Effective Remedies" width={48} height={48} className="w-12 h-12" />
              </motion.div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#745802] mb-3" style={{ fontFamily: "Poppins" }}>
                  Effective Remedies
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins" }}>
                  Receive personalized solutions including mantras, gemstones, and spiritual practices. These remedies help balance planetary energies and bring harmony to your life.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Section 3: Call to Action */}
        <motion.div 
          className="text-center mb-20 px-6 sm:px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl p-12 border-2 border-orange-200 max-w-4xl mx-auto shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-6" style={{ fontFamily: "Poppins" }}>
              Ready to Discover Your Cosmic Path?
            </h3>
            <p className="text-sm sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto" style={{ fontFamily: "Poppins" }}>
              Connect with our certified astrologers and unlock the secrets written in your stars. Begin your journey of self-discovery today.
            </p>
            
            <motion.button 
              className="bg-[#F7971D] text-white px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto group hover:bg-orange-600"
              style={{ fontFamily: "Poppins" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connect with our Astrologers
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyConsult;
