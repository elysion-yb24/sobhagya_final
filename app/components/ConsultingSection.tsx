'use client'

import Image from 'next/image';
import { ConsultingTopic } from '@/types';
import { useEffect, useRef, useState } from 'react';
import SectionHeader from './ui/SectionHeader';

const consultingTopics: ConsultingTopic[] = [
  {
    title: 'Love & Relationship Issues',
    description: 'Struggling with love, marriage, or compatibility problems? Astrology helps resolve conflicts and find harmony in relationships.',
    image: '/love-issue-bullet.svg',
  },
  {
    title: 'Career & Financial Struggles',
    description: 'Facing job instability, business losses, or financial hurdles? Get guidance on the right career path and remedies for success.',
    image: '/career-struggle-bullet.svg',
  },
  {
    title: 'Health & Well-being Concerns',
    description: 'Experiencing ongoing health issues or emotional stress? Astrology identifies planetary influences affecting your well-being.',
    image: '/health-well-being-bullet.svg',
  },
];

const ConsultingSection: React.FC = () => {
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
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-spacing bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden sacred-pattern">
      {/* Faded astrology icon background */}
      <div className="absolute inset-0 flex justify-center items-center opacity-[0.03] pointer-events-none select-none z-0">
        <Image src="/sobhagya-logo.svg" alt="Astrology Icon" width={400} height={400} className="object-contain animate-mandala-spin" />
      </div>

      {/* Floating decorative orbs */}
      <div className="absolute top-10 left-6 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-200/30 to-amber-200/20 animate-float-y pointer-events-none" />
      <div className="absolute bottom-12 right-6 sm:right-16 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-200/20 to-orange-200/20 animate-float-y pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="hidden sm:block absolute top-1/2 right-8 w-8 h-8 rounded-full border border-orange-300/30 animate-glow-pulse pointer-events-none" />

      <div className="section-container relative z-10">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SectionHeader
            tag="Consultation"
            title="Problems and Consulting"
            subtitle="Solve Your Life's Biggest Problems with Astrologers"
            center
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Palm reading image */}
          <div className={`relative flex justify-center items-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-orange-200/30 rounded-full blur-3xl" />
            </div>
            <Image
              src="/palm-reading.svg"
              alt="Palm Reading"
              width={400}
              height={400}
              className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-lg mix-blend-multiply relative z-10 animate-float-y devotional-glow"
              priority
            />
          </div>

          {/* Right: Topics timeline */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F7941D] via-[#F7941D] to-[#F7941D]/30" />
            
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              {consultingTopics.map((topic, index) => (
                <div
                  key={topic.title}
                  className={`flex items-start gap-3 sm:gap-5 relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: isVisible ? `${500 + index * 200}ms` : '0ms' }}
                >
                  {/* Animated timeline dot */}
                  <div className="absolute left-5 sm:left-6 top-4 -translate-x-1/2 z-10">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#F7941D] rounded-full relative">
                      <div className="absolute inset-0 bg-[#F7941D] rounded-full animate-ping opacity-30" />
                    </div>
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
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-gray-800 group-hover:text-[#E69126] transition-colors duration-300">{topic.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">{topic.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingSection;