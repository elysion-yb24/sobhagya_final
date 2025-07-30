'use client'

import Image from 'next/image';
import { ConsultingTopic } from '@/types';

const consultingTopics: ConsultingTopic[] = [
  {
    title: 'Love & Relationship Issues',
    description: 'Struggling with love, marriage, or compatibility problems? Astrology helps resolve conflicts and find harmony in relationships.',
    image: '/Group 13367 (1).png',
  },
  {
    title: 'Career & Financial Struggles',
    description: 'Facing job instability, business losses, or financial hurdles? Get guidance on the right career path and remedies for success.',
    image: '/Group 13368.png',
  },
  {
    title: 'Health & Well-being Concerns',
    description: 'Experiencing ongoing health issues or emotional stress? Astrology identifies planetary influences affecting your well-being.',
    image: '/Group 13369.png',
  },
];

const ConsultingSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
      {/* Faded astrology icon background (optional) */}
      <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <Image src="/sobhagya_logo.avif" alt="Astrology Icon" width={400} height={400} className="object-contain" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-center mb-6 text-[#745802] text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'EB Garamond' }}>
          Problems and Consulting
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h2>
        <p className="text-center mb-14 text-[#745802] text-lg font-medium max-w-2xl mx-auto">
          Solve Your Life's Biggest Problems with Astrologers
        </p>

        <div className="grid md:grid-cols-2 gap-16 items-start max-w-8xl mx-auto">
          <div className="relative flex justify-center items-center">
            <Image
              src="/palm-reading-Photoroom.png"
              alt="Palm Reading"
              width={220}
              height={220}
              className="w-full mix-blend-multiply"
              priority
            />
          </div>

                      <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E69126]"></div>
              
              <div className="space-y-12">
                {consultingTopics.map((topic, index) => (
                  <div key={topic.title} className="flex items-start gap-6 animate-fade-in-up relative">
                    {/* Orange dot on timeline */}
                    <div className="absolute left-6 top-4 w-4 h-4 bg-[#E69126] rounded-full -translate-x-1/2 z-10"></div>
                    
                    {/* Icon */}
                    <div className="flex items-center justify-center w-20 h-20 ml-12">
                                            <Image
                        src={topic.image}
                        alt={topic.title}
                        width={40}
                        height={40}
                        className="object-contain"
                        
                      />
                    </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{topic.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed">{topic.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Fade-in animation keyframes */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default ConsultingSection;
  