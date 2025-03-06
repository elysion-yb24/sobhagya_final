import React from "react";
import Image from "next/image";

const DownloadAppSection = () => {
  return (
    <section
      className="py-12 flex flex-col md:flex-row items-center justify-center px-6 "
      style={{
        backgroundImage: "url('/orange.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Image Section */}
      <div className="md:w-1/2 flex justify-center ">
        <Image
          src="/meditation (1).png"
          alt="Meditation"
          width={400}
          height={450}
          className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
        />
      </div>

      {/* Text & Download Section */}
      <div className="md:w-1/2">
      <div className="w-[650px] -ml-20">
        {/* Title */}
        <h2 className="text-[#fff] text-[50px] font-bold font-ebgaramond leading-tight">
          Download Our Mobile App
        </h2>

        {/* Description */}
        <p className="mt-4 text-white text-center w-[600px] text-[15px] font-poppins font-medium leading-[23px] tracking-[0]">
          Get daily horoscope updates, personalized astrological insights, and expert guidance anytime, anywhere. 
          Explore zodiac predictions, remedies, and live consultations—all at your fingertips in a click! Download now and unlock the wisdom of the stars.
        </p>

        {/* App Store Buttons */}
        <div className="flex items-center justify-center gap-10 mt-4 -">
          <a href="#">
            <Image
              src="/appstore.png"
              alt="App Store"
              width={140}
              height={50}
              className="cursor-pointer"
            />
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en">
            <Image
              src="/playstore.png"
              alt="Google Play"
              width={140}
              height={50}
              className="cursor-pointer"
            />
          </a>
        </div>

        {/* Tagline */}
        <p className="mt-4 italic text-white text-sm font-medium font-poppins text-center ">
          Stay Connected with Astrology!
        </p>
      </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
