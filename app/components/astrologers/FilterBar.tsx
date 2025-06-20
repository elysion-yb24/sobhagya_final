import React from "react";
import { Search, Filter } from "lucide-react";

interface Props {
  searchValue: string;
  onSearchChange: (val: string) => void;
  sortValue: string;
  onSortChange: (val: string) => void;
  languageValue: string;
  onLanguageChange: (val: string) => void;
  languages: string[];
  videoValue: boolean;
  onVideoToggle: (val: boolean) => void;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  languageValue,
  onLanguageChange,
  languages,
  videoValue,
  onVideoToggle
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search astrologers..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="">Sort by</option>
              <option value="experience">Experience</option>
              <option value="rating">Rating</option>
              <option value="calls">Calls</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Language Filter */}
          <div className="relative">
            <select
              value={languageValue}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="appearance-none border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="All">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Video Call toggle */}
          <button
            onClick={() => onVideoToggle(!videoValue)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              videoValue
                ? "bg-orange-500 text-white"
                : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            Video Available
          </button>
        </div>
      </div>
    </div>
  );
}
