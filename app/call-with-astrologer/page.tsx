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
  Award, 
  Languages, 
  Zap,
  Gift,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Shield,
  Heart
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
    className="group relative bg-white rounded-xl border border-orange-200 p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col w-full max-w-[320px] h-full"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    style={{
      boxShadow: '0 4px 12px 0 rgba(247,151,30,0.08)',
    }}
  >
    <div className="flex gap-3 sm:gap-4 items-start mb-3 sm:mb-4">
      <div className="relative flex flex-col items-center flex-shrink-0">
        <img
          src={astrologer.image || '/default-astrologer.png'}
          alt={astrologer.name}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 shadow-sm"
          style={{ borderColor: astrologer.status === 'online' ? '#56AE50' : '#ff0000' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.name)}&background=f97316&color=fff&size=64`;
          }}
        />
        {astrologer.status === 'online' && (
          <span className="text-xs text-green-600 font-medium mt-1">Online</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base sm:text-lg font-bold text-gray-800 truncate">{astrologer.name}</span>
          <span className="text-orange-400 flex-shrink-0" title="Verified">
            <img src="/orange_tick.png" alt="Orange Tick" className="w-4 h-4" />
          </span>
        </div>
        <div className="text-gray-700 text-xs font-medium leading-tight truncate mb-1">
          {astrologer.expertise}
        </div>
        <div className="text-gray-500 text-xs truncate mb-1">
          {astrologer.language}
        </div>
        <div className="text-gray-500 text-xs mb-2">Exp:- <span className="font-semibold">{astrologer.experience} years</span></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">₹ {astrologer.rate}/<span className="text-xs font-medium">min.</span></span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1">
        <span className="flex items-center text-orange-400">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = astrologer.rating;
            const isHalf = value - i >= 0.5 && value - i < 1;
            return (
              <span key={i} className="relative">
                <svg width="12" height="12" className="sm:w-3 sm:h-3" fill={i < Math.floor(value) ? '#F7971D' : '#E5E7EB'} viewBox="0 0 20 20">
                  <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 " />
                </svg>
                {isHalf && (
                  <svg className="absolute left-0 top-0" width="12" height="12" viewBox="0 0 20 20">
                    <defs>
                      <linearGradient id={`half-star-${i}`}> <stop offset="50%" stopColor="#F7971D" /><stop offset="50%" stopColor="#E5E7EB" /></linearGradient>
                    </defs>
                    <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 " fill={`url(#half-star-${i})`} />
                  </svg>
                )}
              </span>
            );
          })}
        </span>
        <span className="text-xs text-gray-500 ml-1">({astrologer.consultations} orders)</span>
      </div>
    </div>
    
    <div className="flex gap-2 sm:gap-3 mt-auto pt-3 border-t border-gray-100">
      <button
        className="flex-1 px-3 py-2 flex items-center justify-center gap-1 border-2 border-[#F7971D] text-[#F7971D] font-semibold rounded-lg bg-white hover:bg-orange-50 transition-all duration-200 text-xs"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <img src="/message.png" alt="Chat" className="w-4 h-4" />
        <span>Chat</span>
      </button>
      
      <button
        className="flex-1 px-3 py-2 flex items-center justify-center gap-1 bg-[#F7971D] text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-all duration-200 text-xs"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <Video className="w-4 h-4" fill="#fff" />
        <span>Video</span>
      </button>
      
      <Link href="/calls/call1" className="flex-1">
        <button
          className="w-full px-3 py-2 flex items-center justify-center gap-1 bg-[#F7971D] text-white font-medium rounded-lg shadow-sm hover:bg-orange-600 transition-all duration-200 text-xs"
        >
          <img src="/Vector.png" alt="Call" className="w-4 h-4" />
          <span>Call</span>
        </button>
      </Link>
    </div>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <AnimatePresence>
              {astrologers.slice(0, showMore ? astrologers.length : 4).map((astrologer, index) => (
                <div key={`${astrologer.id}-${index}`} className="flex justify-center">
                  <EnhancedAstrologerCard 
                    astrologer={astrologer} 
                    index={index}
                  />
                </div>
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


      </div>
    </div>
  );
};

export default AstrologerCallPage;
