"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Clock, 
  Phone, 
  Video, 
  Users, 
  Award, 
  Languages, 
  Zap,
  Gift,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Shield,
  Heart,
  MessageCircle,
  TrendingUp
} from "lucide-react";

const astrologers = [
  {
    id: 1,
    name: "Pt. Shashtri Ji",
    expertise: "Kp, Vedic, Vastu",
    experience: "2 years",
    language: "Hindi",
    image: "/image (11).png",
    rating: 4.8,
    consultations: 1250,
    status: "online",
    specialOffer: "FREE 1st call",
    rate: 15
  },
  {
    id: 2,
    name: "Sahil Mehta",
    expertise: "Tarot reading, Pranic healing",
    experience: "2 years",
    language: "Hindi",
    image: "/Sahil-Mehta.png",
    rating: 4.9,
    consultations: 980,
    status: "online",
    specialOffer: "FREE 1st call",
    rate: 18
  },
  {
    id: 3,
    name: "Acharaya Ravi",
    expertise: "Vedic, Vastu",
    experience: "2 years",
    language: "Hindi",
    image: "/Acharya-Ravi.png",
    rating: 4.7,
    consultations: 1560,
    status: "busy",
    specialOffer: "FREE 1st call",
    rate: 20
  },
  {
    id: 4,
    name: "Naresh",
    expertise: "Tarot reading, Vedic, Ep",
    experience: "2 years",
    language: "Hindi",
    image: "/Naresh.png",
    rating: 4.6,
    consultations: 750,
    status: "online",
    specialOffer: "FREE 1st call",
    rate: 12
  },
];

const EnhancedLoader = () => (
  <motion.div 
    className="flex flex-col items-center justify-center h-32"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200 rounded-full animate-pulse"></div>
    </div>
    <motion.p 
      className="mt-4 text-gray-600 font-medium"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Loading astrologers...
    </motion.p>
  </motion.div>
);

interface Astrologer {
  id: number;
  name: string;
  expertise: string;
  experience: string;
  language: string;
  image: string;
  rating: number;
  consultations: number;
  status: string;
  specialOffer: string;
  rate: number;
}

const EnhancedAstrologerCard = ({ astrologer, index }: { astrologer: Astrologer; index: number }) => (
  <motion.div 
    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    {/* Background decoration */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
    
    {/* Status badge */}
    <div className="absolute top-4 right-4 z-10">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        astrologer.status === 'online' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          astrologer.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
        }`}></div>
        <span className="capitalize">{astrologer.status}</span>
      </div>
    </div>

    {/* Profile section */}
    <div className="flex flex-col items-center text-center mb-4">
      <div className="relative">
        <motion.div 
          className="w-24 h-24 rounded-full overflow-hidden mb-3 border-3 border-orange-300 bg-gray-100 shadow-lg"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {astrologer.image ? (
            <Image 
              src={astrologer.image} 
              alt={astrologer.name} 
              width={96} 
              height={96} 
              className="object-cover w-full h-full" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <Crown className="w-8 h-8 text-orange-600" />
            </div>
          )}
        </motion.div>
        
        {/* Premium badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
          <Crown className="w-3 h-3 text-white" />
        </div>
      </div>

      <h3 className="font-bold text-lg text-gray-900 mb-1">{astrologer.name}</h3>
      
      {/* Rating */}
      <div className="flex items-center gap-1 mb-2">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-sm font-medium text-gray-700">{astrologer.rating}</span>
        <span className="text-xs text-gray-500">({astrologer.consultations})</span>
      </div>

      {/* Languages */}
      <div className="flex items-center gap-1 mb-2">
        <Languages className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{astrologer.language}</span>
      </div>
    </div>

    {/* Expertise tags */}
    <div className="flex flex-wrap gap-1 justify-center mb-4">
      {astrologer.expertise.split(', ').map((skill, i) => (
        <span 
          key={i}
          className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
        >
          {skill}
        </span>
      ))}
    </div>

    {/* Experience */}
    <div className="flex items-center justify-center gap-1 mb-4">
      <Award className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-600">Exp: {astrologer.experience}</span>
    </div>

    {/* Rate */}
    <div className="text-center mb-4">
      <span className="text-lg font-bold text-orange-600">₹{astrologer.rate}/min</span>
    </div>

    {/* Action button */}
    <Link href="/calls/call1">
      <motion.div
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold text-center hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Gift className="w-4 h-4" />
        <span>{astrologer.specialOffer}</span>
      </motion.div>
    </Link>

    {/* Hover effect overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
  </motion.div>
);

const AstrologerCallPage = () => {
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <EnhancedLoader />
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      {/* Enhanced Header banner */}
      <motion.div 
        className="relative h-[200px] overflow-hidden mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 w-full h-[200px]">
          <Image 
            src="/call.png" 
            alt="call-image" 
            fill
            className="brightness-75 object-cover"
          />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
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
        
        <div className="relative flex flex-col items-center justify-center h-full text-center px-6">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Phone className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1 
            className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
            style={{ fontFamily: "EB Garamond" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Call with Astrologer
          </motion.h1>
          
          <motion.p 
            className="text-white/90 text-lg max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Connect instantly with expert astrologers for personalized guidance
          </motion.p>
        </div>
      </motion.div>

      {/* Enhanced Introduction section */}
      {/* <motion.div 
        className="max-w-4xl mx-auto px-6 py-8 text-center mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Trusted</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Instant</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Personalized</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Instant Astrological Guidance
          </h2>
          
          <p className="text-gray-600 text-lg mb-4">
            Our astrology experts are ready to assist you! Whether you need a consultation or have inquiries, 
            get immediate answers to your life's questions.
          </p>
          
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-4">
            <p className="text-orange-800 font-medium">
              <Sparkles className="w-5 h-5 inline mr-2" />
              Connect with skilled Astrologers for personalized insights on love, career, health, and beyond.
            </p>
          </div>
        </div>
      </motion.div> */}

      {/* Enhanced Astrologers section */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Astrologer</h3>
          <p className="text-gray-600">Select from our verified experts available now</p>
        </motion.div>

        {loading ? (
          <EnhancedLoader />
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <AnimatePresence>
              {astrologers.slice(0, showMore ? astrologers.length : 4).map((astrologer, index) => (
                <EnhancedAstrologerCard 
                  key={`${astrologer.id}-${index}`} 
                  astrologer={astrologer} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Enhanced Show more button */}
        {!loading && astrologers.length > 4 && (
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.button
              className="inline-flex items-center gap-2 bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-xl font-medium hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setShowMore(!showMore)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMore ? (
                <>
                  <ChevronUp className="w-5 h-5" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5" />
                  <span>Show More Astrologers</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Stats section */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {[
            { icon: Users, number: "50,000+", label: "Happy Clients" },
            { icon: MessageCircle, number: "1M+", label: "Consultations" },
            { icon: TrendingUp, number: "98%", label: "Success Rate" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h4>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AstrologerCallPage;
