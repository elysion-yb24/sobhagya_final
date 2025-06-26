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
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-6 mb-8 shadow-sm sticky top-4 z-10">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search astrologers by name or specialization..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            onFocus={(e) => {
              e.target.style.borderColor = '#F7971E';
              e.target.style.boxShadow = '0 0 0 2px rgba(247, 151, 30, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg py-3 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 min-w-[120px]"
              onFocus={(e) => {
                e.target.style.borderColor = '#F7971E';
                e.target.style.boxShadow = '0 0 0 2px rgba(247, 151, 30, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
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
              className="appearance-none border border-gray-300 rounded-lg py-3 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 min-w-[140px]"
              onFocus={(e) => {
                e.target.style.borderColor = '#F7971E';
                e.target.style.boxShadow = '0 0 0 2px rgba(247, 151, 30, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
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
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-105 ${
              videoValue
                ? "text-white shadow-md"
                : "border border-gray-300 text-gray-700 bg-gray-50 hover:bg-white"
            }`}
            style={videoValue ? { backgroundColor: '#F7971E' } : {}}
            onMouseEnter={(e) => {
              if (videoValue) {
                e.currentTarget.style.backgroundColor = '#E8850B';
              }
            }}
            onMouseLeave={(e) => {
              if (videoValue) {
                e.currentTarget.style.backgroundColor = '#F7971E';
              }
            }}
          >
            📹 Video Available
          </button>
        </div>
      </div>
    </div>
  );
}
