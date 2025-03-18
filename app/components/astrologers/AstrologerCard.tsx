"use client"; // Because we'll use onClick for navigation in a client component

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Astrologer {
  ID: string;
  Name: string;
  Languages: string[];
  Specializations: string[];
  Experience: string;
  Calls: number;
  Ratings: number;
  "Profile Image": string;
  hasVideo?: boolean;
}

interface Props {
  astrologer: Astrologer;
}

export default function AstrologerCard({ astrologer }: Props) {
  const router = useRouter();

  const {
    ID,
    Name,
    Languages,
    Specializations,
    Experience,
    Calls,
    Ratings,
    "Profile Image": profileImg
  } = astrologer;

  // Navigate to /astrologer/[ID] on entire card click
  const handleCardClick = () => {
    router.push(`/astrologers/${ID}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white shadow rounded-lg p-4 flex flex-col cursor-pointer"
    >
      {/* Top row: image and some text */}
      <div className="flex items-center space-x-3 mb-2">
        <img
          src={profileImg}
          alt={Name}
          className="w-16 h-16 rounded-full border-2 border-green-500 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold">{Name}</h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="text-blue-500 w-4 h-4"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 
              1 0 00-1.414-1.414L9 
              11.586 7.707 
              10.293a1 
              1 0 00-1.414 
              1.414l2 
              2a1 
              1 0 001.414 
              0l4-4z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">{Languages.join(", ")}</p>
          <p className="text-sm text-gray-500">{Specializations.join(", ")}</p>
        </div>
      </div>

      {/* Middle row: status, calls, rating */}
      <div className="flex items-center justify-start space-x-4 mb-3">
        <span className="text-green-600 font-semibold">ONLINE</span>
        <span className="text-gray-500 text-sm">{Calls} orders</span>
        <div className="flex items-center text-sm text-yellow-500">
          {/* Show star icon or rating number */}
          ★ {Ratings.toFixed(1)}
        </div>
      </div>

      {/* Experience & CTA */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-800">Exp: {Experience}</p>

        {/* 
          The CTA should NOT trigger the card onClick navigation to /astrologer/[id]. 
          So we stop event propagation when clicking this button, 
          and navigate to /call-astrologer instead.
        */}
        <Link
  href={`/call-astrologer?id=${ID}`} // Pass astrologer ID in the URL
  onClick={(e) => e.stopPropagation()} // Prevents card click from triggering
  className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-semibold"
>
  OFFER: FREE 1st Call
</Link>

      </div>
    </div>
  );
}
