"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, XCircle, Headphones, Video, Globe, Check } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  selectedSort: string;
  selectedLanguage: string;
  onSearchClick: (query: string) => void;
  onSortChange: (sort: { type: string; language?: string }) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

const LANGUAGES = ["All", "Hindi", "English", "Marathi", "Punjabi", "Gujarati"];

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  selectedSort,
  selectedLanguage,
  onSearchClick,
  onSortChange,
  onClearFilters,
  isLoading,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [langOpen, setLangOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFiredRef = useRef<string>(searchQuery);
  const langRef = useRef<HTMLDivElement | null>(null);

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

  // Close language dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const handleSearch = () => {
    const trimmed = localQuery.trim();
    lastFiredRef.current = trimmed;
    onSearchClick(trimmed);
  };

  const hasActiveFilter =
    selectedSort === "audio" ||
    selectedSort === "video" ||
    (selectedLanguage && selectedLanguage !== "All") ||
    localQuery.trim().length > 0;

  const isAudio = selectedSort === "audio";
  const isVideo = selectedSort === "video";
  const isLang = selectedSort === "language" || (selectedLanguage && selectedLanguage !== "All");

  const activeChip =
    "text-white shadow-[0_6px_16px_rgba(247,151,30,0.35)] scale-[1.02] border-transparent";
  const activeChipStyle = {
    background: "linear-gradient(135deg, #F9A43A 0%, #F7941D 100%)",
  } as const;
  const idleChip =
    "bg-white text-gray-700 hover:bg-[#FFF9F0] hover:text-[#E65C00] border border-orange-200/60";

  return (
    <div className="relative z-[95] w-full">
      <div
        className="relative overflow-visible rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 flex flex-col lg:flex-row lg:flex-wrap lg:items-center gap-3 sm:gap-4 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #FDF8F0 0%, #FFFFFF 50%, #FFF9F0 100%)",
          boxShadow:
            "0 10px 40px -10px rgba(247,148,29,0.15), inset 0 0 0 1px rgba(247,148,29,0.15)",
        }}
      >
        {/* Subtle sunburst overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-[2rem] pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sunburst" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#F7941D" />
                <path d="M20 0v10M20 30v10M0 20h10M30 20h10M6 6l5 5M29 29l5 5M34 6l-5 5M11 29l-5 5" stroke="#F7941D" strokeWidth="0.5" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sunburst)" />
          </svg>
        </div>

        {/* Search — always full-width on mobile, flexible on desktop */}
        <div
          className="relative z-10 flex w-full lg:flex-1 lg:max-w-md items-center gap-2 sm:gap-3 rounded-full pl-4 sm:pl-5 pr-1.5 py-1.5 bg-white shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-orange-200 transition-all duration-300 group"
          style={{ border: "1px solid rgba(247,148,29,0.2)" }}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#F7941D]/60 group-focus-within:text-[#F7941D] transition-colors flex-shrink-0" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search astrologers..."
            className="flex-1 min-w-0 outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 font-medium"
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery("")}
              aria-label="Clear search"
              className="p-1 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            aria-label="Search"
            className="ml-0.5 p-2 sm:p-2.5 rounded-full text-white shadow-[0_4px_12px_rgba(247,148,29,0.3)] hover:shadow-[0_6px_16px_rgba(247,148,29,0.4)] active:scale-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F9A43A 0%, #F7941D 100%)" }}
          >
            <Search className="w-4 h-4 text-white relative z-10" strokeWidth={2.5} />
          </button>
        </div>

        {/* Chip row — single row on mobile, wraps on desktop */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Audio */}
          <button
            onClick={() => onSortChange({ type: "audio" })}
            aria-pressed={isAudio}
            className={`flex-1 lg:flex-none px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
              isAudio ? activeChip : idleChip
            }`}
            style={isAudio ? activeChipStyle : undefined}
          >
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            Audio
          </button>

          {/* Video */}
          <button
            onClick={() => onSortChange({ type: "video" })}
            aria-pressed={isVideo}
            className={`flex-1 lg:flex-none px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
              isVideo ? activeChip : idleChip
            }`}
            style={isVideo ? activeChipStyle : undefined}
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            Video
          </button>

          {/* Language — controlled popover, works on touch */}
          <div className="relative flex-1 lg:flex-none" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className={`w-full lg:min-w-[150px] flex items-center justify-between gap-2 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 ${
                isLang ? activeChip : idleChip
              }`}
              style={isLang ? activeChipStyle : undefined}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <Globe className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isLang ? "text-white" : "text-[#F7941D]"}`} strokeWidth={2.5} />
                <span className="truncate">{!selectedLanguage || selectedLanguage === "All" ? "Language" : selectedLanguage}</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 flex-shrink-0 ${langOpen ? "rotate-180" : ""} ${isLang ? "text-white" : "text-[#F7941D]"}`}
              />
            </button>

            {langOpen && (
              <>
                {/* Backdrop on mobile for tap-to-close UX */}
                <div
                  onClick={() => setLangOpen(false)}
                  className="lg:hidden fixed inset-0 z-[98] bg-black/10"
                  aria-hidden
                />
                <div
                  role="listbox"
                  aria-label="Select language"
                  className="absolute top-[calc(100%+8px)] left-0 right-0 lg:right-auto lg:min-w-[220px] z-[99] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-fadeInDown border border-orange-100"
                  style={{ border: "1px solid rgba(247,148,29,0.2)" }}
                >
                  {LANGUAGES.map((lang) => {
                    const active = selectedLanguage === lang;
                    return (
                      <button
                        key={lang}
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onSortChange({ type: "language", language: lang });
                          setLangOpen(false);
                        }}
                        className={`relative px-5 py-3 text-left text-sm transition-colors duration-200 border-b border-gray-50 last:border-0 w-full flex items-center justify-between ${
                          active ? "bg-orange-50" : "hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`transition-all duration-200 ${
                            active
                              ? "font-bold text-[#F7941D]"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {lang}
                        </span>
                        {active && <Check className="w-4 h-4 text-[#F7941D]" strokeWidth={3} />}
                        {active && (
                          <div className="absolute left-0 top-[20%] bottom-[20%] w-1 rounded-r-full bg-gradient-to-b from-[#F9A43A] to-[#F7971E]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Clear — icon-only on mobile (when filters active), full pill on desktop */}
        {hasActiveFilter && (
          <button
            onClick={onClearFilters}
            aria-label="Clear all filters"
            className="relative z-10 flex lg:ml-auto items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#FFF5F5] text-red-500 hover:bg-[#FFEBEB] border border-red-200 transition-all duration-300 hover:shadow-md hover:shadow-red-500/10 active:scale-95 group w-full lg:w-auto"
          >
            <XCircle className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
