import React from "react";
import Image from "next/image";

const DownloadAppSection = () => {
  return (
    <section
      className="py-8 sm:py-12 px-4 sm:px-6"
      style={{
        backgroundImage: "url('/orange.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
          {/* Image Section - Smaller on mobile, balanced on desktop */}
          <div className="w-full lg:w-1/2 flex justify-center mb-8 lg:mb-0">
            <Image
              src="/meditation (1).png"
              alt="Meditation"
              width={400}
              height={450}
              className="w-3/4 sm:w-2/3 md:w-1/2 lg:w-auto max-w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Text & Download Section - Full width on mobile, half on desktop */}
          <div className="w-full lg:w-1/2 max-w-xl mx-auto lg:mx-0">
            {/* Title - Responsive text sizing */}
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-center lg:text-left" style={{ fontFamily: 'EB Garamond' }}>
              Download Our Mobile App
            </h2>

            {/* Description - Adjust padding on different screens */}
            <p className="mt-3 sm:mt-4 text-white text-sm sm:text-base font-medium leading-relaxed px-4 sm:px-6 md:px-0 text-center lg:text-left" style={{ fontFamily: 'Poppins' }}>
              Get daily horoscope updates, personalized astrological insights, and expert guidance anytime, anywhere. 
              Explore zodiac predictions, remedies, and live consultations—all at your fingertips in a click! Download now and unlock the wisdom of the stars.
            </p>

            {/* App Store Buttons - Change flex direction on very small screens */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6">
              <a href="#" className="w-36 sm:w-auto">
                <Image
                  src="/appstore.png"
                  alt="App Store"
                  width={140}
                  height={50}
                  className="cursor-pointer w-full h-auto"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en" className="w-36 sm:w-auto">
                <Image
                  src="/playstore.png"
                  alt="Google Play"
                  width={140}
                  height={50}
                  className="cursor-pointer w-full h-auto"
                />
              </a>
            </div>

            {/* Tagline */}
            <p className="mt-4 italic text-white text-xs sm:text-sm font-medium text-center lg:text-left" style={{ fontFamily: 'Poppins' }}>
              Stay Connected with Astrology!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;