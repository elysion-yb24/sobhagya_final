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
        <Image src="/monk logo.png" alt="Astrology Icon" width={400} height={400} className="object-contain" />
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
              src="/palm-reading.png"
              alt="Palm Reading"
              width={220}
              height={220}
              className="w-full"
              priority
            />
          </div>

          <div className="space-y-14">
            {consultingTopics.map((topic, index) => (
              <div key={topic.title} className="flex items-start gap-8 animate-fade-in-up">
                <div className="relative flex flex-col items-center">
                  {index !== consultingTopics.length - 1 && (
                    <div className="absolute left-1/2 top-[calc(100%+1rem)] h-16 w-[2px] bg-orange-200 -translate-x-1/2"></div>
                  )}
                  <div className="flex items-center justify-center bg-white p-4 rounded-2xl shadow-xl border-t-8 border-orange-200">
                    <Image
                      src={topic.image}
                      alt={topic.title}
                      width={70}
                      height={70}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="flex-1 ">
                  <h3 className="text-2xl font-extrabold mb-3 text-gray-800">{topic.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-md font-medium">{topic.description}</p>
                </div>
              </div>
            ))}
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
  