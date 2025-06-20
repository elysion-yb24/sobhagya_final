"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Loader = () => (
  <div className="flex items-center justify-center h-20">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#F7971E] border-solid"></div>
  </div>
);

interface Astrologer {
  id: number;
  name: string;
  expertise?: string;
  experience?: string;
  language?: string;
  image?: string;
  // Additional fields that might come from the API
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

const AstrologerCard = ({ astrologer }: { astrologer: Astrologer }) => (
  <div className="border border-[#F7971E] rounded-lg p-4 flex flex-col items-center text-center shadow-sm transition-all hover:shadow-md">
    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-amber-300 bg-gray-100 flex items-center justify-center">
      {astrologer.image ? (
        <Image src={astrologer.image} alt={astrologer.name} width={112} height={112} className="object-cover" />
      ) : (
        <div className="w-full h-full bg-amber-100 flex items-center justify-center">
          <span className="text-amber-800 text-xs">No Photo</span>
        </div>
      )}
    </div>

    <h3 className="font-semibold text-lg text-gray-900">{astrologer.name}</h3>
    <p className="text-sm text-gray-600">{astrologer.language || "Hindi"}</p>
    <p className="text-xs text-gray-500 mt-1">{astrologer.expertise || "Astrology"}</p>
    <p className="text-xs text-gray-500 mt-1">Exp: {astrologer.experience || "2 years"}</p>

    <Link href="/calls/call1">
      <span className="mt-3 bg-[#F7971E] text-black text-xs py-2 px-4 rounded font-poppins w-full block text-center hover:bg-[#d99845] transition">
        OFFER: FREE 1st call
      </span>
    </Link>
  </div>
);

const AstrologerCallPage = () => {
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch astrologers from API
  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8001/user/api/users?skip=0&limit=10');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Assuming the API returns an array of users or an object with users array
      const users = Array.isArray(data) ? data : data.users || data.data || [];
      
      setAstrologers(users);
    } catch (err) {
      console.error('Error fetching astrologers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch astrologers');
      
      // Fallback to some default data if API fails
      setAstrologers([
        {
          id: 1,
          name: "Pt. Shashtri Ji",
          expertise: "Kp, Vedic, Vastu",
          experience: "2 years",
          language: "Hindi",
          image: "/image (11).png",
        },
        {
          id: 2,
          name: "Sahil Mehta",
          expertise: "Tarot reading, Pranic healing",
          experience: "2 years",
          language: "Hindi",
          image: "/Sahil-Mehta.png",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* Header banner */}
      <div className="relative h-[180px] overflow-hidden mb-6">
        <div className="absolute inset-0 w-full h-[180px]">
          <Image src="/call.png" alt="call-image" layout="fill" objectFit="cover" />
        </div>
        <div className="relative flex items-center justify-center h-full bg-black/50">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "EB Garamond" }}>
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
      <div className="max-w-5xl mx-auto px-4 pb-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-medium">Unable to load astrologers</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchAstrologers}
              className="bg-[#F7971E] text-white px-4 py-2 rounded hover:bg-[#d99845] transition"
            >
              Try Again
            </button>
          </div>
        ) : astrologers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No astrologers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {astrologers.slice(0, showMore ? astrologers.length : 4).map((astrologer, index) => (
              <AstrologerCard key={`${astrologer.id}-${index}`} astrologer={astrologer} />
            ))}
          </div>
        )}

        {/* Show more button */}
        {!loading && !error && astrologers.length > 4 && (
          <div className="text-center mt-6">
            <button
              className="text-[#F7971E] font-medium text-sm hover:text-[#d99845] transition"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Show less..." : "Show more..."}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstrologerCallPage;
