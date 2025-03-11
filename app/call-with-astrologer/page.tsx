'use client';

import Image from 'next/image';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';

const astrologers = [
  {
    id: 1,
    name: 'Pt. Shashtri Ji',
    expertise: 'Kp, Vedic, Vastu',
    experience: '2 years',
    language: 'Hindi',
    image: '/image (11).png',
  },
  {
    id: 2,
    name: 'Sahil Mehta',
    expertise: 'Tarot reading, Pranic healing',
    experience: '2 years',
    language: 'Hindi',
    image: '/Sahil-Mehta.png',
  },
  {
    id: 3,
    name: 'Acharaya Ravi',
    expertise: 'Vedic, Vastu',
    experience: '2 years',
    language: 'Hindi',
    image: '/Acharya-Ravi.png',
  },
  {
    id: 4,
    name: 'Naresh',
    expertise:'Tarot reading, Vedic, Ep',
    experience: '2 years',
    language: 'Hindi',
    image: '/Naresh.png',
  }
];

const Loader = () => (
  <div className="flex items-center justify-center h-20">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#F7971E] border-solid"></div>
  </div>
);

interface Astrologer {
  id: number;
  name: string;
  expertise: string;
  experience: string;
  language: string;
  image: string;
}

const AstrologerCard = ({ astrologer }: { astrologer: Astrologer }) => {
  return (
    <div className="border border-[#F7971E] rounded-lg p-4 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-amber-300 bg-red-50 flex items-center justify-center">
        {astrologer.image ? (
          <Image src={astrologer.image} alt={astrologer.name} width={96} height={96} className="object-cover" />
        ) : (
          <div className="w-full h-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-800 text-xs">Photo</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg">{astrologer.name}</h3>
      <p className="text-sm text-gray-500">{astrologer.language}</p>
      <p className="text-xs text-gray-600 mt-1">{astrologer.expertise}</p>
      <p className="text-xs text-gray-600 mt-1">Exp: {astrologer.experience}</p>
     
      <Link href="/call1" className="mt-3 bg-[#F7971E] text-black text-xs py-2 px-4 rounded font-poppins w-full">
        OFFER: FREE 1st call
      </Link>
      
    </div>
  );
};

const AstrologerCallPage = () => {
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  const displayedAstrologers = showMore ? [...astrologers, ...astrologers] : astrologers;

  return (
    <div className="w-full bg-white">
      {/* Header banner */}
      <div className="relative h-[178px] overflow-hidden mb-6">
        <div className="absolute inset-0 w-full h-[178px]">
          <Image src="/call.png" alt='call-image' layout="fill" objectFit="cover" />
        </div>
        <div className="relative flex items-center justify-center h-full bg-black/40">
          <h1 className="text-white text-7xl md:text-7xl sm:text-mx-auto font-bold" style={{ fontFamily: 'EB Garamond' }}>
            Call with Astrologer
          </h1>
        </div>
      </div>

      {/* Introduction text */}
      <div className="max-w-3xl mx-auto px-4 py-4 text-center mb-6">
        <p className="text-[#373737] text-sm mb-3 font-poppins">
          Our astrology experts are ready to assist you! Whether you need a consultation or have inquiries, get immediate
          answers to your life's questions.
        </p>
        <p className="text-gray-700 text-sm">
          <span className="font-medium">Connect with skilled Astrologers</span> for personalized insights on love, career, health, and beyond.
        </p>
      </div>

      {/* Astrologers grid with loader */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayedAstrologers.map((astrologer, index) => (
              <AstrologerCard key={`${astrologer.id}-${index}`} astrologer={astrologer} />
            ))}
          </div>
        )}

        {/* Show more button */}
        {!loading && (
          <div className="text-right mt-4">
            <button className="text-amber-500 font-medium text-sm" onClick={() => setShowMore(!showMore)}>
              {showMore ? "Show less..." : "Show more..."}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstrologerCallPage;
