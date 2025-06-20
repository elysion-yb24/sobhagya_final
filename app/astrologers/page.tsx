"use client";

'use client';

import React, { useState, useMemo, useEffect, useCallback } from "react";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { useRouter } from "next/navigation";
import { getAuthToken, clearAuthData, isAuthenticated, getUserDetails } from "../utils/auth-utils";
import TransactionHistory from "../components/history/TransactionHistory";
import CallHistory from "../components/history/CallHistory";
import { 
  RefreshCw, 
  Wallet, 
  Receipt, 
  Phone, 
  History, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Star,
  Menu,
  Home,
  Search, 
  Filter, 
  Video, 
  Clock, 
  Award, 
  MapPin, 
  Languages,
  Heart,
  Gift,
  MessageCircle,
  Calendar,
  Shield,
  Verified,
  PhoneCall,
  VideoIcon,
  CheckCircle,
  Loader2
} from "lucide-react";
import { getApiBaseUrl } from "../config/api";

interface Astrologer {
  _id: string;
  name: string;
  languages: string[];
  specializations: string[];
  experience: string;
  callsCount: number;
  rating: number | { avg: number; count: number; max: number; min: number };
  profileImage: string;
  hasVideo?: boolean;
  // Additional fields from API response
  about?: string;
  age?: number;
  avatar?: string;
  blockReason?: string;
  blockedReason?: string;
  callMinutes?: number;
  callType?: string;
  calls?: number;
  createdAt?: string;
  hasBlocked?: boolean;
  isBlocked?: boolean;
  isLive?: boolean;
  isLiveBlocked?: boolean;
  isRecommended?: boolean;
  isVideoCallAllowed?: boolean;
  isVideoCallAllowedAdmin?: boolean;
  language?: string[];
  numericId?: number;
  offerRpm?: number;
  payoutAudioRpm?: number;
  payoutVideoRpm?: number;
  phone?: string;
  priority?: number;
  reportCount?: number;
  role?: string;
  rpm?: number;
  sample?: string;
  status?: string;
  talksAbout?: string[];
  upi?: string;
  videoRpm?: number;
}

