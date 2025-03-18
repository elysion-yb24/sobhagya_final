import React from "react";

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
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[8rem] max-w-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-2 top-2.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 
            21l-4.35-4.35M16 
            10a6 
            6 0 11-12 
            0 6 
            6 0 0112 
            0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Sort */}
      <div>
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">Sort</option>
          <option value="experience">Experience</option>
          <option value="rating">Rating</option>
          <option value="calls">Calls</option>
        </select>
      </div>

      {/* Language Filter */}
      <div>
        <select
          value={languageValue}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="All">Language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Video Call toggle */}
      <div>
        <button
          onClick={() => onVideoToggle(!videoValue)}
          className={`px-3 py-2 rounded-full text-sm border
            ${
              videoValue
                ? "bg-indigo-500 text-white border-indigo-500"
                : "border-gray-300 text-gray-600 bg-white"
            } focus:outline-none`}
        >
          Video Call
        </button>
      </div>
    </div>
  );
}
