"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Star, Clock, MapPin, Languages, Heart } from 'lucide-react';
import { FilterBarSkeleton } from '../ui/SkeletonLoader';

interface FilterOptions {
  languages: string[];
  specializations: string[];
  experience: string[];
  rating: number[];
}

interface FilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  isLoading?: boolean;
  totalResults?: number;
  searchQuery?: string;
  activeFilters?: any;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onFilterChange,
  isLoading = false,
  totalResults = 0,
  searchQuery = '',
  activeFilters = {}
}) => {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Filter states
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(activeFilters.languages || []);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(activeFilters.specializations || []);
  const [selectedExperience, setSelectedExperience] = useState<string>(activeFilters.experience || '');
  const [selectedRating, setSelectedRating] = useState<number>(activeFilters.rating || 0);
  const [selectedStatus, setSelectedStatus] = useState<string>(activeFilters.status || '');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

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

  const handleFilterChange = () => {
    const filters = {
      languages: selectedLanguages,
      specializations: selectedSpecializations,
      experience: selectedExperience,
      rating: selectedRating,
      status: selectedStatus
    };
    onFilterChange(filters);
  };

  const clearAllFilters = () => {
    setSelectedLanguages([]);
    setSelectedSpecializations([]);
    setSelectedExperience('');
    setSelectedRating(0);
    setSelectedStatus('');
    setSearchTerm('');
    onSearch('');
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedLanguages.length > 0) count++;
    if (selectedSpecializations.length > 0) count++;
    if (selectedExperience) count++;
    if (selectedRating > 0) count++;
    if (selectedStatus) count++;
    if (searchTerm.trim()) count++;
    return count;
  };

  const toggleLanguage = (language: string) => {
    const updated = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    setSelectedLanguages(updated);
  };

  const toggleSpecialization = (spec: string) => {
    const updated = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter(s => s !== spec)
      : [...selectedSpecializations, spec];
    setSelectedSpecializations(updated);
  };

  if (!mounted || isLoading) {
    return <FilterBarSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 transition-all duration-300">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="input-field pl-10 pr-4"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              showFilters 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                showFilters ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
              }`}>
                {getActiveFilterCount()}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Results Count */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
            <span className="text-sm text-orange-700 font-medium">
              {totalResults} {totalResults === 1 ? 'astrologer' : 'astrologers'} found
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Results Count */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-center py-2 bg-orange-50 rounded-lg border border-orange-200">
          <span className="text-sm text-orange-700 font-medium">
            {totalResults} {totalResults === 1 ? 'astrologer' : 'astrologers'} found
          </span>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-6 animate-fadeInUp">
          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Availability Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(selectedStatus === status.value ? '' : status.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedStatus === status.value
                      ? `bg-${status.color}-100 text-${status.color}-800 ring-2 ring-${status.color}-300`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Minimum Rating
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.rating.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRating === rating
                      ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className="h-3 w-3 fill-current" />
                  {rating}+
                </button>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Experience
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.experience.map((exp) => (
                <button
                  key={exp}
                  onClick={() => setSelectedExperience(selectedExperience === exp ? '' : exp)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedExperience === exp
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Languages className="h-4 w-4 text-purple-500" />
              Languages ({selectedLanguages.length} selected)
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.languages.map((language) => (
                <button
                  key={language}
                  onClick={() => toggleLanguage(language)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedLanguages.includes(language)
                      ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          {/* Specializations Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Specializations ({selectedSpecializations.length} selected)
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedSpecializations.includes(spec)
                      ? 'bg-pink-100 text-pink-800 ring-2 ring-pink-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleFilterChange}
              className="btn-primary flex-1"
            >
              Apply Filters
            </button>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary flex-1"
              >
                Clear All ({getActiveFilterCount()})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
