'use client';

import Image from 'next/image'
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Services() {
    const services = [
        { 
          name: "Birth Journal", 
          image: "/Group 13384.png", 
          description: "Your birth journal is a cosmic blueprint, revealing the celestial influences that shape your destiny.", 
          link: "#" 
        },
        { 
          name: "Vastu Shastra", 
          image: "/Group 13383.png", 
          description: "Vastu harmonizes cosmic energies with your surroundings, creating a balanced environment.", 
          link: "#" 
        },
        { 
          name: "Face Reading", 
          image: "/Group 13382.png", 
          description: "Your face is a mirror of destiny, revealing secrets about your personality and future.", 
          link: "#"
        },
        { 
          name: "Lal Kitab", 
          image: "/Group 13388.png", 
          description: "Powerful remedies and astrological solutions for harmony and prosperity.", 
          link: "#" 
        },
        { 
          name: "Crystal Ball", 
          image: "/Group 13385.png", 
          description: "The crystal ball reveals hidden truths, offering glimpses into past, present, and future.", 
          link: "#" 
        },
        { 
          name: "Kundli Dosh", 
          image: "/Group 13386.png", 
          description: "Identifying planetary imbalances in your birth chart and providing remedies.", 
          link: "#" 
        },
        { 
          name: "Matrimony", 
          image: "/Group 13367.png", 
          description: "Astrology insights for a destined union, ensuring harmony, compatibility, and lifelong happiness.", 
          link: "#" 
        },
        { 
          name: "Palm Reading", 
          image: "/Group 13387.png", 
          description: "Decoding the life moments in your hands, guiding you towards true potential.", 
          link: "#" 
        },
        { 
          name: "Name Analysis", 
          image: "/Group 13396.png", 
          description: "Your name carries hidden energies that influence your destiny.", 
          link: "#" 
        },
        { 
          name: "Festivals", 
          image: "/Group 13395.png", 
          description: "Understanding celestial influences in festivals to align with cosmic energies.", 
          link: "#" 
        },
        { 
          name: "Tarot Reading", 
          image: "/Group 13394.png", 
          description: "Unlocking the mysteries of fate through tarot interpretations.", 
          link: "#" 
        },
        { 
          name: "Year Analysis", 
          image: "/Group 13393.png", 
          description: "Astrological insights into major life themes and challenges for the year ahead.", 
          link: "#" 
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
      <section className="bg-white w-full">
        {/* Enhanced Background Image for Heading with Animations */}
        <motion.div
          className="relative bg-cover bg-center py-16 sm:py-20 overflow-hidden"
          style={{ backgroundImage: "url('/service.png')" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <motion.h2 
            className="relative text-center text-white text-3xl sm:text-5xl lg:text-6xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Our Services
          </motion.h2>
        </motion.div>
  
        <div className="w-full mx-auto px-4">
          <motion.p 
            className="text-center text-[#373737] text-base sm:text-lg font-light max-w-4xl mx-auto mt-6 sm:mt-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Get expert astrology insights with Kundli analysis, love & marriage compatibility, career guidance, financial astrology, and health predictions. 
            Explore palmistry, numerology, tarot, face reading, and Vastu Shastra for deeper understanding.
          </motion.p>
  
          {/* Enhanced Services Grid with Animations */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="group p-6 border-2 border-[#F7971D] rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer bg-white hover:bg-[#F7971D] hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="relative w-[61px] h-[61px] flex items-center justify-center">
                  <Image 
                    src={service.image || "/default-image.png"} 
                    alt={service.name} 
                    width={61} 
                    height={61}
                    className="transition-all duration-300 group-hover:opacity-0"
                  />
                  {/* Color-swapped version shown on hover */}
                  <Image 
                    src={service.image || "/default-image.png"} 
                    alt={service.name} 
                    width={61} 
                    height={61}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      filter: 'invert(1) sepia(1) saturate(5) hue-rotate(15deg)',
                    }}
                  />
                </div>
                <h3 className="text-lg font-semibold mt-2 text-gray-800 group-hover:text-white transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm mt-1 text-gray-600 group-hover:text-white transition-colors">
                  {service.description}
                </p>
                <a href={service.link} className="text-[#F7971D] font-medium mt-2 block group-hover:text-white transition-colors">
                  ...see more
                </a>
              </motion.div>
            ))}
          </motion.div>
  
          {/* Enhanced Call to Action with Animation */}
          <motion.div 
            className="bg-orange-50 py-16 sm:py-20 mt-12 mb-20 text-center px-4 sm:px-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.0 }}
          >
            <div className="max-w-4xl mx-auto">
              <motion.p 
                className="text-[#745802] text-base sm:text-lg font-light"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.1 }}
              >
                Get expert astrology guidance tailored to your needs! Whether it's Kundli analysis, love compatibility, career advice, or powerful remedies, our top astrologers are ready to help.
              </motion.p>
              <motion.p 
                className="text-[#F7971D] font-semibold text-lg mt-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.2 }}
              >
                Book your consultation now via chat, call, or video and take the first step toward clarity and success!
              </motion.p>
              <motion.button 
                className="mt-6 bg-white text-[#F7971D] py-3 sm:py-4 px-8 sm:px-16 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:bg-orange-600 hover:text-white transition"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    );
}
