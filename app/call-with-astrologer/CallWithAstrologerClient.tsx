"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { WalletBalanceProvider } from "../components/astrologers/WalletBalanceContext";
import { getApiBaseUrl, API_CONFIG } from "../config/api";
import { isAuthenticated, getAuthToken, getUserDetails } from "../utils/auth-utils";

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
  about?: string;
  age?: number;
  avatar?: string;
  calls?: number;
  rpm?: number;
  videoRpm?: number;
  talksAbout?: string[];
  status?: string;
  isLive?: boolean;
  isLiveBlocked?: boolean;
}

interface CallWithAstrologerClientProps {
  initialAstrologers: Astrologer[];
  error: string | null;
}

const EnhancedLoader = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-32"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200 rounded-full animate-pulse"></div>
    </div>
    <motion.p
      className="mt-4 text-gray-600 font-medium"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Loading astrologers...
    </motion.p>
  </motion.div>
);

const CallWithAstrologerClient: React.FC<CallWithAstrologerClientProps> = ({
  initialAstrologers,
  error: initialError,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [astrologers, setAstrologers] = useState<Astrologer[]>(initialAstrologers || []);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [sortBy, setSortBy] = useState<"audio" | "video" | "language" | "">(
    (searchParams?.get("sortBy") as "audio" | "video" | "language") || ""
  );
  const [languageFilter, setLanguageFilter] = useState(searchParams?.get("language") || "All");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<Astrologer | null>(null);

  // This prevents immediate double-fetching if SSR injected pure array and no filters exist
  const isFirstRender = React.useRef(true);

  const updateURL = useCallback(
    (
      page: number = 1,
      query: string = searchQuery,
      sort: string = sortBy,
      language: string = languageFilter
    ) => {
      const skip = (page - 1) * 10;
      const queryParts = [
        `skip=${skip}`,
        `limit=10`,
        query ? `search=${encodeURIComponent(query)}` : "",
        language && language !== "All" ? `language=${encodeURIComponent(language)}` : "",
        sort ? `sortBy=${encodeURIComponent(sort)}` : ""
      ];
      const queryString = queryParts.filter(Boolean).join("&");
      router.push(`${window.location.pathname}?${queryString}`, { scroll: false });
    },
    [router, searchQuery, sortBy, languageFilter]
  );

  const fetchAstrologers = useCallback(
    async (
      page: number = 1,
      append: boolean = false,
      query: string = searchQuery,
      language: string = languageFilter,
      sort: string = sortBy
    ) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const token = getAuthToken();
        const skip = (page - 1) * 10;
        const limit = 10;
        let endpoint = "";

        if (query) {
          endpoint = `${getApiBaseUrl()}/${API_CONFIG.ENDPOINTS.USER.SEARCH}?name=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;
          if (language && language !== "All") endpoint += `&language=${encodeURIComponent(language)}`;
          if (sort) endpoint += `&sortBy=${encodeURIComponent(sort)}`;
        } else {
          const queryParts = [
            `skip=${skip}`,
            `limit=${limit}`,
            language && language !== "All" ? `language=${encodeURIComponent(language)}` : "",
            sort ? `sortBy=${encodeURIComponent(sort)}` : ""
          ];
          const queryString = queryParts.filter(Boolean).join("&");
          endpoint = `${getApiBaseUrl()}/user/api/users-list?${queryString}`;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        // Authenticated layer (so the endpoints are happy if token exists)
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers,
          credentials: "omit",
          cache: "no-store", // CRITICAL for dynamic real-time bypass mimicking /astrologers
        });

        if (!res.ok) throw new Error("Failed to fetch astrologers");

        const data = await res.json();
        const newAstrologers: Astrologer[] = query
          ? data.data?.list || data.users || data.data || []
          : data.data?.list || [];

        setAstrologers(prev => {
          if (append && !query) {
            const existingIds = new Set(prev.map(a => a._id));
            const uniqueNew = newAstrologers.filter((a: Astrologer) => !existingIds.has(a._id));
            return [...prev, ...uniqueNew];
          }
          return newAstrologers;
        });

        setHasMore(!query && newAstrologers.length === limit);
        if (!query) setCurrentPage(page);
      } catch (err) {
        console.error("Fetch astrologers error", err);
        setError("Failed to fetch astrologers. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, languageFilter, sortBy]
  );

  const handleSearchClick = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setAstrologers([]);
    fetchAstrologers(1, false, query, languageFilter, sortBy);
    updateURL(1, query, sortBy, languageFilter);
  };

  const handleSortChange = useCallback(
    (sort: { type: string; language?: string }) => {
      setSortBy(sort.type as any);
      setLanguageFilter(sort.language || "All");
      setCurrentPage(1);
      setAstrologers([]);
      fetchAstrologers(1, false, searchQuery, sort.language || "All", sort.type);
      updateURL(1, searchQuery, sort.type, sort.language || "All");
    },
    [fetchAstrologers, searchQuery, updateURL]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setLanguageFilter("All");
    setSortBy("");
    setCurrentPage(1);
    fetchAstrologers(1, false, "", "All", "");
    router.push(window.location.pathname, { scroll: false });
  }, [router, fetchAstrologers]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Triggers fetch ONLY on load if filters are pre-populated via URL params
      if (searchQuery || languageFilter !== "All" || sortBy) {
        fetchAstrologers(1, false, searchQuery, languageFilter, sortBy);
      }
    }
  }, [fetchAstrologers, searchQuery, languageFilter, sortBy]);

  // 🔄 Auto-refresh polling (Real-time Status Sync)
  useEffect(() => {
    // Only poll if we have data loaded
    if (astrologers.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const token = getAuthToken();
        const skip = 0;
        // Fetch exactly the amount we currently have loaded to maintain infinite scroll depth
        const limit = Math.max(10, astrologers.length);
        let endpoint = "";

        if (searchQuery) {
          endpoint = `${getApiBaseUrl()}/${API_CONFIG.ENDPOINTS.USER.SEARCH}?name=${encodeURIComponent(searchQuery)}&skip=${skip}&limit=${limit}`;
          if (languageFilter && languageFilter !== "All") endpoint += `&language=${encodeURIComponent(languageFilter)}`;
          if (sortBy) endpoint += `&sortBy=${encodeURIComponent(sortBy)}`;
        } else {
          const queryParts = [
            `skip=${skip}`,
            `limit=${limit}`,
            languageFilter && languageFilter !== "All" ? `language=${encodeURIComponent(languageFilter)}` : "",
            sortBy ? `sortBy=${encodeURIComponent(sortBy)}` : ""
          ];
          const queryString = queryParts.filter(Boolean).join("&");
          endpoint = `${getApiBaseUrl()}/user/api/users-list?${queryString}`;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers,
          credentials: "omit",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        const freshList: Astrologer[] = searchQuery
          ? data.data?.list || data.users || data.data || []
          : data.data?.list || [];

        if (freshList && freshList.length > 0) {
          // Replace the visible list to instantly reflect status changes and ranking bumps (someone coming online)
          setAstrologers(freshList);
        }
      } catch (err) {
        // Silently ignore polling errors so UX is uninterrupted
      }
    }, 12000); // 12 seconds auto-refresh

    return () => clearInterval(pollInterval);
  }, [astrologers.length, searchQuery, languageFilter, sortBy]);

  // Handle call modal
  const handleCallModalOpen = (astrologer: Astrologer) => {
    setSelectedCallAstrologer(astrologer);
    setShowCallOptions(true);
  };

  // Direct call initiation for authenticated users
  const initiateDirectCall = async (astrologer: Astrologer, callType: 'audio' | 'video') => {
    try {
      const token = getAuthToken();
      const user = getUserDetails();
      if (!token || !user?.id) {
        localStorage.setItem("selectedAstrologerId", astrologer._id);
        localStorage.setItem("callIntent", callType);
        localStorage.setItem("callSource", "callWithAstrologer");
        router.push("/login");
        return;
      }

      if (user.role === 'friend') {
        alert('You Are a Partner At Sobhagya, So Call Cannot Be Initiated');
        return;
      }

      const channelId = Date.now().toString();
      const livekitUrl = `/api/calling/call-token-livekit?channel=${encodeURIComponent(channelId)}`;
      const body = {
        receiverUserId: astrologer._id,
        type: callType === 'audio' ? 'call' : 'video',
        appVersion: '1.0.0'
      };

      const response = await fetch(livekitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok || !data?.data?.token || !data?.data?.channel) {
        throw new Error(data?.message || 'Failed to initiate call');
      }

      localStorage.setItem('lastAstrologerId', astrologer._id);
      localStorage.setItem('callSource', 'callWithAstrologer');

      const dest = callType === 'audio'
        ? `/audio-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologer.name)}&astrologerId=${encodeURIComponent(astrologer._id)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`
        : `/video-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologer.name)}&astrologerId=${encodeURIComponent(astrologer._id)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`;

      router.push(dest);
    } catch (err) {
      console.error('\u274c Direct call initiation failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to initiate call');
    }
  };

  const handleCallTypeSelection = (callType: 'audio' | 'video') => {
    if (selectedCallAstrologer) {
      setShowCallOptions(false);
      if (isAuthenticated()) {
        initiateDirectCall(selectedCallAstrologer, callType);
      } else {
        localStorage.setItem("selectedAstrologerId", selectedCallAstrologer._id);
        localStorage.setItem("callIntent", callType);
        localStorage.setItem("callSource", "callWithAstrologer");
        router.push("/login");
      }
    }
  };

  return (
    <WalletBalanceProvider>
      <div className="w-full bg-white min-h-screen">
        {/* 🟠 Hero Section */}
        <motion.div
          className="relative h-[160px] sm:h-[180px] md:h-[200px] overflow-hidden mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/call.svg"
            alt="call-image"
            fill
            className="brightness-75 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          <div className="relative flex flex-col items-center justify-center h-full text-center px-6">
            <motion.h1
              className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
              style={{ fontFamily: "EB Garamond" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Call with Astrologer
            </motion.h1>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 py-4">
          <motion.p
            className="text-base sm:text-lg font-light mb-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Our astrology experts are ready to assist you! Whether you need a consultation or have inquiries, get immediate answers to your life's questions.
          </motion.p>
          <motion.p
            className="text-base sm:text-lg font-light text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-black font-medium">Connect with skilled Astrologers </span>for personalized insights on love, career, health, and beyond.
          </motion.p>
        </div>

        {/* 🎯 Filter Section */}
        <section className="relative z-50 w-full max-w-6xl mx-auto px-6 py-2 mb-6">
          <FilterBar
            searchQuery={searchQuery}
            selectedSort={sortBy}
            selectedLanguage={languageFilter}
            onClearFilters={clearFilters}
            onSearchClick={handleSearchClick}
            onSortChange={handleSortChange}
            isLoading={isLoading}
          />
        </section>

        {/* 🟠 Astrologers */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          {error ? (
            <motion.div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load Astrologers
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
              </div>
            </motion.div>
          ) : astrologers.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center py-16">
              <p className="text-gray-600">No astrologers found. Try adjusting your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 rounded-lg bg-orange-600 text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <AstrologerList
                astrologers={astrologers}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasError={!!error}
                compactButtons={sortBy === "audio" || sortBy === "video"}
                showVideoButton={sortBy === "video" || true}
                source="callWithAstrologer"
                hasMore={hasMore}
                onLoadMore={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  fetchAstrologers(nextPage, true, searchQuery, languageFilter, sortBy);
                  updateURL(nextPage, searchQuery, sortBy, languageFilter);
                }}
                onCallModalOpen={handleCallModalOpen}
              />
            </motion.div>
          )}
        </div>

        {/* Call Options Modal */}
        {showCallOptions && selectedCallAstrologer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Header with icon */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08C7.85 2 8.54 2.51 8.71 3.27C8.95 4.33 9.3 5.36 9.75 6.33C9.97 6.82 9.83 7.4 9.42 7.73L8.09 9.06C9.51 11.41 11.59 13.49 13.94 14.91L15.27 13.58C15.6 13.17 16.18 13.03 16.67 13.25C17.64 13.7 18.67 14.05 19.73 14.29C20.49 14.46 21 15.15 21 15.92V16.92" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  Choose Call Type
                </h3>
                <p className="text-gray-500 text-center text-sm mt-1">
                  Connect with <span className="font-semibold text-gray-700">{selectedCallAstrologer?.name}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleCallTypeSelection('audio')}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-5 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08C7.85 2 8.54 2.51 8.71 3.27" />
                    <path d="M15 5V9M13 7H17" />
                  </svg>
                  Audio Call
                </button>
                
                <button
                  onClick={() => handleCallTypeSelection('video')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 px-5 rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  Video Call
                </button>
              </div>
              
              <button
                onClick={() => setShowCallOptions(false)}
                className="w-full mt-4 text-gray-500 py-2.5 px-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </WalletBalanceProvider>
  );
};

export default CallWithAstrologerClient;
