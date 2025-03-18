import React from "react";
import AstrologerCard from "./AstrologerCard";

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
  astrologers: Astrologer[];
}

export default function AstrologerList({ astrologers }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {astrologers.map((ast) => (
        <AstrologerCard key={ast.ID} astrologer={ast} />
      ))}
    </div>
  );
}
