import React from "react";
import Image from "next/image";

const DownloadAppSection = () => {
  return (
    <section
      className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6"
      style={{
        backgroundImage: "url('/orange.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Image Section - Smaller on mobile, balanced on desktop */}
          <div className="w-full lg:w-1/2 flex justify-center mb-4 sm:mb-6 lg:mb-0">
            <Image
              src="/download-app.svg"
              alt="Meditation"
              width={500}
              height={563}
              className="w-2/3 xs:w-3/4 sm:w-2/3 md:w-1/2 lg:w-auto max-w-[260px] sm:max-w-sm md:max-w-md xl:max-w-lg h-auto object-contain devotional-glow"
              priority
            />
          </div>

          {/* Text & Download Section - Full width on mobile, half on desktop */}
          <div className="w-full lg:w-1/2 max-w-xl mx-auto lg:mx-0">
            {/* Title - Responsive text sizing */}
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-center lg:text-left tracking-tight" style={{ fontFamily: 'EB Garamond' }}>
              Download Our Mobile App
            </h2>

            {/* Description - Adjust padding on different screens */}
            <p className="mt-3 sm:mt-4 text-white/95 text-sm sm:text-base font-medium leading-relaxed px-2 sm:px-0 text-center lg:text-left" style={{ fontFamily: 'Poppins' }}>
              Get daily horoscope updates, personalized astrological insights, and expert guidance anytime, anywhere.
              Explore zodiac predictions, remedies, and live consultations all at your fingertips. Download now and unlock the wisdom of the stars.
            </p>

            {/* App Store Buttons - Side by side even on mobile, with tap-friendly sizing */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-5 mt-5 sm:mt-6">
              <a href="https://apps.apple.com/in/app/sobhagya/id6755958411" target="_blank" rel="noopener noreferrer" className="w-[44%] xs:w-40 sm:w-44 transition-transform active:scale-95 hover:scale-105">
                <Image
                  src="/app-store.svg"
                  alt="App Store"
                  width={160}
                  height={60}
                  className="cursor-pointer w-full h-auto object-contain drop-shadow-md"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en" target="_blank" rel="noopener noreferrer" className="w-[44%] xs:w-40 sm:w-44 transition-transform active:scale-95 hover:scale-105">
                <Image
                  src="/play-store.svg"
                  alt="Google Play"
                  width={160}
                  height={60}
                  className="cursor-pointer w-full h-auto object-contain drop-shadow-md"
                />
              </a>
            </div>

            {/* Tagline */}
            <p className="mt-4 italic text-white/90 text-xs sm:text-sm font-medium text-center lg:text-left tracking-wide" style={{ fontFamily: 'Poppins' }}>
              Stay Connected with Astrology!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;