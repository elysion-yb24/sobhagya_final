"use client";

import React, { useState, useEffect, useCallback } from "react";
import AstrologerList from "../components/astrologers/AstrologerList";
import FilterBar from "../components/astrologers/FilterBar";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthToken, getUserDetails } from "../utils/auth-utils";
import TransactionHistory from "../components/history/TransactionHistory";
import CallHistory from "../components/history/CallHistory";
import { Wallet, Phone, X, CreditCard } from "lucide-react";
import { getApiBaseUrl } from "../config/api";
import { useWalletBalance, WalletBalanceProvider } from "../components/astrologers/WalletBalanceContext";
import { SessionManagerProvider } from "../components/astrologers/SessionManager";
import { API_CONFIG } from "../config/api";

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
  status?: string;
  rpm?: number;
  videoRpm?: number;
}

function AstrologersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allAstrologers, setAllAstrologers] = useState<Astrologer[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [sortBy, setSortBy] = useState<"audio" | "video" | "language" | "">(
    (searchParams?.get("sortBy") as "audio" | "video" | "language") || ""
  );
  const [languageFilter, setLanguageFilter] = useState(searchParams?.get("language") || "All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<"none" | "transactions" | "calls">("none");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { walletBalance } = useWalletBalance();

  
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
  


  // 🔒 Redirect if "friend" role
  useEffect(() => {
    const user = getUserDetails();
    if (user?.role === "friend") router.push("/partner-info");
  }, [router]);

  
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
        if (!token) {
          setError("Authentication required. Please log in.");
          return;
        }
  
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
          endpoint = `${getApiBaseUrl()}/${API_CONFIG.ENDPOINTS.USER.USERS}?${queryString}`;
        }
  
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });
  
        if (!res.ok) throw new Error("Failed to fetch astrologers");
  
        const data = await res.json();
  
        const newAstrologers: Astrologer[] = query
          ? data.data?.list || data.users || data.data || []
          : data.data?.list || [];
  
        setAllAstrologers(prev => {
          if (append && !query) {
            // ✅ filter out duplicates
            const existingIds = new Set(prev.map(a => a._id));
            const uniqueNew = newAstrologers.filter(a => !existingIds.has(a._id));
            return [...prev, ...uniqueNew];
          }
          return newAstrologers;
        });
  
        setHasMore(!query && newAstrologers.length === limit);
        if (!query) setCurrentPage(page);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch astrologers");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, languageFilter, sortBy]
  );
  
  
  
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
  };

 
  const handleSearchClick = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setAllAstrologers([])
    fetchAstrologers(1, false,query,languageFilter,sortBy);
    updateURL(1, query,sortBy,languageFilter); 
  };
  

  const handleSortChange = useCallback(
    (sort: { type: string; language?: string }) => {
      setSortBy(sort.type as any);
      setLanguageFilter(sort.language || "All");
      setCurrentPage(1);
      setAllAstrologers([])
  
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

    fetchAstrologers(1, false);
    router.push(window.location.pathname, { scroll: false });
  }, [router, fetchAstrologers]);

  // 🔹 Initial fetch on mount
  useEffect(() => {
    fetchAstrologers(1, false);
  }, [fetchAstrologers]);

  return (
    <>
      <section className="w-full flex justify-center py-3">
        <div className="w-full max-w-7xl mx-auto px-10 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
          <div className="flex-1 min-w-0">
            <FilterBar
              searchQuery={searchQuery}
              selectedSort={sortBy}
              selectedLanguage={languageFilter}
              onClearFilters={clearFilters}
              onSearchClick={handleSearchClick}        // triggers fetch + URL
              onSortChange={handleSortChange}
              isLoading={isLoading}
              
            />
          </div>

          <div className="hidden sm:flex gap-4 items-center md:ml-8 flex-shrink-0">
            <button
              onClick={() =>
                setShowHistory(showHistory === "transactions" ? "none" : "transactions")
              }
              className={`flex items-center gap-2 px-6 py-2.5 h-14 rounded-full font-semibold border transition-all ${showHistory === "transactions"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-orange-500 border-orange-200 hover:bg-orange-100"
                }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() =>
                setShowHistory(showHistory === "calls" ? "none" : "calls")
              }
              className={`flex items-center gap-2 px-6 py-2.5 h-14 rounded-full font-semibold border transition-all ${showHistory === "calls"
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-green-600 border-green-200 hover:bg-green-100"
                }`}
            >
              <Phone className="w-5 h-5" />
              <span>Calls</span>
            </button>

            <div className="flex items-center gap-2 px-6 py-2.5 h-14 rounded-full border border-green-200 bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-bold">
              <Wallet className="w-5 h-5 text-green-500" />
              <span>₹{walletBalance?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {isLoading ? (
          <div className="flex flex-col items-center py-12">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading Astrologers...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAstrologers(1, false)}
              className="px-6 py-3 rounded-lg bg-orange-500 text-white"
            >
              Retry
            </button>
          </div>
        ) : allAstrologers.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-gray-600">No astrologers found. Try adjusting your search.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-3 rounded-lg bg-gray-600 text-white"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <AstrologerList
            astrologers={allAstrologers}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasError={!!error}
            compactButtons={sortBy === "audio" || sortBy === "video"}
            showVideoButton={sortBy === "video"}
            source="astrologersPage"
            hasMore={hasMore}
            onLoadMore={() => {
              const nextPage = currentPage + 1;
              setCurrentPage(nextPage);
              fetchAstrologers(nextPage, true);
              updateURL(nextPage);
            }}
          />
        )}
      </main>

      {showHistory !== "none" && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowHistory("none")} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {showHistory === "transactions" ? "Transaction History" : "Call History"}
              </h2>
              <button onClick={() => setShowHistory("none")} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {showHistory === "transactions" && <TransactionHistory />}
              {showHistory === "calls" && <CallHistory />}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function AstrologersPage() {
  return (
    <WalletBalanceProvider>
      <SessionManagerProvider>
        <AstrologersPageContent />
      </SessionManagerProvider>
    </WalletBalanceProvider>
  );
}
