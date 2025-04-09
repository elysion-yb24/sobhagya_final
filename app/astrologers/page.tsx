"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { useRouter } from "next/navigation";
import { getAuthToken, clearAuthData, isTokenValid, refreshTokenIfNeeded, isAuthenticated } from "../utils/auth-utils";

interface Astrologer {
  _id: string;
  name: string;
  languages: string[];
  specializations: string[];
  experience: string;
  callsCount: number;
  rating: number;
  profileImage: string;
  hasVideo?: boolean;
}

export default function AstrologersPage() {
  const router = useRouter();
  const [astrologersData, setAstrologersData] = useState<Astrologer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [videoOnly, setVideoOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Function to fetch astrologers
  const fetchAstrologers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to refresh token if needed
      const tokenRefreshed = await refreshTokenIfNeeded();
      if (!tokenRefreshed) {
        console.error("Token refresh failed");
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.error("No authentication token found");
        setError("Authentication required. Please log in.");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      const response = await fetch(
        "https://micro.sobhagya.in/user/api/users?skip=0&limit=50",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        clearAuthData();
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      processAstrologersData(result);
      
      // Fetch wallet balance
      await fetchWalletBalance(token);
      
    } catch (error) {
      console.error("Error fetching astrologers:", error);
      setError("Failed to load astrologers. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const processAstrologersData = (result: any) => {
    console.log("Data response structure:", Object.keys(result));
    
    let astrologers: Astrologer[] = [];
    
    if (Array.isArray(result.data)) {
      astrologers = result.data;
    } else if (result.data && typeof result.data === 'object') {
      if (Array.isArray(result.data.users)) {
        astrologers = result.data.users;
      } else if (Array.isArray(result.data.astrologers)) {
        astrologers = result.data.astrologers;
      }
    } else if (Array.isArray(result)) {
      astrologers = result;
    }

    console.log(`Found ${astrologers.length} astrologers`);
    
    const normalizedData = astrologers.map(ast => ({
      _id: ast._id || "",
      name: ast.name || "",
      languages: ast.languages || [],
      specializations: ast.specializations || [],
      experience: ast.experience || "0",
      callsCount: ast.callsCount || 0,
      rating: ast.rating || 0,
      profileImage: ast.profileImage || "",
      hasVideo: ast.hasVideo || false
    }));

    setAstrologersData(normalizedData);
  };

  const fetchWalletBalance = async (token: string) => {
    try {
      const walletResponse = await fetch(
        "https://micro.sobhagya.in/user/api/wallet/balance",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWalletBalance(walletData.balance || 0);
      }
    } catch (walletError) {
      console.error("Error fetching wallet balance:", walletError);
    }
  };

  useEffect(() => {
    // Check authentication status on mount
    if (!isAuthenticated()) {
      clearAuthData();
      router.push("/");
      return;
    }

    fetchAstrologers();
    
    // Set up token check interval
    const checkInterval = setInterval(() => {
      if (!isAuthenticated()) {
        clearInterval(checkInterval);
        clearAuthData();
        router.push("/");
      }
    }, 60000);
    
    return () => clearInterval(checkInterval);
  }, [router, fetchAstrologers]);

  // Get all available languages from astrologers data
  const allLanguages = useMemo(() => {
    const languages = astrologersData
      .map((ast) => ast.languages || [])
      .flat();
    return Array.from(new Set(languages)).sort();
  }, [astrologersData]);

  // Apply filters to astrologers data
  const filteredAstrologers = useMemo(() => {
    let filtered = [...astrologersData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ast) =>
          ast.name.toLowerCase().includes(query) ||
          ast.specializations.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Apply language filter
    if (languageFilter !== "All") {
      filtered = filtered.filter((ast) =>
        ast.languages.includes(languageFilter)
      );
    }

    // Apply video filter
    if (videoOnly) {
      filtered = filtered.filter((ast) => ast.hasVideo);
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case "experience":
          filtered.sort((a, b) => {
            const expA = parseInt(a.experience) || 0;
            const expB = parseInt(b.experience) || 0;
            return expB - expA;
          });
          break;
        case "calls":
          filtered.sort((a, b) => b.callsCount - a.callsCount);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [searchQuery, languageFilter, videoOnly, sortBy, astrologersData]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchAstrologers();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-red-600">Astrologers</h1>
          <button 
            onClick={handleRefresh}
            className="ml-2 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        {/* Wallet balance */}
        <div className="border border-yellow-400 rounded-md px-3 py-1 flex items-center justify-center text-yellow-600 font-semibold">
          ₹{walletBalance.toFixed(2)}
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
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No astrologers found matching your criteria.
          </div>
        ) : (
          <AstrologerList astrologers={filteredAstrologers} />
        )}
      </main>
    </div>
  );
}