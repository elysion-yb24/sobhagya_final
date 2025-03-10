"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const HeroSection: React.FC = () => {
  // State for active navigation
  const [activeNav, setActiveNav] = useState("chat");

  // Handle navigation click
  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
  };
  return (
    <div className="flex flex-col w-full">
      {/* NEW: Navigation Section - Positioned Above Hero Section */}

      {/* Original Hero Section - Keeping Exactly As Is */}
      <section
        className="text-white relative w-full flex items-center px-4 sm:px-8 md:px-12"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Navigation Cards */}

        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2 mx-auto">
          <div className="mx-auto px-40">
            <div className="flex justify-evenly">
              <div
                className={
                  "bg-white shadow-lg rounded-[12px] p-4  text-center  sm:w-40 md:w-64 h-32 cursor-pointer hover:shadow-lg transition-all "
                }
                onClick={() => handleNavClick("chat")}
              >
                <div className="flex justify-center mt-2 mb-2">
                  <img
                    src="/Group 13364.png"
                    alt="Chat"
                    width={52}
                    height={127}
                    className="shadow-black"
                  />
                </div>
                <p
                  className="text-[#373737] "
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "14px",
                    fontWeight: "400",
                  }}
                >
                  Chat with Astrologer
                </p>
              </div>
            
              <div
              
                className={`bg-white shadow-md rounded-[12px] p-4 text-center w-full sm:w-40 md:w-64 h-32 cursor-pointer hover:shadow-lg transition-all ${
                  activeNav === "talk" ? "border-b-2 border-orange-500" : ""
                }`}
                onClick={() => handleNavClick("talk")}
              >
                <div className="flex justify-center mb-2">
                  <img
                    src="/Group 13365.png"
                    alt="Talk"
                    width={52}
                    height={127}
                    className="shadow-black"
                  />
                </div>
                <p
                  className="text-[#373737] font-small"
                  style={{ fontFamily: "Poppins", fontSize: "14px" }}
                >
                  Talk to Astrologer
                </p>
              </div>

              <div
                className={`bg-[#F7971D] shadow-md rounded-[12px] p-4 text-center w-full sm:w-40 md:w-64 h-32 cursor-pointer hover:shadow-lg transition-all ${
                  activeNav === "shop" ? "border-b-2 border-white" : ""
                }`}
                onClick={() => handleNavClick("shop")}
              >
                <div className="flex justify-center mb-2">
                  <img
                    src="/Group 13366.png"
                    alt="Shop"
                    width={52}
                    height={127}
                  />
                </div>
                <p
                  className="text-white "
                  style={{ fontFamily: "Poppins", fontSize: "14px" }}
                >
                  Astromall Shop
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="container mx-auto flex flex-col-reverse sm:flex-col md:flex-row items-center justify-between w-full">
          {/* Left Side - Text Section */}
          <div className="text-center md:text-left md:w-1/2 max-w-full px-4 mt-6 md:mt-0">
            <h1
              className="text-xl sm:text-2xl md:text-2xl lg:text-4xl font-bold whitespace-nowrap mb-4 sm:mb-4"
              style={{
                fontFamily: "EB Garamond",
                fontWeight: "700",
                lineHeight: "1.2",
                letterSpacing: "0%",
                fontSize: "clamp(1.5rem, 4vw, 3rem)",
              }}
            >
              10023 Consultations Done
            </h1>

            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-6 sm:mb-6"
              style={{
                fontFamily: "Poppins",
                fontWeight: "700",
                maxWidth: "320px",
              }}
            >
              Your's might be waiting
            </p>
            <Link
              href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en"
              target="_blank"
            >
              <button
                className="bg-white text-[#F7971D] px-12 sm:px-8 py-4 font-semibold hover:bg-orange-100 transition-colors mb-10 sm:mb-6 md:mb-0 flex items-center justify-center"
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  height: "66px",
                  borderRadius: "6px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                  fontSize: "24px",
                  lineHeight: "34px",
                  letterSpacing: "0%",
                }}
              >
                <img
                  src="./Group 13380.png"
                  alt="account"
                  className="w-8 h-8 mr-8"
                />
                Get a call now
              </button>
            </Link>
          </div>

          {/* Right Side - Astrologer Image with Zodiac Symbols */}
          <div className="relative w-full md:w-1/2 flex justify-center self-end">
            {/* Background Zodiac Circle (Rotates in Place) */}
            <Image
              src="/Group (1) 3.png"
              alt="Zodiac Background"
              width={400}
              height={300}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 rotate-in-place hidden md:block"
              priority
            />

            {/* Astrologer Image */}
            <Image
              src="/astrologer.png"
              alt="Astrologer"
              width={670}
              height={400}
              className="relative z-10 object-contain h-auto"
              priority
            />

            {/* Left Bottom Zodiac Sign (Rotates in Place) */}
            <Image
              src="/Group (1) 5.png"
              alt="Left Zodiac Sign"
              width={100}
              height={100}
              className="absolute bottom-[60px] left-[10px] opacity-100 rotate-in-place"
              priority
            />

            <Image
              src="/Group (1) 4.png"
              alt="Right Zodiac Sign"
              width={100}
              height={100}
              className="absolute bottom-[150px] right-[20px] opacity-80 rotate-in-place"
              priority
            />
          </div>
        </div>

        <style jsx>{`
          @keyframes rotateInPlace {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .rotate-in-place {
            animation: rotateInPlace 30s linear infinite;
          }
        `}</style>
      </section>

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
