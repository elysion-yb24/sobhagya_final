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
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80 py-0">
      {/* Hero Section with Background and Overlay */}
      <div className="relative w-full h-[260px] md:h-[320px] flex items-center justify-center overflow-hidden">
        {/* Faded Monk Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 z-0">
          <Image src="/monk logo.png" alt="Astrology Logo" width={320} height={320} className="object-contain" />
        </div>
        {/* Orange Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-200/80 to-transparent z-10" />
        <h2 className="relative z-20 text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg tracking-tight text-center">
          About Us
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h2>
      </div>

      {/* Animated Card Container */}
      <div className="max-w-5xl mx-auto -mt-16 md:-mt-24 p-6 sm:p-10 bg-white/90 shadow-2xl rounded-3xl border-t-8 border-orange-200 animate-fade-in-up relative z-30 backdrop-blur-md">
        {/* Introduction Section */}
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#745802] mb-2 border-l-4 border-orange-400 pl-4 inline-block text-left">Introduction</h3>
          <p className="mt-2 text-xl text-[#745802] font-medium">Your Trusted Online Astrology Consulting App!</p>
          <p className="text-[#373737] mt-4 text-lg md:text-xl leading-relaxed font-normal">Sobhagya is a feature-rich astrology app that connects users with expert astrologers for personalized predictions and guidance. Whether you need insights about love, relationships, career, finances, health, or spiritual growth, this app provides accurate astrological solutions based on Vedic astrology, numerology, and palmistry.</p>
        </div>

        {/* Features Section */}
        <div className="flex flex-col md:flex-row items-center gap-10 mt-8">
          {/* Features List */}
          <div className="w-full md:w-2/3">
            <h3 className="text-2xl font-bold mb-4 text-orange-700 border-l-4 border-orange-400 pl-3">Key Features of Sobhagya:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Kundli (Birth Chart) Analysis",
                "Love & Marriage Compatibility",
                "Career & Business Guidance",
                "Financial Astrology",
                "Health & Wellness Astrology",
                "Numerology & Tarot Readings",
                "Astrological Remedies",
                "Auspicious Muhurat Selection",
                "Palmistry Readings",
                "Vastu Shastra Consultation",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-800">
                  <span className="text-orange-500 text-lg">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Astrology Image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <Image
              src="/monk logo.png"
              alt="Astrology Icon"
              width={260}
              height={260}
              className="object-contain drop-shadow-2xl rounded-2xl bg-white/80"
            />
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="mt-14">
          <h3 className="text-2xl font-bold text-center md:text-left text-orange-700 border-l-4 border-orange-400 pl-3 inline-block">Why Choose Sobhagya?</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[
              "Trusted & Verified Astrologers",
              "Instant & Accurate Guidance",
              "User-Friendly Interface",
              "Multiple Astrology Systems",
              "24/7 Availability",
            ].map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3 shadow-sm font-semibold text-gray-800">
                <span className="text-orange-500 text-xl">★</span>
                <span className="text-base sm:text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Closing Statement */}
        <div className="text-center mt-14">
          <p className="text-gray-700 text-xl leading-relaxed font-medium">
            From <span className="text-orange-500 font-bold">love and relationships to career growth and financial stability</span>, Sobhagya provides expert astrology services tailored to your needs.
          </p>
          <p className="text-2xl font-extrabold text-[#785032] mt-6">
            Embrace the power of astrology with Sobhagya – Your gateway to a brighter future!
          </p>
        </div>
      </div>
      {/* Fade-in animation keyframes */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default AboutUs;
