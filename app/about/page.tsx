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
    <section className="bg-white text-gray-800">
      {/* About Us Section with Background Image */}
      <div
        className="relative w-full h-[200px] md:h-[180px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/image (6).png')" }}
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white px-6 py-2 rounded-lg">
          About Us
        </h2>
      </div>

      {/* White Container for Content */}
      <div className="max-w-6xl mx-auto mt-10 my-auto p-8 bg-white shadow-2xl rounded-4xl">
        {/* Introduction Section Inside the Container */}
        <div className="text-center text-left">
          <h3 className="text-3xl md:text-4xl font-bold text-[#745802] underline">
            Introduction
          </h3>
          <p className="mt-2 text-lg text-[#745802]">
            Your Trusted Online Astrology Consulting App!
          </p>
          <p className="text-[#373737] mt-4 text-base md:text-lg leading-relaxed">
            Sobhagya is a feature-rich astrology app that connects users with expert astrologers for personalized predictions and guidance. Whether you need insights about love, relationships, career, finances, health, or spiritual growth, this app provides accurate astrological solutions based on Vedic astrology, numerology, and palmistry.
          </p>
        </div>

        {/* Features Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mt-8">
          {/* Features List */}
          <div className="w-full md:w-2/3">
            <h3 className="text-2xl font-bold mb-4 text-orange-700">Key Features of Sobhagya:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
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
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Astrology Image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <Image
              src="/sobhagya-logo.png"
              alt="About Us"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center md:text-left text-orange-700">
            Why Choose Sobhagya?
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 text-gray-700">
            {[
              "Trusted & Verified Astrologers",
              "Instant & Accurate Guidance",
              "User-Friendly Interface",
              "Multiple Astrology Systems",
              "24/7 Availability",
            ].map((benefit, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-orange-500 font-bold text-lg">•</span>
                <span className="text-base sm:text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Closing Statement */}
        <div className="text-center mt-12">
          <p className="text-gray-700 text-lg leading-relaxed">
            From{" "}
            <span className="text-orange-500 font-semibold">
              love and relationships to career growth and financial stability
            </span>
            , Sobhagya provides expert astrology services tailored to your needs.
          </p>
          <p className="text-xl font-semibold text-[#785032] mt-4">
            Embrace the power of astrology with Sobhagya – Your gateway to a
            brighter future!
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
