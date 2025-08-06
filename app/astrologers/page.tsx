"use client";


import React, { useState, useMemo, useEffect, useCallback } from "react";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  CreditCard
} from "lucide-react";
import { getApiBaseUrl } from "../config/api";
import { useDebounce } from "../hooks/useDebounce";
import { useWalletBalance, WalletBalanceProvider } from '../components/astrologers/WalletBalanceContext';


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
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [allAstrologers, setAllAstrologers] = useState<Astrologer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<'audio' | 'video' | 'language' | ''>("");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<'none' | 'transactions' | 'calls'>('none');
  const [showBestAstrologerLoader, setShowBestAstrologerLoader] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // When searchQuery changes (from FilterBar), show loader for 700ms
  useEffect(() => {
    if (searchQuery) {
      setSearching(true);
      const timeout = setTimeout(() => setSearching(false), 700);
      return () => clearTimeout(timeout);
    } else {
      setSearching(false);
    }
  }, [searchQuery]);

  // Fetch astrologers with pagination
  const fetchAstrologers = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }
      
      const skip = (page - 1) * 10;
      const response = await fetch(
        `${getApiBaseUrl()}/user/api/users?skip=${skip}&limit=10`,
        {
          method: "GET",
          credentials: 'include',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      
      if (!response.ok) {
        setError("Failed to fetch astrologers");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }
      
      const data = await response.json();
      const newAstrologers = data.data?.list || data.list || [];
      
      if (append) {
        setAllAstrologers(prev => [...prev, ...newAstrologers]);
      } else {
        setAllAstrologers(newAstrologers);
      }
      
      // Check if there are more astrologers to load
      setHasMore(newAstrologers.length === 10);
      
    } catch (err) {
      setError("Failed to fetch astrologers");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch initial astrologers on mount
  useEffect(() => {
    setMounted(true);
    fetchAstrologers(1, false);
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore) return;
      
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more when user is near bottom (100px from bottom)
      if (scrollTop + windowHeight >= documentHeight - 100) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchAstrologers(nextPage, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, currentPage]);

  // Client-side search and filter
  const filteredAstrologers = allAstrologers.filter(ast => {
    const matchesSearch =
      !searchQuery ||
      ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ast.specializations && ast.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesLanguage =
      languageFilter === "All" ||
      (ast.languages && ast.languages.some(lang => lang.toLowerCase() === languageFilter.toLowerCase()));
    const matchesSort =
      sortBy === '' ||
      (sortBy === 'audio') ||
      (sortBy === 'video' && ast.hasVideo);
    return matchesSearch && matchesLanguage && matchesSort;
  });

  // Handler for sort change from FilterBar
  const handleSortChange = (sort: { type: 'audio' | 'video' | 'language' | '', language?: string }) => {
    // Show loader only when switching to audio from a different sort
    if (sort.type === 'audio' && sort.type !== sortBy) {
      setShowBestAstrologerLoader(true);
      setTimeout(() => setShowBestAstrologerLoader(false), 1800); // 1.8s loader
    }
    setSortBy(sort.type);
    setLanguageFilter(sort.language || '');
  };

  // Function to load all astrologers
  const loadAllAstrologers = useCallback(async () => {
    console.log('🚀 Loading all astrologers...');
    setIsLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const allAstrologersData: Astrologer[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        console.log(`📄 Fetching page ${currentPage}...`);
        const skip = (currentPage - 1) * 10; // Assuming itemsPerPage is 10
        
        const response = await fetch(
          `${getApiBaseUrl()}/user/api/users?skip=${skip}&limit=10`,
          {
            method: "GET",
            credentials: 'include',
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        let astrologers: any[] = [];
        
        // Handle the response structure
        if (result?.data?.list && Array.isArray(result.data.list)) {
          astrologers = result.data.list;
        } else if (result?.list && Array.isArray(result.list)) {
          astrologers = result.list;
        } else if (Array.isArray(result)) {
          astrologers = result;
        }

        if (astrologers.length === 0) {
          hasMore = false;
          break;
        }

        // Normalize the data
        const normalizedData: Astrologer[] = astrologers.map((ast: any) => ({
          _id: ast._id || ast.id || ast.numericId?.toString() || '',
          name: ast.name || "Unknown Astrologer",
          languages: (() => {
            if (Array.isArray(ast.language)) {
              return ast.language.map((lang: string) => lang.trim());
            }
            if (typeof ast.language === 'string') {
              return ast.language.split(',').map((lang: string) => lang.trim());
            }
            if (Array.isArray(ast.languages)) {
              return ast.languages.map((lang: string) => lang.trim());
            }
            return ["Hindi"];
          })(),
          specializations: ast.talksAbout || [],
          experience: ast.age?.toString() || "0",
          callsCount: ast.calls || 0,
          rating: ast.rating?.avg || 5,
          profileImage: ast.avatar || "",
          hasVideo: ast.isVideoCallAllowed || false,
          status: ast.status || "offline",
          talksAbout: ast.talksAbout || [],
          isVideoCallAllowed: ast.isVideoCallAllowed || false,
          rpm: ast.rpm || "",
          videoRpm: ast.videoRpm || "",
          offerRpm: ast.offerRpm,
          about: ast.about,
          age: ast.age,
          avatar: ast.avatar,
          calls: ast.calls,
          createdAt: ast.createdAt,
          isLive: ast.isLive,
          isRecommended: ast.isRecommended,
          numericId: ast.numericId,
          payoutAudioRpm: ast.payoutAudioRpm,
          payoutVideoRpm: ast.payoutVideoRpm,
          phone: ast.phone,
          priority: ast.priority,
          role: ast.role,
          sample: ast.sample,
          upi: ast.upi
        }));

        allAstrologersData.push(...normalizedData);
        
        // Check if we should continue
        if (astrologers.length < 10) { // Assuming itemsPerPage is 10
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      console.log(`✅ Loaded ${allAstrologersData.length} total astrologers`);
      setAllAstrologers(allAstrologersData);
      
    } catch (error) {
      console.error("❌ Error loading all astrologers:", error);
      setError("Failed to load all astrologers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle URL parameters to open history drawers
  useEffect(() => {
    if (mounted && searchParams) {
      const openHistory = searchParams.get('openHistory');
      if (openHistory === 'transactions') {
        setShowHistory('transactions');
      } else if (openHistory === 'calls') {
        setShowHistory('calls');
      }
    }
  }, [mounted, searchParams]);

  // Ensure proper pagination initialization
  useEffect(() => {
    if (mounted && !isLoading && allAstrologers.length !== 0) {
      console.log(`📊 Pagination initialized: ${allAstrologers.length} astrologers on page 1, total: ${allAstrologers.length}, pages: 1`);
    }
  }, [mounted, isLoading, allAstrologers.length]);

  useEffect(() => {
    if (!mounted) return;

    // Initialize authentication on mount
    console.log('🔍 Astrologers page mounted - initializing authentication...');
    
    // Check if returning from video call
    const returningFromVideoCall = typeof window !== 'undefined' && 
      sessionStorage.getItem('returning_from_video_call') === 'true';
    
    if (returningFromVideoCall) {
      console.log('🎥 Returning from video call - clearing flag');
      sessionStorage.removeItem('returning_from_video_call');
    }
    
    // Check authentication immediately without delay
    const isAuthValid = isAuthenticated();
    
    if (!isAuthValid) {
      console.log('❌ Authentication initialization failed - redirecting to login');
      clearAuthData();
      router.push("/");
      return;
    }

    console.log('✅ Authentication validated, initializing data fetch...');
    loadAllAstrologers(); // This function is no longer needed
  }, [mounted, router, loadAllAstrologers]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (showHistory !== 'none') {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showHistory]);

  // Handle refresh button click
  const handleRefresh = async () => {
    console.log('🔄 Refresh requested');
    setCurrentPage(1);
    setHasMore(true);
    await fetchAstrologers(1, false);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (allAstrologers.length === 0) {
      return [1]; // Show only one page if no data
    }

    if (allAstrologers.length <= maxVisiblePages) {
      for (let i = 1; i <= allAstrologers.length; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, 1); // Always start from 1
      const endPage = Math.min(allAstrologers.length, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const { walletBalance, isFetching } = useWalletBalance();

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <WalletBalanceProvider>
      {/* FilterBar and Top Controls */}
      <section className="w-full flex justify-center py-3 ">
        <div className="w-full max-w-7xl mx-auto px-10 py-3 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
          {/* FilterBar (search + sort by) */}
          <div className="flex-1 min-w-0">
            <FilterBar
              onSearch={setSearchQuery}
              onSortChange={handleSortChange}
              isLoading={isLoading}
              totalResults={allAstrologers.length}
              searchQuery={searchQuery}
              selectedSort={sortBy}
              selectedLanguage={languageFilter}
            />
          </div>

          {/* Desktop Buttons (hidden on mobile) */}
          <div className="hidden sm:flex gap-4 items-center md:ml-8 flex-shrink-0">
            <button
              onClick={() => setShowHistory(showHistory === 'transactions' ? 'none' : 'transactions')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 h-14 rounded-full text-base font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm ${showHistory === 'transactions' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-100'}`}
              aria-label="Transaction History"
            >
              <CreditCard className="w-5 h-5" /> 
              <span className="whitespace-nowrap">Transactions</span>
            </button>
            <button
              onClick={() => setShowHistory(showHistory === 'calls' ? 'none' : 'calls')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 h-14 rounded-full text-base font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm ${showHistory === 'calls' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-600 border-green-200 hover:bg-green-100'}`}
              aria-label="Call History"
            >
              <Phone className="w-5 h-5" /> 
              <span className="whitespace-nowrap">Calls</span>
            </button>
            <div className="flex items-center justify-center gap-2 px-6 py-2.5 h-14 rounded-full border border-green-200 bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-bold text-base shadow-md select-none transition-all duration-200">
              <Wallet className="w-5 h-5 text-green-500" />
              <span className="whitespace-nowrap">₹{walletBalance?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        {searching && (
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
                {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 sm:border-6 rounded-full animate-spin" style={{ borderColor: '#FFB366' }}></div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 sm:border-6 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: '#F7971E' }}></div>
            </div>
            <div className="text-center max-w-md">
              <p className="text-gray-600 font-medium text-lg sm:text-xl lg:text-2xl mb-2">Loading Astrologers...</p>
              <p className="text-gray-500 text-sm sm:text-base">Please wait while we connect you with expert astrologers</p>
            </div>
          </div>
        ) : allAstrologers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No astrologers found</h3>
              <p className="text-gray-600 mb-4 text-sm">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setLanguageFilter("");
                  setSortBy("");
                }}
                className="w-full text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#6B7280' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4B5563')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6B7280')}
              >
                Clear Filters
              </button>
    </div>
  </div>
) : (
  <AstrologerList 
    astrologers={filteredAstrologers} 
    isLoading={isLoading}
    isLoadingMore={isLoadingMore}
    hasError={!!error}
    onRetry={() => fetchAstrologers(1, false)}
    compactButtons={sortBy === 'audio' || sortBy === 'video'} 
    showVideoButton={sortBy === 'video'} 
  />
        )}
      </main>



      {/* Premium History Drawer/Modal */}
      {(showHistory === 'transactions' || showHistory === 'calls') && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-500 ease-out"
            onClick={() => setShowHistory('none')}
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          />
          
          {/* Drawer */}
          <div 
            className={`fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[450px] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-orange-100/50 z-50 transform transition-all duration-500 ease-out flex flex-col ${
              showHistory === 'transactions' || showHistory === 'calls' ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              transform: showHistory === 'transactions' || showHistory === 'calls' ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: showHistory === 'transactions' || showHistory === 'calls' 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                : '0 0 0 0 rgba(0, 0, 0, 0)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 sm:p-6 border-b border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-white flex-shrink-0"
              style={{
                animation: showHistory === 'transactions' || showHistory === 'calls' 
                  ? 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both' 
                  : 'none'
              }}
            >
              <div className="flex items-center gap-3">
                {showHistory === 'transactions' ? (
                  <div 
                    className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-orange-200"
                    style={{
                      animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both'
                    }}
                  >
                    <Receipt className="w-5 h-5 text-orange-600" />
                  </div>
                ) : (
                  <div 
                    className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-green-200"
                    style={{
                      animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both'
                    }}
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                )}
                <div 
                  style={{
                    animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                  }}
                >
                  <h2 className="text-xl font-bold text-gray-900">
                    {showHistory === 'transactions' ? 'Transaction History' : 'Call History'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {showHistory === 'transactions' ? 'Your payment history' : 'Your call records'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistory('none')}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                style={{
                  animation: 'fadeIn 0.4s ease-out 0.4s both'
                }}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto"
              style={{
                animation: showHistory === 'transactions' || showHistory === 'calls' 
                  ? 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both' 
                  : 'none'
              }}
            >
              <div className="p-4 sm:p-6">
                {showHistory === 'transactions' && <TransactionHistory />}
                {showHistory === 'calls' && <CallHistory />}
              </div>
            </div>
          </div>

          {/* Custom CSS Animations */}
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes bounceIn {
              0% {
                opacity: 0;
                transform: scale(0.3);
              }
              50% {
                opacity: 1;
                transform: scale(1.05);
              }
              70% {
                transform: scale(0.9);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}


    </WalletBalanceProvider>
  );
}