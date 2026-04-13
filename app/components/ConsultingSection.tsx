'use client'

import Image from 'next/image';
import { ConsultingTopic } from '@/types';
import { useEffect, useRef, useState } from 'react';

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
    <section ref={sectionRef} className="py-10 sm:py-14 md:py-20 bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
      {/* Faded astrology icon background (optional) */}
      <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <Image src="/sobhagya-logo.svg" alt="Astrology Icon" width={400} height={400} className="object-contain animate-rotate-slow" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-orange-200/30 to-amber-200/20 animate-float pointer-events-none" />
      <div className="absolute bottom-16 right-16 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200/20 to-orange-200/20 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 right-8 w-8 h-8 rounded-full border border-orange-300/30 animate-pulse pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-center mb-4 sm:mb-6 text-[#745802] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'EB Garamond' }}>
            Problems and Consulting
            <span className="block w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-500 mx-auto mt-4 rounded-full"></span>
          </h2>
          <p className="text-center mb-8 sm:mb-14 text-[#745802] text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto px-2">
            Solve Your Life&apos;s Biggest Problems with Astrologers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start max-w-8xl mx-auto">
          <div className={`relative flex justify-center items-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            {/* Soft glow behind image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 bg-orange-200/30 rounded-full blur-3xl" />
            </div>
            <Image
              src="/palm-reading.svg"
              alt="Palm Reading"
              width={400}
              height={400}
              className="w-full max-w-lg mix-blend-multiply relative z-10 animate-float"
              priority
            />
          </div>

          <div className={`relative transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Vertical timeline line with gradient */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E69126] via-[#F7971E] to-[#E69126]/30"></div>
            
            <div className="space-y-8 sm:space-y-12">
              {consultingTopics.map((topic, index) => (
                <div
                  key={topic.title}
                  className={`flex items-start gap-4 sm:gap-6 relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: isVisible ? `${500 + index * 200}ms` : '0ms' }}
                >
                  {/* Animated orange dot on timeline */}
                  <div className="absolute left-6 top-4 -translate-x-1/2 z-10">
                    <div className="w-4 h-4 bg-[#E69126] rounded-full relative">
                      <div className="absolute inset-0 bg-[#E69126] rounded-full animate-ping opacity-30" />
                    </div>
                  </div>
                  
                  {/* Icon with hover effect */}
                  <div className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 ml-10 -mt-4 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-200/50">
                    <Image
                      src={topic.image}
                      alt={topic.title}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                
                  {/* Content with hover highlight */}
                  <div className="flex-1 pt-1 transition-all duration-300 group-hover:translate-x-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-gray-800 group-hover:text-[#E69126] transition-colors duration-300">{topic.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{topic.description}</p>
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