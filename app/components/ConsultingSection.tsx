'use client'

import Image from 'next/image';
import { ConsultingTopic } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SectionHeader from './ui/SectionHeader';
import { useScrollParallax } from '@/app/hooks/useScrollParallax';

const consultingTopics: ConsultingTopic[] = [
  {
    title: 'Love & Relationship Issues',
    description:
      "Struggling with love, marriage, or compatibility problems? Astrology helps resolve conflicts and find harmony in relationships.",
    image: '/love-issue-bullet.svg',
  },
  {
    title: 'Career & Financial Struggles',
    description:
      'Facing job instability, business losses, or financial hurdles? Get guidance on the right career path and remedies for success.',
    image: '/career-struggle-bullet.svg',
  },
  {
    title: 'Health & Well-being Concerns',
    description:
      'Experiencing ongoing health issues or emotional stress? Astrology identifies planetary influences affecting your well-being.',
    image: '/health-well-being-bullet.svg',
  },
];

const ConsultingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reduced = useReducedMotion();

  const { ref: imageRef, y: imageY } = useScrollParallax(0.4);

  // Path-draw progress driven by scroll over the timeline
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 20%'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Each card's rotateY tilt — disabled on mobile / reduced-motion
  const cardTiltFor = (index: number) => {
    if (reduced || isMobile) return 0;
    if (index === 0) return 8;
    if (index === 2) return -8;
    return 0;
  };

  return (
    <section
      ref={sectionRef}
      className="section-spacing bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden sacred-pattern"
    >
      {/* Faded astrology icon background */}
      <div className="absolute inset-0 flex justify-center items-center opacity-[0.03] pointer-events-none select-none z-0">
        <Image
          src="/sobhagya-logo.svg"
          alt="Astrology Icon"
          width={400}
          height={400}
          className="object-contain animate-mandala-spin"
        />
      </div>

      {/* Floating decorative orbs */}
      <div className="absolute top-10 left-6 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-200/30 to-amber-200/20 animate-float-y pointer-events-none" />
      <div
        className="absolute bottom-12 right-6 sm:right-16 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-200/20 to-orange-200/20 animate-float-y pointer-events-none"
        style={{ animationDelay: '1.5s' }}
      />
      <div className="hidden sm:block absolute top-1/2 right-8 w-8 h-8 rounded-full border border-orange-300/30 animate-glow-pulse pointer-events-none" />

      <div className="section-container relative z-10">
        <div
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <SectionHeader
            tag="Consultation"
            title="Problems and Consulting"
            subtitle="Solve Your Life's Biggest Problems with Astrologers"
            center
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Palm reading image with parallax + rotating gold ring */}
          <motion.div
            ref={imageRef as React.RefObject<HTMLDivElement>}
            className="relative flex justify-center items-center"
            style={{ y: imageY }}
            initial={{ opacity: 0, x: -48 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -48 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-orange-200/30 rounded-full blur-3xl" />
            </div>
            {!reduced && (
              <motion.div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="w-[260px] h-[260px] sm:w-[330px] sm:h-[330px] md:w-[380px] md:h-[380px] rounded-full"
                  style={{
                    border: '1px dashed rgba(247,148,29,0.35)',
                    boxShadow: 'inset 0 0 40px rgba(247,148,29,0.08)',
                  }}
                />
              </motion.div>
            )}
            <Image
              src="/palm-reading.svg"
              alt="Palm Reading"
              width={400}
              height={400}
              className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-lg mix-blend-multiply relative z-10 animate-float-y devotional-glow"
              priority
            />
          </motion.div>

          {/* Right: 3D timeline */}
          <div
            ref={timelineRef}
            className="relative"
            style={{ perspective: '1400px' }}
          >
            {/* Animated SVG path connecting the timeline */}
            <svg
              aria-hidden
              className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 overflow-visible pointer-events-none"
              viewBox="0 0 2 400"
              preserveAspectRatio="none"
              style={{ height: '100%' }}
            >
              <line x1="1" y1="0" x2="1" y2="400" stroke="rgba(247,148,29,0.15)" strokeWidth="2" />
              <motion.line
                x1="1"
                y1="0"
                x2="1"
                y2="400"
                stroke="#F7941D"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ pathLength: reduced ? 1 : pathLength }}
              />
            </svg>

            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              {consultingTopics.map((topic, index) => (
                <motion.div
                  key={topic.title}
                  className="flex items-start gap-3 sm:gap-5 relative group"
                  style={{ transformStyle: 'preserve-3d' }}
                  initial={{
                    opacity: 0,
                    z: -200,
                    rotateY: cardTiltFor(index) * 1.5,
                    y: 40,
                  }}
                  animate={
                    isVisible
                      ? {
                          opacity: 1,
                          z: 0,
                          rotateY: cardTiltFor(index),
                          y: 0,
                        }
                      : {
                          opacity: 0,
                          z: -200,
                          rotateY: cardTiltFor(index) * 1.5,
                          y: 40,
                        }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 90,
                    damping: 18,
                    delay: 0.5 + index * 0.18,
                  }}
                >
                  {/* Timeline dot with rotating badge */}
                  <div className="absolute left-5 sm:left-6 top-4 -translate-x-1/2 z-10">
                    <motion.div
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#F7941D] rounded-full relative"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={isVisible ? { scale: 1, rotate: 360 } : { scale: 0, rotate: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.18, type: 'spring' }}
                    >
                      <div className="absolute inset-0 bg-[#F7941D] rounded-full animate-ping opacity-30" />
                    </motion.div>
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ml-9 sm:ml-10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-200/50 flex-shrink-0">
                    <Image
                      src={topic.image}
                      alt={topic.title}
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5 sm:pt-1 transition-all duration-300 group-hover:translate-x-1">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-gray-800 group-hover:text-[#E69126] transition-colors duration-300">
                      {topic.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingSection;
