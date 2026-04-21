"use client";

import React, { useEffect, useRef } from "react";
import AstrologerCard from "./AstrologerCard";
import { AstrologerCardSkeleton, ListSkeleton } from "../ui/SkeletonLoader";

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

interface AstrologerListProps {
  astrologers: Astrologer[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  compactButtons?: boolean;
  showVideoButton?: boolean;
  source?: string;
  onLoadMore?: () => void; // 👈 callback for infinite scroll
  hasMore?: boolean;
  onCallModalOpen?: (astrologer: any) => void;
}

const AstrologerList: React.FC<AstrologerListProps> = ({
  astrologers,
  isLoading = false,
  isLoadingMore = false,
  hasError = false,
  onRetry,
  compactButtons = false,
  showVideoButton = false,
  source,
  onLoadMore,
  hasMore = true,
  onCallModalOpen,
}) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ✅ Compute the ordered list first so the infinite-scroll effect can
  // know whether we've already saturated the display (we cap offline
  // astrologers at 5 and render the 10,000+ banner after that).
  const statusRank = (s?: string) => {
    const v = (s || "").toLowerCase();
    if (v === "online" || v === "available") return 0;
    if (v === "busy" || v === "on-call" || v === "oncall") return 1;
    return 2;
  };
  const sorted = [...astrologers].sort((a, b) => statusRank(a.status) - statusRank(b.status));
  const online = sorted.filter(a => statusRank(a.status) === 0);
  const busy = sorted.filter(a => statusRank(a.status) === 1);
  const offlineRaw = sorted.filter(a => statusRank(a.status) === 2);
  const OFFLINE_CAP = 5;
  const offlineCapped = offlineRaw.slice(0, OFFLINE_CAP);
  const ordered = [...online, ...busy, ...offlineCapped];
  // If we've already shown the cap of offline astrologers, we consider the
  // visible list "saturated" — stop fetching more pages and show the
  // 10,000+ banner instead, regardless of backend hasMore.
  const listSaturated = offlineRaw.length >= OFFLINE_CAP;
  const effectiveHasMore = hasMore && !listSaturated;

  // ✅ Intersection Observer
  useEffect(() => {
    if (!onLoadMore || !effectiveHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [onLoadMore, effectiveHasMore, isLoadingMore]);

  if (isLoading && astrologers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 px-2 sm:px-0">
          <ListSkeleton count={6} ItemSkeleton={AstrologerCardSkeleton} />
        </div>
      </div>
    );
  }

  if (hasError && astrologers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Astrologers
          </h3>
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to our servers. Please check your
            internet connection and try again.
          </p>
          {onRetry && (
            <button onClick={onRetry} className="btn-primary">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isLoading && astrologers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Astrologers Found
        </h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 px-2 sm:px-0">
        {ordered.map((astrologer, index) => (
          <div
          key={`${astrologer._id}-${index}`}
            className="animate-fadeInUp flex justify-center"
            style={{ animationDelay: `${(index % 6) * 0.1}s` }}
          >
            <AstrologerCard
              astrologer={astrologer}
              compactButtons={compactButtons}
              showVideoButton={showVideoButton || astrologer.hasVideo}
              source={source}
              onCallModalOpen={onCallModalOpen}
            />
          </div>
        ))}
      </div>

      {!effectiveHasMore && ordered.length > 0 && (
        <div className="flex justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 text-center shadow-sm">
            <div className="text-3xl font-extrabold text-[#F7971E]">10,000+</div>
            <p className="mt-2 text-gray-700 font-medium">astrologers available on Sobhagya</p>
            <p className="mt-1 text-sm text-gray-500">Recharge your wallet to connect instantly with more experts.</p>
          </div>
        </div>
      )}

      {/* 👇 Infinite scroll sentinel */}
      {effectiveHasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  );
};

export default AstrologerList;
