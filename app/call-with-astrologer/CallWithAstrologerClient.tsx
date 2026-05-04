"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { WalletBalanceProvider } from "../components/astrologers/WalletBalanceContext";
import { getApiBaseUrl } from "../config/api";
import { isAuthenticated, getAuthToken, getUserDetails } from "../utils/auth-utils";
import { appendAstrologers } from "../utils/astrologer-cache";
import { Phone, Video, X, PhoneCall } from "lucide-react";

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

        const safeQuery = query.replace(/[\\^$*+?.()|[\]{}]/g, '').trim();

        // Always use users-list and filter by name client-side. The /search endpoint is
        // unreliable (auth-gated, inconsistent response shape) and produces empty results
        // for valid queries. users-list is permissive and works for all users.
        const queryLimit = safeQuery ? 200 : limit;
        const querySkip = safeQuery ? 0 : skip;
        const queryParts = [
          `skip=${querySkip}`,
          `limit=${queryLimit}`,
          `asc=-1`,
          language && language !== "All" ? `language=${encodeURIComponent(language)}` : "",
          sort === "video" ? `video=true` : "",
          sort !== "video" && sort !== "audio" && sort ? `sortBy=${encodeURIComponent(sort)}` : ""
        ];
        const queryString = queryParts.filter(Boolean).join("&");
        const endpoint = `${getApiBaseUrl()}/user/api/users-list?${queryString}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        // Authenticated layer (so the endpoints are happy if token exists)
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store", // CRITICAL for dynamic real-time bypass mimicking /astrologers
        });

        if (!res.ok) {
          // If the backend returns 404 (Not Found) or 401, treat it as empty results rather than crashing
          if (res.status === 404 || res.status === 401) {
            setAstrologers(prev => append && !query ? prev : []);
            setHasMore(false);
            setIsLoading(false);
            setIsLoadingMore(false);
            return;
          }
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to fetch astrologers: ${res.status} ${text}`);
        }

        const data = await res.json();
        const rawList: Astrologer[] = data.data?.list || data.users || data.data || [];
        // Feed the shared cache before client-side filtering — so the profile page
        // can find anyone we've already loaded, even if they were filtered out
        // of the visible list by the current search query.
        appendAstrologers(rawList);

        let newAstrologers: Astrologer[] = rawList;
        if (safeQuery) {
          const q = safeQuery.toLowerCase();
          newAstrologers = newAstrologers.filter(a => a.name?.toLowerCase().includes(q));
        }

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

        const safeQuery = searchQuery.replace(/[\\^$*+?.()|[\]{}]/g, '').trim();

        const queryLimit = safeQuery ? 200 : limit;
        const queryParts = [
          `skip=${skip}`,
          `limit=${queryLimit}`,
          `asc=-1`,
          languageFilter && languageFilter !== "All" ? `language=${encodeURIComponent(languageFilter)}` : "",
          sortBy === "video" ? `video=true` : "",
          sortBy !== "video" && sortBy !== "audio" && sortBy ? `sortBy=${encodeURIComponent(sortBy)}` : ""
        ];
        const queryString = queryParts.filter(Boolean).join("&");
        const endpoint = `${getApiBaseUrl()}/user/api/users-list?${queryString}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        const rawFresh: Astrologer[] = data.data?.list || data.users || data.data || [];
        appendAstrologers(rawFresh);

        let freshList: Astrologer[] = rawFresh;
        if (safeQuery) {
          const q = safeQuery.toLowerCase();
          freshList = freshList.filter(a => a.name?.toLowerCase().includes(q));
        }

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

      const avatarUrl = (astrologer as any).avatar || astrologer.profileImage || '';
      const rpmStr = String(callType === 'audio' ? (astrologer.rpm ?? '') : (astrologer.videoRpm ?? astrologer.rpm ?? ''));
      const common = `token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologer.name)}&astrologerId=${encodeURIComponent(astrologer._id)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}&avatar=${encodeURIComponent(avatarUrl)}&rpm=${encodeURIComponent(rpmStr)}`;
      const dest = callType === 'audio' ? `/audio-call?${common}` : `/video-call?${common}`;

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
      <div className="w-full min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
        {/* 🟠 Hero Section */}
        <motion.div
          className="relative h-[140px] sm:h-[180px] md:h-[210px] overflow-hidden mb-4 sm:mb-8"
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
              className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-1 sm:mb-2"
              style={{ fontFamily: "EB Garamond" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Call with Astrologer
            </motion.h1>
            <p className="text-orange-100/90 text-xs sm:text-sm font-medium tracking-wide">
              Live experts • Instant guidance • Mobile-first experience
            </p>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <motion.p
            className="text-sm sm:text-base md:text-lg font-light mb-3 text-center text-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Our astrology experts are ready to assist you! Whether you need a consultation or have inquiries, get immediate answers to your life's questions.
          </motion.p>
          <motion.p
            className="text-sm sm:text-base md:text-lg font-light text-center text-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-black font-medium">Connect with skilled Astrologers </span>for personalized insights on love, career, health, and beyond.
          </motion.p>
        </div>

        {/* 🎯 Filter Section */}
        <section className="z-[95] isolate w-full max-w-6xl mx-auto px-4 sm:px-6 py-2 mb-6 sticky top-[98px] md:top-[64px] lg:top-[112px] bg-white border-y border-orange-100/70 shadow-sm transition-all duration-300">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 relative z-0">
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
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-gray-600">No astrologers found. Try adjusting your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold shadow-sm hover:bg-orange-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <AstrologerList
                astrologers={(() => {
                  const q = searchQuery.trim().toLowerCase();
                  if (!q) return astrologers;
                  return astrologers.filter(a => a.name?.toLowerCase().includes(q));
                })()}
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

        {showCallOptions && selectedCallAstrologer && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] font-['Inter'] p-4">
            <motion.div
              className="bg-white rounded-[24px] p-5 sm:p-6 max-w-[340px] w-full shadow-2xl border border-white/20 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <button 
                onClick={() => setShowCallOptions(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3 text-[#F7941D]">
                  <PhoneCall className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center tracking-tight">
                  Choose Call Type
                </h3>
                <p className="text-gray-500 text-center text-xs mt-1 font-medium leading-relaxed">
                  Connect with <span className="text-[#F7941D] font-semibold">{selectedCallAstrologer?.name}</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleCallTypeSelection('audio')}
                  className="w-full bg-[#F7941D] hover:bg-[#e8891a] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-orange-500/10 transition-all duration-200"
                >
                  <Phone className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm">Audio Call</span>
                </button>

                <button
                  onClick={() => handleCallTypeSelection('video')}
                  className="w-full bg-[#333333] hover:bg-[#222222] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md shadow-gray-900/10 transition-all duration-200"
                >
                  <Video className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm">Video Call</span>
                </button>
              </div>

              <button
                onClick={() => setShowCallOptions(false)}
                className="w-full mt-5 text-gray-400 py-1 text-[11px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
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