export default function AstrologersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [astrologersData, setAstrologersData] = useState<Astrologer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [videoOnly, setVideoOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<'none' | 'transactions' | 'calls'>('none');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAstrologers, setTotalAstrologers] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const itemsPerPage = 10;

  // Function to fetch astrologers with pagination
  const fetchAstrologers = useCallback(async (page: number = 1) => {
    console.log(`🚀 Starting fetchAstrologers for page ${page}...`);
    const isInitialLoad = page === 1 && astrologersData.length === 0;
    
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingPage(true);
    }
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        console.error("❌ No authentication token found after refresh");
        setError("Authentication required. Please log in.");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      console.log("🔑 Fetching astrologers with token:", token.slice(0, 20) + '...');

      const skip = (page - 1) * itemsPerPage;
      let response = await fetch(
        `${getApiBaseUrl()}/user/api/users?skip=${skip}&limit=${itemsPerPage}`,
        {
          method: "GET",
          credentials: 'include',
          headers: {
            "Authorization": token ? `Bearer ${token}` : '',
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - clearing auth data');
        clearAuthData();
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Astrologers fetch successful, processing data...");
      processAstrologersData(result, page);
      
    } catch (error) {
      console.error("❌ Error fetching astrologers:", error);
      setError("Failed to load astrologers. Please try again later.");
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingPage(false);
      }
      console.log('🏁 fetchAstrologers completed');
    }
  }, [router, astrologersData.length]);

  const processAstrologersData = (result: any, page: number) => {
    console.log("Data response structure:", result);
    
    // Debug log for language data
    if (result?.data?.list) {
      console.log("Language data examples:", result.data.list.slice(0, 3).map((ast: any) => ({
        language: ast.language,
        languages: ast.languages,
        type: {
          language: ast.language ? typeof ast.language : 'undefined',
          languages: ast.languages ? typeof ast.languages : 'undefined'
        }
      })));
    }
    
    let astrologers: any[] = [];
    let total = 0;
    
    // Handle the specific response structure we're getting
    if (result?.data?.list && Array.isArray(result.data.list)) {
      astrologers = result.data.list;
      total = result.data.total || result.data.count || astrologers.length;
    } else if (result?.list && Array.isArray(result.list)) {
      astrologers = result.list;
      total = result.total || result.count || astrologers.length;
    }

    console.log(`Found ${astrologers.length} astrologers for page ${page}, total: ${total}`);
    
    if (astrologers.length === 0 && page === 1) {
      console.warn("No astrologers found in response:", result);
      setError("No astrologers available at the moment.");
      return;
    }
    
    const normalizedData: Astrologer[] = astrologers.map((ast: any) => ({
      _id: ast._id || ast.id || ast.numericId?.toString() || '',
      name: ast.name || "Unknown Astrologer",
      languages: (() => {
        // If language is an array, use it
        if (Array.isArray(ast.language)) {
          return ast.language.map((lang: string) => lang.trim());
        }
        // If language is a string, split by comma
        if (typeof ast.language === 'string') {
          return ast.language.split(',').map((lang: string) => lang.trim());
        }
        // If languages array exists, use it
        if (Array.isArray(ast.languages)) {
          return ast.languages.map((lang: string) => lang.trim());
        }
        // Default to Hindi
        return ["Hindi"];
      })(),
      specializations: [],  // We'll need to add this data when available
      experience: ast.age?.toString() || "0",
      callsCount: ast.calls || 0,
      rating: ast.rating?.avg || 5,  // Use average rating if available, default to 5
      profileImage: ast.avatar || "",
      hasVideo: ast.isVideoCallAllowed || false
    }));

    console.log("Normalized astrologers data:", normalizedData);
    
    // Update pagination info
    setTotalAstrologers(total);
    setTotalPages(Math.ceil(total / itemsPerPage));
    setCurrentPage(page);
    
    // Set the data for current page
    setAstrologersData(normalizedData);
  };

  // Get all available languages from astrologers data
  const allLanguages = useMemo(() => {
    const languages = astrologersData
      .map((ast) => ast.languages || [])
      .flat()
      .map(lang => lang.toLowerCase().trim());
    
    // Remove duplicates and sort
    const uniqueLanguages = Array.from(new Set(languages))
      .sort()
      .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1)); // Capitalize first letter
    
    return uniqueLanguages;
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

    // Apply language filter (case-insensitive)
    if (languageFilter !== "All") {
      filtered = filtered.filter((ast) =>
        ast.languages.some(lang => lang.toLowerCase() === languageFilter.toLowerCase())
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
          filtered.sort((a, b) => {
            const ratingA = typeof a.rating === 'number' ? a.rating : a.rating.avg;
            const ratingB = typeof b.rating === 'number' ? b.rating : b.rating.avg;
            return ratingB - ratingA;
          });
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

  // Function to fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setWalletError("Authentication required");
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/payment/api/transaction/wallet-balance`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setWalletBalance(data.data.balance || 0);
        setWalletError(null);
      } else {
        setWalletError(data.message || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletError('Failed to fetch balance');
    }
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoadingPage) {
      fetchAstrologers(newPage);
    }
  }, [totalPages, currentPage, isLoadingPage, fetchAstrologers]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check authentication status on mount
    console.log('🔍 Astrologers page mounted - checking authentication...');
    
    if (!isAuthenticated()) {
      console.log('❌ Not authenticated, redirecting to home');
      clearAuthData();
      router.push("/");
      return;
    }

    console.log('✅ Authenticated, fetching data...');
    fetchAstrologers(1);
    fetchWalletBalance();
    
    // Set up token check interval
    const checkInterval = setInterval(() => {
      if (!isAuthenticated()) {
        console.log('❌ Authentication expired, clearing data and redirecting');
        clearInterval(checkInterval);
        clearAuthData();
        router.push("/");
      }
    }, 60000);

    // Set up wallet balance refresh interval
    const walletInterval = setInterval(fetchWalletBalance, 40000); // Refresh every 40 seconds
    
    return () => {
      clearInterval(checkInterval);
      clearInterval(walletInterval);
    };
  }, [router, fetchAstrologers, fetchWalletBalance, mounted]);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchAstrologers(currentPage), fetchWalletBalance()]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Small delay for better UX
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-orange-600">
                    Find Your Astrologer
                  </h1>
                  <p className="text-xs text-gray-500 hidden lg:block">Connect with expert astrologers</p>
                </div>
                <h1 className="sm:hidden text-lg font-bold text-orange-600">Astrologers</h1>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg transition-all ${
                  isRefreshing 
                    ? 'text-orange-500 bg-orange-50 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title={isRefreshing ? "Refreshing..." : "Refresh data"}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Right side - Mobile optimized controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* History Buttons - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(showHistory === 'transactions' ? 'none' : 'transactions')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showHistory === 'transactions' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Transactions</span>
                </button>
                
                <button
                  onClick={() => setShowHistory(showHistory === 'calls' ? 'none' : 'calls')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showHistory === 'calls' 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Calls</span>
                </button>
              </div>
              
              {/* History Buttons - Mobile */}
              <div className="lg:hidden flex gap-1">
                <button
                  onClick={() => setShowHistory(showHistory === 'transactions' ? 'none' : 'transactions')}
                  className={`p-2 rounded-lg transition-all ${
                    showHistory === 'transactions' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Transaction History"
                >
                  <Receipt className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowHistory(showHistory === 'calls' ? 'none' : 'calls')}
                  className={`p-2 rounded-lg transition-all ${
                    showHistory === 'calls' 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Call History"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              
              {/* Wallet Balance - Mobile Optimized */}
              <div className="relative">
                <div className={`flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 shadow-sm transition-all ${
                  walletError 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200 hover:shadow-md'
                }`}>
                  <div className={`p-1 sm:p-2 rounded-md ${walletError ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Wallet className={`h-3 w-3 sm:h-4 sm:w-4 ${walletError ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${walletError ? 'text-red-600' : 'text-green-600'}`}>
                      <span className="hidden sm:inline">Balance</span>
                      <span className="sm:hidden">₹</span>
                    </span>
                    <span className={`text-xs sm:text-sm font-bold ${walletError ? 'text-red-700' : 'text-green-700'}`}>
                      {walletError ? 'Error' : `${walletBalance?.toFixed(0) || '0'}`}
                      <span className="hidden sm:inline">.{(walletBalance % 1).toFixed(2).slice(2)}</span>
                    </span>
                  </div>
                  {walletBalance > 0 && !walletError && (
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* History Modal/Panel - Mobile Optimized */}
      {showHistory !== 'none' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {showHistory === 'transactions' ? (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Receipt className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transaction History</h2>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Call History</h2>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowHistory('none')}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)] sm:max-h-[60vh]">
              {showHistory === 'transactions' ? (
                <TransactionHistory />
              ) : (
                <CallHistory />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Section - Mobile Optimized */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        </div>
      </section>

      {/* Stats Bar - Mobile Optimized */}
      {!isLoading && !error && totalAstrologers > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {totalAstrologers} Astrologers
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-gray-500">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalAstrologers)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-200 rounded-full animate-spin"></div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium text-center px-4">Finding the best astrologers for you...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-red-600 mb-4 text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No astrologers found</h3>
              <p className="text-gray-600 mb-4 text-sm">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setLanguageFilter("All");
                  setVideoOnly(false);
                }}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <AstrologerList astrologers={filteredAstrologers} />
            
            {/* Mobile-Optimized Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 sm:pt-8">
                {/* Mobile pagination - simplified */}
                <div className="sm:hidden flex items-center gap-2 w-full">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingPage}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      currentPage === 1 || isLoadingPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="px-4 py-3 bg-orange-500 text-white rounded-lg font-medium min-w-[80px] text-center">
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoadingPage}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      currentPage === totalPages || isLoadingPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Desktop pagination */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingPage}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      currentPage === 1 || isLoadingPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoadingPage}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          pageNum === currentPage
                            ? 'bg-orange-500 text-white shadow-lg'
                            : isLoadingPage
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoadingPage}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      currentPage === totalPages || isLoadingPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading indicator for page changes */}
            {isLoadingPage && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-6 py-3 rounded-xl">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Loading page {currentPage}...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}