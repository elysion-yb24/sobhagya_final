"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  showEndMessage?: boolean;
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
  showEndMessage = false,
  onCallModalOpen,
}) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ✅ Intersection Observer
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

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
  }, [onLoadMore, hasMore, isLoadingMore]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-0">
        {astrologers.map((astrologer, index) => (
          <motion.div
            key={`${astrologer._id}-${index}`}
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (index % 6) * 0.1 }}
          >
            <AstrologerCard
              astrologer={astrologer}
              compactButtons={compactButtons}
              showVideoButton={showVideoButton || astrologer.hasVideo}
              source={source}
              onCallModalOpen={onCallModalOpen}
            />
          </motion.div>
        ))}
      </div>

      {/* 👇 Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* End message */}
      {showEndMessage && !hasMore && (
        <div className="flex justify-center py-8 px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-lg md:text-xl text-gray-500 font-medium" style={{ fontFamily: "EB Garamond" }}>
              ——— Over 10,000 more experts astrologers at your service ———
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AstrologerList;
