"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFiredRef = useRef<string>(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
    lastFiredRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = localQuery.trim();
      if (trimmed === lastFiredRef.current.trim()) return;
      lastFiredRef.current = trimmed;
      onSearchClick(trimmed);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, onSearchClick]);

  const handleSearch = () => {
    const trimmed = localQuery.trim();
    lastFiredRef.current = trimmed;
    onSearchClick(trimmed);
  };

  return (
    <div className="relative z-[60] w-full">
      {/* Devotional / Astrology Themed Container */}
      <div 
        className="w-full relative overflow-visible rounded-[2rem] p-3 sm:p-5 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4 items-stretch sm:items-center transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 50%, #FFF5E6 100%)",
          boxShadow: "0 10px 40px -10px rgba(247,151,30,0.15), inset 0 0 0 1px rgba(247,151,30,0.15)",
        }}
      >
        {/* Subtle decorative background accent (Mandala/Sunburst hint) */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sunburst" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#F7971E" />
                <path d="M20 0v10M20 30v10M0 20h10M30 20h10M6 6l5 5M29 29l5 5M34 6l-5 5M11 29l-5 5" stroke="#F7971E" strokeWidth="0.5" strokeLinecap="round"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sunburst)" />
          </svg>
        </div>

        {/* 🔎 Search Box */}
        <div className="relative z-10 flex w-full sm:w-auto sm:flex-1 lg:max-w-md items-center gap-3 rounded-full pl-5 pr-1.5 py-1.5 bg-white shadow-sm focus-within:shadow-md transition-all duration-300 group"
          style={{ border: "1px solid rgba(247,151,30,0.2)" }}
        >
          <Search className="w-5 h-5 text-[#F7971E]/60 group-focus-within:text-[#F7971E] transition-colors" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search our divine astrologers..."
            className="flex-1 outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 font-medium"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="ml-1 p-2.5 rounded-full text-white shadow-[0_4px_12px_rgba(247,151,30,0.3)] hover:shadow-[0_6px_16px_rgba(247,151,30,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #F9A43A 0%, #E65C00 100%)",
            }}
          >
            <Search className="w-4 h-4 text-white relative z-10" />
            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* 🎧 Audio & 🎥 Video Filters */}
        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => onSortChange({ type: "audio" })}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedSort === "audio"
                ? "text-white shadow-[0_6px_16px_rgba(247,151,30,0.35)] scale-[1.02]"
                : "bg-white text-gray-600 hover:bg-[#FFF9F0] hover:text-[#E65C00]"
            }`}
            style={selectedSort === "audio" 
              ? { background: "linear-gradient(135deg, #F9A43A 0%, #F7971E 100%)" } 
              : { border: "1px solid rgba(247,151,30,0.3)" }
            }
          >
            Audio
          </button>
          <button
            onClick={() => onSortChange({ type: "video" })}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedSort === "video"
                ? "text-white shadow-[0_6px_16px_rgba(247,151,30,0.35)] scale-[1.02]"
                : "bg-white text-gray-600 hover:bg-[#FFF9F0] hover:text-[#E65C00]"
            }`}
             style={selectedSort === "video" 
              ? { background: "linear-gradient(135deg, #F9A43A 0%, #F7971E 100%)" } 
              : { border: "1px solid rgba(247,151,30,0.3)" }
            }
          >
            Video
          </button>
        </div>

        {/* 🌍 Language Dropdown */}
        <div className="relative z-[70] group flex-1 sm:flex-none">
          <button
            className={`w-full sm:min-w-[150px] flex items-center justify-between gap-3 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
              selectedSort === "language" || selectedLanguage !== "All"
                ? "text-white shadow-[0_6px_16px_rgba(247,151,30,0.35)]"
                : "bg-white text-gray-600 hover:bg-[#FFF9F0] hover:text-[#E65C00]"
            }`}
             style={(selectedSort === "language" || selectedLanguage !== "All")
              ? { background: "linear-gradient(135deg, #F9A43A 0%, #F7971E 100%)" } 
              : { border: "1px solid rgba(247,151,30,0.3)" }
            }
          >
            <span>{selectedLanguage === "All" ? "Language" : selectedLanguage}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-180 ${
              selectedSort === "language" || selectedLanguage !== "All" 
                ? "text-white" 
                : "text-[#F7971E]"
            }`} />
          </button>

          {/* Majestic Glowing Dropdown Menu */}
          <div className="absolute top-[110%] pt-2 left-0 hidden group-hover:flex flex-col w-full min-w-[200px] z-[80]">
            <div 
              className="bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden transform opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_15px_40px_rgba(247,151,30,0.15)]"
              style={{ border: "1px solid rgba(247,151,30,0.2)" }}
            >
              {["All", "Hindi", "English", "Marathi", "Punjabi", "Gujarati"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => onSortChange({ type: "language", language: lang })}
                  className="relative px-6 py-3.5 text-left text-sm transition-colors duration-200 border-b border-[#F7971E]/10 last:border-0 w-full group/item"
                >
                  <span className={`block transition-all duration-200 ${
                    selectedLanguage === lang 
                      ? "font-bold text-[#E65C00] translate-x-1" 
                      : "font-medium text-gray-600 group-hover/item:text-[#F7971E] group-hover/item:translate-x-1"
                  }`}>
                    {lang}
                  </span>
                  
                  {/* Subtle active indicator pill */}
                  {selectedLanguage === lang && (
                    <div className="absolute left-0 top-[15%] bottom-[15%] w-1 rounded-r-full bg-gradient-to-b from-[#F9A43A] to-[#F7971E]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ❌ Clear Filters */}
        <button
          onClick={onClearFilters}
          className="flex lg:ml-auto items-center justify-center sm:justify-start gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#FFF5F5] text-red-500 hover:bg-[#FFEBEB] border border-red-200 transition-all duration-300 hover:shadow-md hover:shadow-red-500/10 active:scale-95 group"
        >
          <XCircle className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
          Clear
        </button>
        
      </div>
    </div>
  );
};

export default FilterBar;
