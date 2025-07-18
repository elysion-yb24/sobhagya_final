"use client";


import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  const [astrologersData, setAstrologersData] = useState<Astrologer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<'audio' | 'video' | 'language' | ''>("");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [videoOnly, setVideoOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<'none' | 'transactions' | 'calls'>('none');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBestAstrologerLoader, setShowBestAstrologerLoader] = useState(false);
  const prevSortByRef = useRef<string | undefined>(sortBy);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAstrologers, setTotalAstrologers] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [allAstrologers, setAllAstrologers] = useState<Astrologer[]>([]);
  const [allAstrologersLoaded, setAllAstrologersLoaded] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const itemsPerPage = 10;

  // Performance optimization: debounce search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Searching state for sort
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Only show searching loader if user actively changes sort (not on initial load)
  const hasInteractedRef = useRef(false);
  useEffect(() => {
    if (hasInteractedRef.current && (sortBy === 'audio' || sortBy === 'video')) {
      setSearching(true);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      const timeout = setTimeout(() => setSearching(false), 1500 + Math.random() * 2500); // 1.5s to 4s
      searchTimeoutRef.current = timeout;
      return () => clearTimeout(timeout);
    } else {
      setSearching(false);
    }
  }, [sortBy]);

  // Mark as interacted after first sort change
  useEffect(() => {
    if (!hasInteractedRef.current && (sortBy === 'audio' || sortBy === 'video')) {
      hasInteractedRef.current = true;
    }
  }, [sortBy]);

  // Function to fetch astrologers with pagination
  const fetchAstrologers = useCallback(async (page: number = 1, reset = false) => {
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
        console.error('❌ 401 Unauthorized error occurred');
        console.error('📍 Request details:', {
          url: `${getApiBaseUrl()}/user/api/users?skip=${skip}&limit=${itemsPerPage}`,
          token: token ? `${token.substring(0, 20)}...` : 'NULL',
          page: page
        });
        
        // Clear authentication data and redirect
        clearAuthData();
        setError("Your session has expired. Please log in again.");
        
        // Add delay to show error message before redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to home after 401 error...');
          router.push("/");
        }, 2000);
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
      total = result.data.total || result.data.count || result.data.totalCount || 0;
    } else if (result?.list && Array.isArray(result.list)) {
      astrologers = result.list;
      total = result.total || result.count || result.totalCount || 0;
    } else if (Array.isArray(result)) {
      // Handle direct array response
      astrologers = result;
      total = astrologers.length;
    }

    // Better total estimation logic
    if (total === 0) {
      if (astrologers.length === itemsPerPage) {
        // If we got a full page, estimate there are more pages
        // Start with a reasonable estimate and adjust as we load more
        total = Math.max(page * itemsPerPage + 10, 50); // Estimate at least 50 total
      } else {
        // If we got less than itemsPerPage, this is likely the last page
        total = (page - 1) * itemsPerPage + astrologers.length;
      }
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
      specializations: ast.talksAbout || [],  // Use talksAbout from API
      experience: ast.age?.toString() || "0",
      callsCount: ast.calls || 0,
      rating: ast.rating?.avg || 5,  // Use average rating if available, default to 5
      profileImage: ast.avatar || "",
      hasVideo: ast.isVideoCallAllowed || false,
      status: ast.status || "offline",  // Include status from API
      talksAbout: ast.talksAbout || [],  // Include specializations from API
      isVideoCallAllowed: ast.isVideoCallAllowed || false,
      // Include rate information from API
      rpm: ast.rpm || "",  // Audio call rate per minute
      videoRpm: ast.videoRpm || "",  // Video call rate per minute
      offerRpm: ast.offerRpm,  // Special offer rate if available
      // Include all other API fields
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
    const dataToUse = allAstrologersLoaded && allAstrologers.length > 0 ? allAstrologers : astrologersData;
    const languages = dataToUse
      .map((ast) => ast.languages || [])
      .flat()
      .map(lang => lang.toLowerCase().trim());
    
    // Remove duplicates and sort
    const uniqueLanguages = Array.from(new Set(languages))
      .sort()
      .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1)); // Capitalize first letter
    
    return uniqueLanguages;
  }, [astrologersData, allAstrologersLoaded, allAstrologers]);

  // Filtering and sorting logic
  const filteredAstrologers = useMemo(() => {
    // Use allAstrologers if loaded, otherwise use astrologersData
    let dataToUse = allAstrologersLoaded && allAstrologers.length > 0 ? allAstrologers : astrologersData;
    let filtered = [...dataToUse];
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ast) =>
          ast.name.toLowerCase().includes(query) ||
          ast.specializations.some((s) => s.toLowerCase().includes(query))
      );
    }
    // Sort/Filter by type
    if (sortBy === 'video') {
      filtered = filtered.filter((ast) => ast.hasVideo);
    } else if (sortBy === 'language' && languageFilter) {
      filtered = filtered.filter((ast) =>
        ast.languages.map(l => l.toLowerCase()).includes(languageFilter.toLowerCase())
      );
    }
    // Pagination: slice for current page if allAstrologersLoaded
    if (allAstrologersLoaded) {
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      return filtered.slice(startIdx, endIdx);
    }
    return filtered;
  }, [astrologersData, allAstrologersLoaded, allAstrologers, searchQuery, sortBy, languageFilter, currentPage, itemsPerPage]);

  // Handler for sort change from FilterBar
  const handleSortChange = (sort: { type: 'audio' | 'video' | 'language', language?: string }) => {
    // Show loader only when switching to audio from a different sort
    if (sort.type === 'audio' && prevSortByRef.current !== 'audio') {
      setShowBestAstrologerLoader(true);
      setTimeout(() => setShowBestAstrologerLoader(false), 1800); // 1.8s loader
    }
    setSortBy(sort.type);
    setLanguageFilter(sort.language || '');
    prevSortByRef.current = sort.type;
  };

  // Update total pages when filters change and all astrologers are loaded
  useEffect(() => {
    if (allAstrologersLoaded) {
      // Calculate total pages based on all filtered astrologers (not just current page)
      let allData = allAstrologers;
      let filtered = [...allData];

      // Apply the same filters as in the main useMemo
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter(
          (ast) =>
            ast.name.toLowerCase().includes(query) ||
            ast.specializations.some((s) => s.toLowerCase().includes(query))
        );
      }

      if (languageFilter !== "All") {
        filtered = filtered.filter((ast) =>
          ast.languages.some(lang => lang.toLowerCase() === languageFilter.toLowerCase())
        );
      }

      if (sortBy === 'video') {
        filtered = filtered.filter((ast) => ast.hasVideo);
      }

      const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
      setTotalPages(newTotalPages);
      setTotalAstrologers(filtered.length);
      
      // If current page is beyond the new total pages, reset to page 1
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  }, [allAstrologersLoaded, allAstrologers, debouncedSearchQuery, languageFilter, sortBy, itemsPerPage, currentPage]);

  // Reset to page 1 when filters change (for server-side pagination)
  useEffect(() => {
    if (!allAstrologersLoaded && (debouncedSearchQuery || languageFilter !== "All" || sortBy === 'video')) {
      // If we're using server-side pagination and filters change, reset to page 1
      if (currentPage !== 1) {
        setCurrentPage(1);
        fetchAstrologers(1);
      }
    }
  }, [debouncedSearchQuery, languageFilter, sortBy, allAstrologersLoaded, currentPage, fetchAstrologers]);

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
    console.log(`🔄 Page change requested: ${currentPage} -> ${newPage}, totalPages: ${totalPages}`);
    
    if (newPage >= 1 && newPage !== currentPage && !isLoadingPage) {
      console.log(`✅ Valid page change: ${newPage}`);
      
      if (allAstrologersLoaded) {
        // If all astrologers are loaded, just change the page (no API call needed)
        console.log(`📄 All astrologers loaded, changing page to ${newPage}`);
        setCurrentPage(newPage);
      } else {
        // If not all loaded, fetch the specific page
        console.log(`🌐 Fetching page ${newPage} from API`);
        fetchAstrologers(newPage);
      }
    } else {
      console.log(`❌ Invalid page change: newPage=${newPage}, currentPage=${currentPage}, isLoadingPage=${isLoadingPage}`);
    }
  }, [currentPage, isLoadingPage, allAstrologersLoaded, fetchAstrologers]);

  // Function to load all astrologers
  const loadAllAstrologers = useCallback(async () => {
    console.log('🚀 Loading all astrologers...');
    setIsLoadingAll(true);
    
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
        const skip = (currentPage - 1) * itemsPerPage;
        
        const response = await fetch(
          `${getApiBaseUrl()}/user/api/users?skip=${skip}&limit=${itemsPerPage}`,
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
        if (astrologers.length < itemsPerPage) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      console.log(`✅ Loaded ${allAstrologersData.length} total astrologers`);
      setAllAstrologers(allAstrologersData);
      setTotalAstrologers(allAstrologersData.length);
      setTotalPages(Math.ceil(allAstrologersData.length / itemsPerPage));
      setAllAstrologersLoaded(true);
      setCurrentPage(1); // Reset to first page
      
    } catch (error) {
      console.error("❌ Error loading all astrologers:", error);
      setError("Failed to load all astrologers. Please try again.");
    } finally {
      setIsLoadingAll(false);
    }
  }, [itemsPerPage]);

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
    if (mounted && !isLoading && astrologersData.length > 0) {
      console.log(`📊 Pagination initialized: ${astrologersData.length} astrologers on page ${currentPage}, total: ${totalAstrologers}, pages: ${totalPages}`);
    }
  }, [mounted, isLoading, astrologersData.length, currentPage, totalAstrologers, totalPages]);

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
    
    // Add a small delay to ensure token is properly stored after OTP verification
    const checkAuth = () => {
      const isAuthValid = isAuthenticated();
      
      if (!isAuthValid) {
        console.log('❌ Authentication initialization failed - redirecting to login');
        clearAuthData();
        router.push("/");
        return;
      }

      console.log('✅ Authentication validated, initializing data fetch...');
      fetchAstrologers();
      fetchWalletBalance();
    };

    // Small delay to ensure token storage is complete
    setTimeout(checkAuth, 100);
  }, [mounted, router]);

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
    setIsRefreshing(true);
    
    // Update token activity on user interaction
    // updateTokenActivity(); // This function was removed from imports
    
    try {
      // Reset to page 1 when refreshing
      if (currentPage !== 1) {
        console.log('📄 Resetting to page 1 for refresh');
        setCurrentPage(1);
      }
      await Promise.all([fetchAstrologers(1), fetchWalletBalance()]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* FilterBar and Top Controls */}
      <section className="w-full flex justify-center py-6 bg-transparent">
        <div className="w-full max-w-4xl rounded-2xl shadow-lg border border-orange-100/70 bg-white/90 backdrop-blur-lg px-4 py-3 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* FilterBar (search + sort by) */}
          <div className="flex-1">
            <FilterBar
              onSearch={setSearchQuery}
              onSortChange={handleSortChange}
              isLoading={isLoading}
              totalResults={totalAstrologers}
              searchQuery={searchQuery}
              selectedSort={sortBy}
              selectedLanguage={languageFilter}
            />
          </div>


          {/* Desktop Buttons (hidden on mobile) */}
          <div className="hidden sm:flex gap-2 items-center md:ml-4">
            <button
              onClick={() => setShowHistory(showHistory === 'transactions' ? 'none' : 'transactions')}
              className={`flex items-center justify-center gap-2 px-4 py-2 h-12 rounded-xl text-base font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 ${showHistory === 'transactions' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-100'}`}
              aria-label="Transaction History"
            >
              <CreditCard className="w-5 h-5" /> 
              <span className="whitespace-nowrap">Transactions</span>
            </button>
            <button
              onClick={() => setShowHistory(showHistory === 'calls' ? 'none' : 'calls')}
              className={`flex items-center justify-center gap-2 px-4 py-2 h-12 rounded-xl text-base font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 ${showHistory === 'calls' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-600 border-green-200 hover:bg-green-100'}`}
              aria-label="Call History"
            >
              <Phone className="w-5 h-5" /> 
              <span className="whitespace-nowrap">Calls</span>
            </button>
            <div className="flex items-center justify-center gap-2 px-4 py-2 h-12 rounded-xl border border-green-200 bg-white text-green-700 font-bold text-base shadow-sm select-none">
              <Wallet className="w-5 h-5 text-green-500" />
              <span className="whitespace-nowrap">₹{walletBalance?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-red-600 mb-4 text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="w-full text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#EF4444' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : 
          // Show loader if searching (searchQuery is non-empty and allAstrologersLoaded is false or isLoadingAll is true)
          ((searchQuery && (!allAstrologersLoaded || isLoadingAll)) || searching) ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-orange-100/60 backdrop-blur-sm z-0 rounded-2xl" />
              <div className="relative z-10 flex flex-col items-center justify-center max-w-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg animate-spin-slow">
                  <svg className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-orange-500 animate-spin" fill="none" viewBox="0 0 56 56">
                    <circle className="opacity-25" cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="6"></circle>
                    <path className="opacity-75" fill="currentColor" d="M8 28a20 20 0 0120-20v20z"></path>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-orange-800 mb-2 tracking-wide text-center">Finding the best astrologers...</h3>
                <p className="text-orange-600 mb-4 text-sm sm:text-base lg:text-lg text-center">Please wait while we update your results</p>
              </div>
              <style jsx>{`
                .animate-spin-slow {
                  animation: spin 1.2s linear infinite;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) :
        (!searching && filteredAstrologers.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No astrologers found</h3>
              <p className="text-gray-600 mb-4 text-sm">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setLanguageFilter("");
                  setSortBy(""); // Reset sort to default (Sort by)
                }}
                className="w-full text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4B5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B7280'}
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Render loader above AstrologerList */}
            {showBestAstrologerLoader ? (
  <div className="flex justify-center items-center min-h-[400px] w-full">
    <div className="w-full max-w-3xl mx-auto bg-orange-50/60 rounded-2xl flex flex-col items-center justify-center py-16 shadow-md border border-orange-100">
      <div className="mb-6">
        <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 shadow-inner">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="#F7971E" strokeWidth="4" fill="#FFF7ED" />
            <path d="M24 6a18 18 0 1 1-12.728 5.272" stroke="#F7971E" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-900 mb-2 text-center">Finding the best astrologers…</h2>
      <p className="text-orange-700 text-base sm:text-lg text-center">Please wait while we update your results</p>
    </div>
  </div>
) : (
  <AstrologerList astrologers={filteredAstrologers} compactButtons={sortBy === 'audio' || sortBy === 'video'} showVideoButton={sortBy === 'video'} />
)}
            
            {/* Mobile-Optimized Pagination */}
            {/* Debug: totalPages = {totalPages}, currentPage = {currentPage}, allAstrologersLoaded = {allAstrologersLoaded.toString()} */}
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

                  <div className="px-4 py-3 text-white rounded-lg font-medium min-w-[80px] text-center" style={{ backgroundColor: '#F7971E' }}>
                    {currentPage} {totalPages > 0 ? `/ ${totalPages}` : '+'}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={isLoadingPage}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      isLoadingPage
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
                            ? 'text-white shadow-lg'
                            : isLoadingPage
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200'
                        }`}
                        style={pageNum === currentPage ? { backgroundColor: '#F7971E' } : {}}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={isLoadingPage}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      isLoadingPage
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
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl" style={{ color: '#F7971E', backgroundColor: '#FDF4E6' }}>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F7971E' }}></div>
                  <span className="font-medium">Loading page {currentPage}...</span>
                </div>
              </div>
            )}

            {/* Loading indicator for loading all astrologers */}
            {isLoadingAll && (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center gap-4 px-8 py-6 rounded-xl" style={{ color: '#F7971E', backgroundColor: '#FDF4E6' }}>
                  <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F7971E' }}></div>
                  <div className="text-center">
                    <span className="font-medium text-lg">Loading All Astrologers...</span>
                    <p className="text-sm text-gray-600 mt-1">This may take a moment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
}