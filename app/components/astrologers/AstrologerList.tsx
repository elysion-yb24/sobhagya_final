import React from "react";
import AstrologerCard from "./AstrologerCard";

interface Astrologer {
  _id: string;
  name: string;
  languages: string[];
  specializations: string[];
  experience: string;
  callsCount: number;
  rating: number;
  profileImage: string;
  hasVideo?: boolean;
}

interface AstrologerListProps {
  astrologers: Astrologer[];
}

export default function AstrologerList({ astrologers }: AstrologerListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {astrologers.map((ast) => (
        <AstrologerCard key={ast._id} astrologer={ast} />
      ))}
    </div>
  );
}
