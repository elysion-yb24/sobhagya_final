"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Define the Astrologer type
interface Astrologer {
  _id: string;
  name: string;
  languages?: string[];
  specializations?: string[];
  experience?: string;
  callsCount?: number;
  rating?: number;
  profileImage?: string;
  isOnline?: boolean;
}

export default function AstrologersListPage() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAstrologers() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://micro.sobhagya.in";
      const storedToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
  
      if (!storedToken) {
        setError("Authorization token is missing.");
        setIsLoading(false);
        return;
      }
  
      try {
        setIsLoading(true);
        const res = await fetch(`${apiUrl}/user/api/users?skip=${page * 10}&limit=10`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });
  
        if (res.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token.");
        }
  
        if (!res.ok) {
          throw new Error(`Failed to fetch astrologers: ${res.status} ${res.statusText}`);
        }
  
        const data = await res.json();
        if (data.length === 0) {
          setHasMore(false);
        }
  
        setAstrologers((prev) => (page === 0 ? data : [...prev, ...data]));
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setIsLoading(false);
      }
    }
  
    fetchAstrologers();
  }, [page]);
  

  const loadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center p-6">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Our Astrologers</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {astrologers.map((astrologer) => (
            <AstrologerCard key={astrologer._id} astrologer={astrologer} />
          ))}
        </div>

        {isLoading && (
          <div className="text-center mt-6">
            <p>Loading more astrologers...</p>
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition"
            >
              Load More
            </button>
          </div>
        )}

        {!hasMore && astrologers.length > 0 && (
          <div className="text-center mt-6 text-gray-500">No more astrologers to load</div>
        )}
      </div>
    </div>
  );
}

// Astrologer Card Component
function AstrologerCard({ astrologer }: { astrologer: Astrologer }) {
  const {
    _id,
    name,
    languages = [],
    specializations = [],
    experience = "Not specified",
    callsCount = 0,
    rating = 0,
    profileImage = "/default-profile.png",
    isOnline = false,
  } = astrologer;

  return (
    <Link href={`/astrologer?id=${_id}`} className="block">
      <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition ${isOnline ? "border-2 border-green-500" : "border-2 border-gray-200"}`}>
        <div className="flex items-center mb-4">
          <Image src={profileImage} alt={name} width={80} height={80} className="rounded-full mr-4" />
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-600">{experience} years experience</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="mr-2">📞 {callsCount} Calls</span>
            <span>⭐ {rating.toFixed(1)}</span>
            {isOnline && (
              <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                Online
              </span>
            )}
          </div>

          {specializations && specializations.length > 0 && (
            <div className="text-sm text-gray-600">
              Specialties: {specializations.slice(0, 3).join(", ")}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
