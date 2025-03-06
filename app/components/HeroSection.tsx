"use client";
import Image from "next/image";
import Link from "next/link";

const HeroSection: React.FC = () => {
  return (
    <section
      className="text-white relative w-full  flex items-center px-4 sm:px-8 md:px-12"
      style={{
        backgroundImage: "url(/image.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
              fontSize: 'clamp(1.5rem, 4vw, 3rem)'
            }}
          >
            10023 Consultations Done
          </h1>

          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-6 sm:mb-6"
            style={{ fontFamily: "Poppins", fontWeight: "700",maxWidth: '320px' }}
          >
            Your's might be waiting
          </p>
          <Link href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en" target="_blank">
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
              <img src="./Group 13380.png" alt="account" className="w-8 h-8  mr-8" />
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

          {/* Right Bottom Zodiac Sign (Rotates in Place) */}
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

      {/* Custom CSS for Rotation in Place */}
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
  );
};

export default HeroSection;
