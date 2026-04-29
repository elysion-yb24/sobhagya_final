'use client';

import Image from "next/image";
import lock from "@/public/Group 13357.png";
import { useEffect, useRef, useState } from "react";

const StatsBar: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative text-white section-spacing overflow-hidden py-10 sm:py-12">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/stats-bar.png"
          alt="Stats Background"
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="relative section-container">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-16 text-center items-center">
          {/* Secure & Privacy */}
          <div className={`flex flex-col items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '100ms' }}>
            <Image src={lock} alt="lock" className="w-auto max-w-[36px] sm:max-w-[50px] md:max-w-[60px] lg:max-w-[70px]" />
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium mt-1.5 sm:mt-2 leading-tight">
              100% Secure & Privacy
            </span>
          </div>

          {/* Play Store Rating */}
          <div className={`flex flex-col items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '250ms' }}>
            <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 mb-1 sm:mb-2">
              <Image src="/Star 13.png" alt="small star" width={25} height={25} className="w-auto max-w-[18px] sm:max-w-[25px] md:max-w-[35px] lg:max-w-[40px]" />
              <Image src="/Star 11.png" alt="big star" width={40} height={40} className="w-auto max-w-[28px] sm:max-w-[40px] md:max-w-[50px] lg:max-w-[60px]" />
              <Image src="/Star 12.png" alt="small star" width={25} height={25} className="w-auto max-w-[18px] sm:max-w-[25px] md:max-w-[35px] lg:max-w-[40px]" />
            </div>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium leading-tight">
              4.5 Stars on Play Store
            </span>
          </div>

          {/* Total Calls */}
          <div className={`flex flex-col items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '400ms' }}>
            <span className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">10,000+</span>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium leading-tight">Total Calls</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
