'use client';

import Image from 'next/image'
import { useEffect, useState } from 'react';

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
          link: "#", 
          highlighted: true 
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
        {/* Background Image for Heading */}
        <div
          className="relative bg-cover bg-center py-16 sm:py-20"
          style={{ backgroundImage: "url('/service.png')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <h2 className="relative text-center text-white text-3xl sm:text-5xl lg:text-6xl font-bold">
            Our Services
          </h2>
        </div>
  
        <div className="w-full mx-auto px-4">
          <p className="text-center text-[#373737] text-base sm:text-lg font-light max-w-4xl mx-auto mt-6 sm:mt-8 mb-8">
            Get expert astrology insights with Kundli analysis, love & marriage compatibility, career guidance, financial astrology, and health predictions. 
            Explore palmistry, numerology, tarot, face reading, and Vastu Shastra for deeper understanding.
          </p>
  
          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className={`p-6 border-2 border-[#F7971D] rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  service.highlighted ? "bg-[#F7971D] text-white [&_a]:text-white" : "bg-white hover:shadow-lg"
                }`}
              >
                <Image src={service.image || "/default-image.png"} alt={service.name} width={61} height={61} />
                <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                <p className="text-sm mt-1">{service.description}</p>
                <a href={service.link} className="text-[#F7971D] font-medium mt-2 block">
                  ...see more
                </a>
              </div>
            ))}
          </div>
  
          {/* Call to Action */}
          <div className="bg-orange-50 py-16 sm:py-20 mt-12 mb-20 text-center px-4 sm:px-6 w-full">
            <div className="max-w-4xl mx-auto">
              <p className="text-[#745802] text-base sm:text-lg font-light">
                Get expert astrology guidance tailored to your needs! Whether it's Kundli analysis, love compatibility, career advice, or powerful remedies, our top astrologers are ready to help.
              </p>
              <p className="text-[#F7971D] font-semibold text-lg mt-3">
                Book your consultation now via chat, call, or video and take the first step toward clarity and success!
              </p>
              <button className="mt-6 bg-white text-[#F7971D] py-3 sm:py-4 px-8 sm:px-16 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:bg-orange-600 hover:text-white transition">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>
    );
}
