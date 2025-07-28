"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { FilterBarSkeleton } from '../ui/SkeletonLoader';
import { motion } from 'framer-motion';

interface FilterOptions {
  languages: string[];
  specializations: string[];
  experience: string[];
  rating: number[];
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  onSortChange: (sort: { type: 'audio' | 'video' | 'language' | '' , language?: string }) => void;
  isLoading?: boolean;
  totalResults?: number;
  searchQuery: string;
  selectedSort: 'audio' | 'video' | 'language' | '';
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

  // Typewriter effect for placeholder
  const [placeholder, setPlaceholder] = useState('');
  const fullPlaceholder = 'Search for Astrologer';
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (placeholder.length < fullPlaceholder.length) {
      timeout = setTimeout(() => {
        setPlaceholder(fullPlaceholder.slice(0, placeholder.length + 1));
      }, 60);
    }
    return () => clearTimeout(timeout);
  }, [placeholder]);
  useEffect(() => {
    setPlaceholder('');
  }, []);

  // Local state for search input
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

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
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.1 }}
      className="w-full"
    >
      <div className="flex items-center gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-5 py-3 rounded-full border border-orange-200 focus:border-orange-400 focus:ring-0 bg-white text-base shadow-none transition-all duration-200 placeholder-gray-400 outline-none"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {/* Search Icon always outside, now acts as search button */}
        <button
          className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-50 border border-orange-200 ml-1 hover:bg-orange-100 transition-colors"
          onClick={() => onSearch(localSearch)}
          aria-label="Search Astrologers"
        >
          <Search className="w-6 h-6 text-orange-400" />
        </button>
        {/* Sort By Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={selectedSort}
            onChange={e => {
              const value = e.target.value;
              if (value === 'audio' || value === 'video') {
                onSortChange({ type: value });
              } else if (value === '') {
                onSortChange({ type: '' });
              } else {
                onSortChange({ type: 'language', language: value });
              }
            }}
            className="w-full pl-4 pr-8 py-3 rounded-full font-medium bg-white text-gray-700 border border-gray-200 shadow-md focus:outline-none focus:ring-0 focus:border-orange-300 transition-all duration-300 text-base appearance-none"
          >
            <option value="">Sort By</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <optgroup label="Languages">
              {/* You may want to pass filterOptions.languages as a prop for dynamic languages */}
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              {/* ...add more as needed */}
            </optgroup>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
