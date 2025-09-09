"use client";

import React, { useState } from "react";
import { Search, ChevronDown, XCircle } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  selectedSort: string;
  selectedLanguage: string;
  onSearchClick: (query: string) => void;
  onSortChange: (sort: { type: string; language?: string }) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  selectedSort,
  selectedLanguage,
  onSearchClick,
  onSortChange,
  onClearFilters,
  isLoading
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = () => {
    onSearchClick(localQuery);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center w-full">
      {/* 🔎 Search */}
      <div className="flex w-full lg:w-auto items-center gap-2 border border-gray-300 rounded-full px-4 py-2.5 bg-white shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search astrologers..."
          className="flex-1 outline-none bg-transparent text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="ml-2 p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* 🎧 Audio & 🎥 Video Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onSortChange({ type: "audio" })}
          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            selectedSort === "audio"
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-300"
          }`}
        >
          Audio
        </button>
        <button
          onClick={() => onSortChange({ type: "video" })}
          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            selectedSort === "video"
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-300"
          }`}
        >
          Video
        </button>
      </div>

      {/* 🌍 Language Dropdown */}
      <div className="relative group">
        <button
          className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            selectedSort === "language"
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-300"
          }`}
        >
          Language <ChevronDown className="w-4 h-4" />
        </button>

        {/* Hover dropdown */}
        <div className="absolute hidden group-hover:flex flex-col mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {["All", "Hindi", "English", "Marathi", "Punjabi", "Gujarati"].map((lang) => (
            <button
              key={lang}
              onClick={() =>
                onSortChange({ type: "language", language: lang })
              }
              className={`px-4 py-2 text-left text-sm hover:bg-orange-100 transition-colors ${
                selectedLanguage === lang ? "font-semibold text-orange-600 bg-orange-50" : ""
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* ❌ Clear Filters */}
      <button
        onClick={onClearFilters}
        className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-all"
      >
        <XCircle className="w-4 h-4" />
        Clear
      </button>
    </div>
  );
};

export default FilterBar;
