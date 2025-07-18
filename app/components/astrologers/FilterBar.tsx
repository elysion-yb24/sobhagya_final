"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, Star, Clock, MapPin, Languages, Heart, ChevronRight, Check, CreditCard } from 'lucide-react';
import { FilterBarSkeleton } from '../ui/SkeletonLoader';

interface FilterOptions {
  languages: string[];
  specializations: string[];
  experience: string[];
  rating: number[];
}

interface FilterBarProps {
  onSearch: (query: string) => void;
  onSortChange: (sort: { type: 'audio' | 'video' | 'language', language?: string }) => void;
  isLoading?: boolean;
  totalResults?: number;
  searchQuery?: string;
  selectedSort?: 'audio' | 'video' | 'language' | '';
  selectedLanguage?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onSortChange,
  isLoading = false,
  totalResults = 0,
  searchQuery = '',
  selectedSort = '',
  selectedLanguage = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<'audio' | 'video' | 'language' | ''>(selectedSort);
  const [currentLanguage, setCurrentLanguage] = useState<string>(selectedLanguage);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
        setLanguageMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sort selection
  const handleSortSelect = (type: 'audio' | 'video' | 'language') => {
    setSortBy(type);
    setCurrentLanguage('');
    setSortDropdownOpen(false);
    setLanguageMenuOpen(false);
    onSortChange({ type });
  };

  // Handle language selection
  const handleLanguageSelect = (lang: string) => {
    setSortBy('language');
    setCurrentLanguage(lang);
    setSortDropdownOpen(false);
    setLanguageMenuOpen(false);
    onSortChange({ type: 'language', language: lang });
  };

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Sync sortBy and currentLanguage with props
  useEffect(() => {
    setSortBy(selectedSort);
    setCurrentLanguage(selectedLanguage || '');
  }, [selectedSort, selectedLanguage]);

  // Filter options
  const filterOptions: FilterOptions = {
    languages: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'],
    specializations: ['Love & Relationships', 'Career & Business', 'Health & Wellness', 'Finance & Money', 'Marriage & Family', 'Education', 'Spirituality', 'Numerology', 'Tarot Reading', 'Vastu Shastra'],
    experience: ['1-3 years', '3-5 years', '5-10 years', '10+ years'],
    rating: [4, 4.5, 5]
  };

  const statusOptions = [
    { value: 'online', label: 'Online', color: 'green' },
    { value: 'busy', label: 'Busy', color: 'amber' },
    { value: 'offline', label: 'Offline', color: 'gray' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  if (isLoading) {
    return <FilterBarSkeleton />;
  }

  // Determine sort button label - always show "Sort by" unless a language is selected
  let sortLabel = 'Sort by';
  if (sortBy === 'language' && currentLanguage) {
    sortLabel = currentLanguage;
  }
  // Keep "Sort by" for audio, video, and empty cases

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 relative z-[9999] px-2 sm:px-0">
      <div className="flex-1 w-full">
        {/* Search Bar - Separate container */}
        <div className="flex-1 relative bg-white border border-gray-200 rounded-xl shadow-md px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 focus-within:border-orange-300 focus-within:shadow-lg">
          <input
            type="text"
            placeholder="Search astrologers..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); onSearch(e.target.value); }}
            className="w-full bg-transparent border-none outline-none text-base sm:text-lg font-medium py-1 pl-8 sm:pl-10 pr-4 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); onSearch(''); }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full sm:w-auto mb-2 sm:mb-0">
        {/* Sort select */}
        <div className="relative">
          <select
            value={sortBy === 'language' && currentLanguage ? currentLanguage : sortBy}
            onChange={e => {
              const value = e.target.value;
              if (value === 'audio' || value === 'video') {
                setSortBy(value);
                setCurrentLanguage('');
                onSortChange({ type: value });
              } else if (value === '') {
                // Handle "Sort By" default option - don't trigger any change
                setSortBy('');
                setCurrentLanguage('');
                // Don't call onSortChange for empty selection
              } else {
                setSortBy('language');
                setCurrentLanguage(value);
                onSortChange({ type: 'language', language: value });
              }
            }}
            className="w-full sm:w-auto pl-8 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl font-medium bg-white text-gray-700 border border-gray-200 shadow-md focus:outline-none focus:ring-0 focus:border-orange-300 transition-all duration-300 text-sm sm:text-base appearance-none"
          >
            <option value="">Sort By</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <optgroup label="Languages">
              {filterOptions.languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
