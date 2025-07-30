"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
      {/* Header Section */}
      <div className="relative py-8 sm:py-12 md:py-16 overflow-hidden">
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
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: 'EB Garamond' }}>
            About Us
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Introduction Section */}
        <div className="mb-12 sm:mb-16 mx-auto flex flex-col items-center justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-2 mx-auto text-center" style={{ fontFamily: 'EB Garamond' }}>
            Introduction
          </h2>
          <p className="text-lg sm:text-xl text-[#8B7355] mb-6 sm:mb-8 text-center">
            Your Trusted Online Astrology Consulting App!
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center w-full">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <p className="text-[#373737] text-base sm:text-lg leading-relaxed">
                Sobhagya is a feature-rich astrology app that connects users with expert astrologers for personalized predictions and guidance. Whether you need insights about love, relationships, career, finances, health, or spiritual growth, this app provides accurate astrological solutions based on Vedic astrology, numerology, and palmistry.
              </p>
              <p className="text-[#373737] text-base sm:text-lg leading-relaxed mt-4">
                With live chat, voice, video-consultations, Sobhagya allows you to get real-time answers from professional astrologers anytime, anywhere through live chat, voice, and video consultations. The app also provides daily, weekly, and yearly horoscopes to help you plan your life according to planetary movements and cosmic influences.
              </p>
            </div>
            
            {/* Right Content - Sobhagya Logo */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
                  {/* Sobhagya Logo */}
                  <img 
                    src="/sobhagya-logo.png" 
                    alt="Sobhagya Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-[#745802] mb-6 sm:mb-8 text-center">
            Key Features of Sobhagya:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              {[
                "Kundli (Birth Chart) Analysis",
                "Career & Business Guidance", 
                "Health & Wellness Astrology",
                "Astrological Remedies",
                "Palmistry Readings"
              ].map((feature, index) => (
                <div key={index} className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100">
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              {[
                "Love & Marriage Compatibility",
                "Financial Astrology",
                "Numerology & Tarot Readings",
                "Auspicious Muhurat Selection",
                "Vastu Shastra Consultation"
              ].map((feature, index) => (
                <div key={index} className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100">
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intermediate Text */}
        <div className="mb-12 sm:mb-16 text-center">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto px-4">
            Sobhagya makes astrology accessible to everyone, whether you are a beginner or an enthusiast. The app is designed to help users navigate major life challenges with confidence and cosmic wisdom.
          </p>
        </div>

        {/* Why Choose Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-[#745802] mb-6 sm:mb-8 text-center">
            Why Choose Sobhagya?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              {[
                "Trusted & Verified Astrologers",
                "User-Friendly Interface",
                "24/7 Availability"
              ].map((benefit, index) => (
                <div key={index} className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100">
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              {[
                "Instant & Accurate Guidance",
                "Multiple Astrology Systems"
              ].map((benefit, index) => (
                <div key={index} className="bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-orange-100">
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Concluding Paragraph */}
        <div className="text-center">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto px-4">
            From love and relationships to career growth and financial stability, Sobhagya provides expert astrology services tailored to your needs. Whether you are seeking solutions to life's obstacles or wish to enhance your spiritual journey, this app serves as your personal astrology guide. Embrace the power of astrology with Sobhagya - Your gateway to a brighter future!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
