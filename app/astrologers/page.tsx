"use client";


import React, { useState, useMemo, useEffect, useCallback } from "react";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { useRouter } from "next/navigation";
import { getAuthToken, clearAuthData, isAuthenticated, getUserDetails, initializeAuth, isAuthenticatedAsync, updateTokenActivity } from "../utils/auth-utils";
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
  const [allAstrologers, setAllAstrologers] = useState<Astrologer[]>([]);
  const [allAstrologersLoaded, setAllAstrologersLoaded] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
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

  // Apply filters and pagination to astrologers data
  const { filteredAstrologers, paginatedAstrologers } = useMemo(() => {
    // Use all astrologers if loaded, otherwise use current page data
    let allData = allAstrologersLoaded ? allAstrologers : astrologersData;
    let filtered = [...allData];

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

    // If all astrologers are loaded, apply pagination to filtered results
    let paginated = filtered;
    if (allAstrologersLoaded) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      paginated = filtered.slice(startIndex, endIndex);
    }

    return {
      filteredAstrologers: filtered,
      paginatedAstrologers: paginated
    };
  }, [searchQuery, languageFilter, videoOnly, sortBy, astrologersData, allAstrologersLoaded, allAstrologers, currentPage, itemsPerPage]);

  // Update total pages when filters change and all astrologers are loaded
  useEffect(() => {
    if (allAstrologersLoaded) {
      // Calculate total pages based on all filtered astrologers (not just current page)
      let allData = allAstrologers;
      let filtered = [...allData];

      // Apply the same filters as in the main useMemo
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
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

      if (videoOnly) {
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
  }, [allAstrologersLoaded, allAstrologers, searchQuery, languageFilter, videoOnly, itemsPerPage, currentPage]);

  // Reset to page 1 when filters change (for server-side pagination)
  useEffect(() => {
    if (!allAstrologersLoaded && (searchQuery || languageFilter !== "All" || videoOnly || sortBy)) {
      // If we're using server-side pagination and filters change, reset to page 1
      if (currentPage !== 1) {
        setCurrentPage(1);
        fetchAstrologers(1);
      }
    }
  }, [searchQuery, languageFilter, videoOnly, sortBy, allAstrologersLoaded, currentPage, fetchAstrologers]);

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
    
    // Initialize auth with token validation and extension
    const isAuthValid = initializeAuth();
    
    if (!isAuthValid) {
      console.log('❌ Authentication initialization failed - redirecting to login');
      clearAuthData();
      router.push("/");
      return;
    }

    console.log('✅ Authentication validated, initializing data fetch...');
    
    // Add a delay to ensure proper cleanup after video call disconnect
    // This prevents the 401 error when returning from video calls
    const initializeData = setTimeout(() => {
      console.log('🚀 Starting data fetch...');
      fetchAstrologers(1);
      fetchWalletBalance();
      
      // Automatically load all astrologers for better performance
      // This eliminates the need for manual "Load All" button
      setTimeout(() => {
        if (!allAstrologersLoaded && !isLoadingAll) {
          console.log('🔄 Auto-loading all astrologers for better performance...');
          loadAllAstrologers();
        }
      }, 2000); // Wait 2 seconds after initial load to start loading all
    }, returningFromVideoCall ? 800 : 100); // Longer delay after video call
    
    // Set up token check interval with enhanced error handling
    const checkInterval = setInterval(() => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        console.log('❌ No token found during periodic check, redirecting');
        clearInterval(checkInterval);
        clearAuthData();
        router.push("/");
        return;
      }

      // Use authentication check with activity-based extension
      const isAuth = isAuthenticatedAsync();
      if (!isAuth) {
        console.log('❌ Authentication expired during session, cleaning up');
        clearInterval(checkInterval);
        clearAuthData();
        router.push("/");
      }
    }, 60000); // Check every minute

    // Set up wallet balance refresh interval - reduced frequency
    const walletInterval = setInterval(() => {
      // Only fetch if still authenticated with valid token
      const isAuth = isAuthenticatedAsync();
      if (isAuth) {
        fetchWalletBalance();
      }
    }, 120000); // Check every 2 minutes
    
    return () => {
      // Clean up intervals and timeouts
      clearTimeout(initializeData);
      clearInterval(checkInterval);
      clearInterval(walletInterval);
    };
  }, [router, fetchAstrologers, fetchWalletBalance, mounted, allAstrologersLoaded, loadAllAstrologers]);

  // Handle refresh button click
  const handleRefresh = async () => {
    console.log('🔄 Refresh requested');
    setIsRefreshing(true);
    
    // Update token activity on user interaction
    updateTokenActivity();
    
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
      {/* Mobile-Optimized Header */}
              <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo, Title and Filters */}
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F7971E' }}>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#F7971E' }}>
                    Find Your Astrologer
                  </h1>
                  <p className="text-xs text-gray-500 hidden lg:block">Connect with expert astrologers</p>
                </div>
                <h1 className="sm:hidden text-lg font-bold" style={{ color: '#F7971E' }}>Astrologers</h1>
              </div>
              
              {/* Integrated Search and Filters */}
              <div className="hidden lg:flex items-center gap-3 ml-6 flex-1 max-w-2xl">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search astrologers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F7971E';
                      e.target.style.boxShadow = '0 0 0 2px rgba(247, 151, 30, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 min-w-[100px]"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F7971E';
                      e.target.style.boxShadow = '0 0 0 2px rgba(247, 151, 30, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Sort by</option>
                    <option value="experience">Experience</option>
                    <option value="rating">Rating</option>
                    <option value="calls">Calls</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Language Filter */}
                <div className="relative">
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 min-w-[120px]"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F7971E';
                      e.target.style.boxShadow = '0 0 0 2px rgba(247, 151, 30, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="All">All Languages</option>
                    {allLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Video Toggle */}
                <button
                  onClick={() => setVideoOnly(!videoOnly)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-105 ${
                    videoOnly
                      ? "text-white shadow-md"
                      : "border border-gray-300 text-gray-700 bg-gray-50 hover:bg-white"
                  }`}
                  style={videoOnly ? { backgroundColor: '#F7971E' } : {}}
                  onMouseEnter={(e) => {
                    if (videoOnly) {
                      e.currentTarget.style.backgroundColor = '#E8850B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (videoOnly) {
                      e.currentTarget.style.backgroundColor = '#F7971E';
                    }
                  }}
                >
                  📹 Video
                </button>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg transition-all ${
                  isRefreshing 
                    ? 'cursor-not-allowed' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                style={isRefreshing ? { color: '#F7971E', backgroundColor: '#FDF4E6' } : {}}
                title={isRefreshing ? "Refreshing..." : "Refresh data"}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Right side - Mobile optimized controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                title="Search & Filter"
              >
                <Search className="h-4 w-4" />
              </button>
              {/* History Buttons - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(showHistory === 'transactions' ? 'none' : 'transactions')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showHistory === 'transactions' 
                      ? 'text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={showHistory === 'transactions' ? { backgroundColor: '#F7971E' } : {}}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Transactions</span>
                </button>
                
                <button
                  onClick={() => setShowHistory(showHistory === 'calls' ? 'none' : 'calls')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showHistory === 'calls' 
                      ? 'text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={showHistory === 'calls' ? { backgroundColor: '#22C55E' } : {}}
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
                      ? 'text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={showHistory === 'transactions' ? { backgroundColor: '#F7971E' } : {}}
                  title="Transaction History"
                >
                  <Receipt className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowHistory(showHistory === 'calls' ? 'none' : 'calls')}
                  className={`p-2 rounded-lg transition-all ${
                    showHistory === 'calls' 
                      ? 'text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={showHistory === 'calls' ? { backgroundColor: '#22C55E' } : {}}
                  title="Call History"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              
              {/* Wallet Balance - Mobile Optimized */}
              <div className="relative">
                <div className={`flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 shadow-sm transition-all border ${
                  walletError 
                    ? 'border-red-200' 
                    : 'border-green-200 hover:shadow-md'
                }`}
                style={{
                  backgroundColor: walletError ? '#FEF2F2' : '#F0FDF4'
                }}>
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
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#FDF4E6' }}>
                    <Receipt className="h-5 w-5" style={{ color: '#F7971E' }} />
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

      {/* Mobile Filter Section */}
      <section className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
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
        <div className="bg-gradient-to-r from-orange-50/50 to-gray-50 border-b border-gray-200">
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
                    {allAstrologersLoaded 
                      ? `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, filteredAstrologers.length)} of ${filteredAstrologers.length} astrologers`
                      : `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, astrologersData.length)} of ${totalAstrologers} astrologers`
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-xs px-3 py-1 rounded-full border" style={{ color: '#F7971E', backgroundColor: 'white', borderColor: '#F7971E' }}>
                  Page {currentPage} {totalPages > 0 ? `/ ${totalPages}` : '+'}
                </div>
                {isLoadingAll && (
                  <div className="flex items-center gap-2 px-3 py-1 text-xs rounded-full border" style={{ color: '#F7971E', backgroundColor: '#FDF4E6', borderColor: '#F7971E' }}>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading All...</span>
                  </div>
                )}
                {allAstrologersLoaded && (
                  <div className="text-xs px-3 py-1 rounded-full border" style={{ color: '#22C55E', backgroundColor: 'white', borderColor: '#22C55E' }}>
                    All {totalAstrologers} Loaded
                  </div>
                )}
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 rounded-full animate-spin" style={{ borderColor: '#FFB366' }}></div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: '#F7971E' }}></div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600 font-medium text-lg mb-2">Finding the best astrologers for you...</p>
              <p className="text-gray-500 text-sm">Please wait while we load expert astrologers</p>
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
        ) : paginatedAstrologers.length === 0 ? (
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
                  setLanguageFilter("All");
                  setVideoOnly(false);
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
            <AstrologerList astrologers={paginatedAstrologers} />
            
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
    </div>
  );
}