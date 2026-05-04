'use client';

import Image from 'next/image'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon } from '@heroicons/react/24/solid';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';

export default function Services() {
    const services = [
        { 
          name: "Birth Journal", 
          image: "/Group 13384.png", 
          description: "Your birth journal is a cosmic blueprint, revealing the celestial influences that shape your destiny.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Vastu Shastra", 
          image: "/Group 13383.png", 
          description: "Vastu harmonizes cosmic energies with your surroundings, creating a balanced environment.", 
          link: "/call-with-astrologer"
        },
        {
          name: "Face Reading",
          image: "/Face Reading.svg",
          description: "Your face is a mirror of destiny, revealing secrets about your personality and future.",
          link: "/call-with-astrologer"
        },
        { 
          name: "Lal Kitab", 
          image: "/Group 13388.png", 
          description: "Powerful remedies and astrological solutions for harmony and prosperity.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Crystal Ball", 
          image: "/Group 13385.png", 
          description: "The crystal ball reveals hidden truths, offering glimpses into past, present, and future.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Kundli Dosh", 
          image: "/Group 13386.png", 
          description: "Identifying planetary imbalances in your birth chart and providing remedies.", 
          link: "/call-with-astrologer"
        },
        {
          name: "Matrimony",
          image: "/Gun Milan.svg",
          description: "Astrology insights for a destined union, ensuring harmony, compatibility, and lifelong happiness.",
          link: "/call-with-astrologer"
        },
        { 
          name: "Palm Reading", 
          image: "/Group 13387.png", 
          description: "Decoding the life moments in your hands, guiding you towards true potential.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Name Analysis", 
          image: "/Group 13396.png", 
          description: "Your name carries hidden energies that influence your destiny.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Festivals", 
          image: "/Group 13395.png", 
          description: "Understanding celestial influences in festivals to align with cosmic energies.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Card Reading", 
          image: "/Group 13394.png", 
          description: "Unlocking the mysteries of fate through Card interpretations.", 
          link: "/call-with-astrologer"
        },
        { 
          name: "Year Analysis", 
          image: "/Group 13393.png", 
          description: "Astrological insights into major life themes and challenges for the year ahead.", 
          link: "/call-with-astrologer"
        }
      ];

      const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
      
    return (
      <section className="bg-[#FFFDF9] w-full min-h-screen">
        {/* Hero Section */}
        <motion.div
          className="relative bg-cover bg-center py-16 sm:py-24 lg:py-32 overflow-hidden"
          style={{ backgroundImage: "url('/service.png')" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          
          <div className="section-container relative z-10 flex flex-col items-center">
            <motion.h1 
              className="text-center text-white text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              style={{ fontFamily: "'EB Garamond', serif" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Our Services
            </motion.h1>
            <motion.p
              className="mt-6 text-white/80 text-lg sm:text-xl max-w-2xl text-center font-medium"
              style={{ fontFamily: 'Poppins' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Guiding your life's path through cosmic wisdom and ancient astrological insights.
            </motion.p>
          </div>
          
          {/* Scroll nudge */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
              <motion.div 
                className="w-1.5 h-2.5 bg-white/60 rounded-full"
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="section-container py-16 sm:py-20 lg:py-24">
          {/* Featured Services */}
          <SectionHeader 
            tag="Direct Consultations"
            title="Featured Offerings"
            subtitle="Get instant access to our most popular tools and expert consultations."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-20">
            {/* Free Kundli Generator Card */}
            <FeaturedCard 
              icon="/Kundli Generator icon.svg"
              title="Free Kundli Generator"
              description="Generate your complete birth chart (Kundli) with planetary positions, doshas, remedies, and detailed analysis."
              buttonText="Generate Kundli"
              href="/free-kundli"
              delay={0.1}
            />

            {/* Horoscope Card */}
            <FeaturedCard 
              icon="/daily-horoscope-.svg"
              title="Daily Horoscope"
              description="Get personalized daily, weekly, monthly, and yearly horoscopes based on your zodiac sign with cosmic guidance."
              buttonText="Read Horoscope"
              href="/services/horoscope"
              delay={0.2}
            />

            {/* Gun Milan Card */}
            <FeaturedCard 
              icon="/Gun Milan (1).svg"
              title="Gun Milan"
              description="Traditional Vedic astrology compatibility analysis for marriage. Calculate 36-point Gun Milan score with detailed insights."
              buttonText="Calculate Now"
              href="/services/gun-milan"
              delay={0.3}
            />
          </div>

          {/* Explore More Services */}
          <SectionHeader 
            tag="Specialized Services"
            title="Explore More Services"
            subtitle="Discover our comprehensive range of astrology and spiritual services tailored for every life challenge."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
            {services.map((service, index) => (
              <ServiceCard 
                key={index}
                service={service}
                delay={index * 0.05}
              />
            ))}
          </div>
  
          {/* Enhanced Call to Action */}
          <motion.div 
            className="premium-surface py-12 sm:py-16 md:py-20 px-6 sm:px-12 text-center rounded-[2.5rem] relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
                <Image src="/sobhagya-logo.svg" alt="Watermark" fill className="object-contain p-20 animate-rotate-slow" />
            </div>
            
            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="section-heading mb-6 text-[#745802]">Ready to find clarity?</h2>
              <p className="text-gray-600 text-lg sm:text-xl mb-10 leading-relaxed font-medium" style={{ fontFamily: 'Poppins' }}>
                Get expert astrology guidance tailored to your needs. Whether it's Kundli analysis, love compatibility, or career advice, our top astrologers are ready to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/call-with-astrologer" className="w-full sm:w-auto group">
                  <motion.button
                    className="w-full inline-flex items-center justify-center gap-3 btn-primary py-4 px-10 rounded-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PhoneIcon className="w-5 h-5 group-hover:animate-pulse" />
                    Talk to Astrologer
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/call-with-astrologer" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full inline-flex items-center justify-center btn-secondary py-4 px-10 rounded-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Experts
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
}

function FeaturedCard({ icon, title, description, buttonText, href, delay }: any) {
    return (
      <motion.div
        className="group p-8 border border-orange-100/50 rounded-[2rem] flex flex-col items-center text-center premium-surface hover:shadow-premium transition-all duration-500 hover:-translate-y-2"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
      >
        <div className="w-20 h-20 bg-orange-100/40 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
          <Image src={icon} alt={title} width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1" style={{ fontFamily: 'Poppins' }}>
          {description}
        </p>
        <Link href={href} className="w-full">
            <button className="w-full btn-ghost border-2 border-orange-200 py-3 rounded-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 font-bold">
                {buttonText}
            </button>
        </Link>
      </motion.div>
    );
}

function ServiceCard({ service, delay }: any) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="group p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform duration-500">
          <img
            src={encodeURI(service.image || "/default-image.png")}
            alt={service.name}
            className="w-10 h-10 object-contain"
            loading="lazy"
          />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
          {service.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
          {service.description}
        </p>
        <Link href={service.link} className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1">
          Explore <ArrowRight className="w-3 h-3" />
        </Link>
      </motion.div>
    );
}
