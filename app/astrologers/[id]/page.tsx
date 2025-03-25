"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Update interface based on the actual API response structure
interface Astrologer {
  _id: string;
  name: string;
  languages?: string[];
  specializations?: string[];
  experience?: string;
  callsCount?: number;
  rating?: number;
  reviews?: Array<{ content: string; userId: string; rating: number }>;
  profileImage?: string;
  about?: string;
  isOnline?: boolean;
}

// Correct type definition for page props
interface PageProps {
  params: {
    id: string;
  };
}

export default function AstrologerDetailsPage({
  params,
}: PageProps) {
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAstrologer() {
      const { id } = params;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://micro.sobhagya.in';
      const authToken = process.env.NEXT_PUBLIC_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmM1YjBiNWRmMDczYTEwNjZiNmU0NTQiLCJpYXQiOjE3MjY0NzM1MTMsImV4cCI6MTcyNjQ3NDQxM30.e6R7FyWux3eTDafvBDQmcgVjz1fWiUAxo4_PCT6dLHQ';
      
      try {
        const res = await fetch(`${apiUrl}/user/api/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error(`Failed to fetch astrologer: ${res.status}`);
        }
        
        const data = await res.json();
        setAstrologer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }

    fetchAstrologer();
  }, [params.id]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!astrologer) {
    return <div className="text-center">Loading...</div>;
  }

  // Destructure properties safely
  const {
    name,
    languages = [],
    specializations = [],
    experience = "Not specified",
    callsCount = 0,
    rating = 0,
    reviews = [],
    profileImage = "/default-profile.png",
    about = "No information available.",
    isOnline = false,
  } = astrologer;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow p-6">
        {/* Back button */}
        <Link 
          href="/astrologers"
          className="mb-4 flex items-center text-orange-500 hover:text-orange-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Astrologers
        </Link>
        
        {/* Rest of the component remains the same as in the previous example */}
        {/* ... */}
      </div>
    </div>
  );
}

// StartCallButton component remains the same
function StartCallButton({ 
  astrologerId, 
  astrologerName, 
  isOnline 
}: { 
  astrologerId: string, 
  astrologerName: string,
  isOnline: boolean
}) {
  const handleStartCall = () => {
    if (!isOnline) {
      alert("This astrologer is currently offline. Please try again later.");
      return;
    }
    
    console.log(`Starting call with ${astrologerName} (ID: ${astrologerId})`);
  };

  return (
    <button 
      onClick={handleStartCall}
      className={`w-full py-3 rounded-md font-semibold transition ${
        isOnline 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
      }`}
      aria-label={`Start a call with ${astrologerName}`}
      disabled={!isOnline}
    >
      {isOnline ? "Start Call for FREE" : "Astrologer Offline"}
    </button>
  );
}