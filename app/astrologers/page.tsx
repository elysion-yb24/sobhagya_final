"use client";

import React, { useState, useMemo, useEffect } from "react";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";

interface Astrologer {
  ID: string;
  Name: string;
  Languages: string[];
  Specializations: string[];
  Experience: string; // e.g., "24 years"
  Calls: number;
  Ratings: number;
  "Profile Image": string;
  hasVideo?: boolean;
}

export default function AstrologersPage() {
  const [astrologersData, setAstrologersData] = useState<Astrologer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [videoOnly, setVideoOnly] = useState<boolean>(false);

  // Fetch data from a JSON file in public/
  useEffect(() => {
    const fetchAstrologers = async () => {
      const response = await fetch("/astrologers_data.json");
      const data: Astrologer[] = await response.json();
      setAstrologersData(data);
    };
    fetchAstrologers();
  }, []);

  // Unique languages
  const allLanguages = useMemo(() => {
    const languages = astrologersData.flatMap((ast) => ast.Languages);
    return Array.from(new Set(languages));
  }, [astrologersData]);

  // Filter + sort
  const filteredAstrologers = useMemo(() => {
    let filtered = [...astrologersData];

    // 1) Search by name or specialization
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((ast) => {
        const nameMatch = ast.Name.toLowerCase().includes(lowerQuery);
        const specMatch = ast.Specializations.some((s) =>
          s.toLowerCase().includes(lowerQuery)
        );
        return nameMatch || specMatch;
      });
    }

    // 2) Filter by language
    if (languageFilter !== "All") {
      filtered = filtered.filter((ast) => ast.Languages.includes(languageFilter));
    }

    // 3) Video call
    if (videoOnly) {
      filtered = filtered.filter((ast) => ast.hasVideo === true);
    }

    // 4) Sort
    if (sortBy === "experience") {
      filtered.sort((a, b) => {
        const yearsA = parseInt(a.Experience, 10) || 0;
        const yearsB = parseInt(b.Experience, 10) || 0;
        return yearsB - yearsA;
      });
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.Ratings - a.Ratings);
    } else if (sortBy === "calls") {
      filtered.sort((a, b) => b.Calls - a.Calls);
    }

    return filtered;
  }, [searchQuery, languageFilter, videoOnly, sortBy, astrologersData]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold text-red-600">Astrologers</h1>
        {/* Square wallet container */}
        <div className="border border-yellow-400 rounded-md w-12 h-10  flex items-center justify-center text-yellow-600 font-semibold ">
          ₹0.0
        </div>
      </header>

      {/* Filter Bar */}
      <section className="bg-white py-3 px-4 shadow-sm">
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sortValue={sortBy}
          onSortChange={setSortBy}
          languageValue={languageFilter}
          onLanguageChange={setLanguageFilter}
          languages={allLanguages}
          videoValue={videoOnly}
          onVideoToggle={setVideoOnly}
        />
      </section>

      {/* Main content: Astrologer cards */}
      <main className="flex-1 container mx-auto p-4">
        <AstrologerList astrologers={filteredAstrologers} />
      </main>
    </div>
  );
}
