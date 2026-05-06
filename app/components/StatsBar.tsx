'use client';

import Image from "next/image";
import lock from "@/public/Group 13357.png";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/app/hooks/useCountUp";
import { useScrollParallax } from "@/app/hooks/useScrollParallax";

const StatsBar: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reduced = useReducedMotion();

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

  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const total = useCountUp(10000, {
    duration: isMobile ? 1 : 1.6,
    start: isVisible,
  });

  const { ref: bgRef, y: bgY } = useScrollParallax(0.25);

  // Star ring config
  const ringSize = isMobile ? 90 : 130;
  const ringRadius = ringSize / 2 - 10;
  const ringStars = [0, 1, 2, 3, 4];

  return (
    <section
      ref={sectionRef}
      className="relative text-white section-spacing overflow-hidden py-10 sm:py-12"
    >
      {/* Background Image with parallax */}
      <motion.div
        ref={bgRef as React.RefObject<HTMLDivElement>}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ y: bgY }}
      >
        <Image
          src="/stats-bar.png"
          alt="Stats Background"
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15" />
      </motion.div>

      {/* Content */}
      <div className="relative section-container">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-16 text-center items-center">
          {/* Secure & Privacy — animated padlock */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative">
              <Image
                src={lock}
                alt="lock"
                className="w-auto max-w-[36px] sm:max-w-[50px] md:max-w-[60px] lg:max-w-[70px]"
              />
              {/* Glow ring on unlock */}
              {!reduced && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ boxShadow: "0 0 0 rgba(247,148,29,0)" }}
                  animate={
                    isVisible
                      ? { boxShadow: ["0 0 0 rgba(247,148,29,0)", "0 0 24px rgba(247,148,29,0.65)", "0 0 0 rgba(247,148,29,0)"] }
                      : {}
                  }
                  transition={{ duration: 1.6, delay: 0.4 }}
                />
              )}
            </div>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium mt-1.5 sm:mt-2 leading-tight">
              100% Secure & Privacy
            </span>
          </motion.div>

          {/* Play Store Rating — 3D rotating star ring */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <div
              className="relative flex items-center justify-center mb-1 sm:mb-2"
              style={{
                width: ringSize,
                height: ringSize * 0.7,
                perspective: "600px",
              }}
            >
              {/* Spinning 3D star ring */}
              <motion.div
                className="absolute inset-0"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "rotateX(55deg)",
                }}
                animate={reduced ? {} : { rotateZ: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                {ringStars.map((i) => {
                  const angle = (i / ringStars.length) * Math.PI * 2;
                  const x = Math.cos(angle) * ringRadius;
                  const y = Math.sin(angle) * ringRadius;
                  return (
                    <span
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                    >
                      <Image
                        src="/Star 13.png"
                        alt=""
                        width={18}
                        height={18}
                        className="opacity-70"
                      />
                    </span>
                  );
                })}
              </motion.div>

              {/* Center stars */}
              <div className="relative flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 z-10">
                <Image src="/Star 13.png" alt="small star" width={25} height={25} className="w-auto max-w-[18px] sm:max-w-[25px] md:max-w-[35px] lg:max-w-[40px]" />
                <Image src="/Star 11.png" alt="big star" width={40} height={40} className="w-auto max-w-[28px] sm:max-w-[40px] md:max-w-[50px] lg:max-w-[60px]" />
                <Image src="/Star 12.png" alt="small star" width={25} height={25} className="w-auto max-w-[18px] sm:max-w-[25px] md:max-w-[35px] lg:max-w-[40px]" />
              </div>
            </div>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium leading-tight">
              4.5 Stars on Play Store
            </span>
          </motion.div>

          {/* Total Calls — animated counter */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.span
              className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tabular-nums"
              animate={
                isVisible && total >= 10000 && !reduced
                  ? { textShadow: ["0 0 0 rgba(247,148,29,0)", "0 0 22px rgba(247,148,29,0.7)", "0 0 0 rgba(247,148,29,0)"] }
                  : {}
              }
              transition={{ duration: 1.6, delay: 0.2 }}
            >
              {total.toLocaleString()}+
            </motion.span>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium leading-tight">
              Total Calls
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
