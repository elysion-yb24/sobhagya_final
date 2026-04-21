"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAuthToken } from "../../utils/auth-utils";
import { Phone, Clock, Video, PhoneCall, PhoneMissed, PhoneOff, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

interface CallLog {
  _id: string;
  callerId: string;
  receiverId: string;
  callerName: string;
  receiverName: string;
  duration: number;
  createdAt: string;
  status: string;
  rpm?: number;
  reason?: string;
  type?: string; // 'call' | 'video'
  channel?: string;
  receiverProfileImage?: string;
}

export default function CallHistory() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchCallLogs = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1 && !append) setIsLoading(true);
      else if (append) setIsLoadingMore(true);

      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const skip = (page - 1) * 10;
      const apiUrl = `/api/calling/call-log?skip=${skip}&limit=10&role=user`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        let calls: CallLog[] = [];

        if (data.data?.list && Array.isArray(data.data.list)) calls = data.data.list;
        else if (data.list && Array.isArray(data.list)) calls = data.list;
        else if (Array.isArray(data.data)) calls = data.data;
        else if (Array.isArray(data)) calls = data;

        setCallLogs((prev) => {
          if (append) {
            const existingIds = new Set(prev.map((c) => c._id));
            const uniqueNew = calls.filter((c) => !existingIds.has(c._id));
            return [...prev, ...uniqueNew];
          }
          return calls;
        });

        setHasMore(calls.length === 10);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch call logs");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCallLogs(1, false);
  }, [fetchCallLogs]);

  // Load more function
  const loadMoreCallLogs = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCallLogs(nextPage, true);
  }, [hasMore, isLoadingMore, currentPage, fetchCallLogs]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) loadMoreCallLogs();
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, isLoadingMore, loadMoreCallLogs]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // ✅ Updated formatDuration to MM:SS
  const formatDuration = (seconds: number) => {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Derive call meta for visual treatment
  const getCallMeta = (call: CallLog) => {
    const isVideo = (call.type || "").toLowerCase().includes("video");
    const statusLower = (call.status || "").toLowerCase();
    const completed = statusLower === "completed" && call.duration > 0;
    const live = statusLower === "pending" || statusLower === "ongoing" || statusLower === "active";
    const missed = !live && (call.duration === 0 || !call.duration);
    const dropped = !completed && !live && !missed;

    let label = "Completed";
    let badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    let Icon = PhoneCall;

    if (live) {
      label = "Live";
      badgeClasses = "bg-blue-50 text-blue-700 border-blue-200";
      Icon = PhoneCall;
    } else if (missed) {
      label = "Missed";
      badgeClasses = "bg-red-50 text-red-700 border-red-200";
      Icon = PhoneMissed;
    } else if (dropped) {
      label = "Dropped";
      badgeClasses = "bg-gray-100 text-gray-600 border-gray-200";
      Icon = PhoneOff;
    }

    return { isVideo, completed, live, missed, dropped, label, badgeClasses, Icon };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-600 text-sm font-medium">Loading call history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 text-sm">Unable to load call history</h4>
          <p className="text-red-700 text-xs mt-1">{error}</p>
          <button
            onClick={() => fetchCallLogs(1, false)}
            className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!callLogs || callLogs.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Phone className="h-10 w-10 text-orange-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No call history yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Your consultation calls with astrologers will appear here once completed
        </p>
        <Link
          href="/call-with-astrologer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Start Your First Consultation
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {callLogs.map((call, index) => {
        const meta = getCallMeta(call);
        const { Icon } = meta;
        return (
          <div
            key={call._id || index}
            className="group bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 md:p-5 hover:shadow-lg hover:shadow-orange-100/40 hover:border-orange-200 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Left: Avatar + Name */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Gradient avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-md shadow-orange-500/20 overflow-hidden">
                    {call.receiverProfileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={call.receiverProfileImage}
                        alt={call.receiverName || "Astrologer"}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      call.receiverName?.charAt(0)?.toUpperCase() || "A"
                    )}
                  </div>
                  {/* Call type indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ring-2 ring-white shadow ${
                      meta.isVideo
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                        : "bg-gradient-to-br from-emerald-500 to-green-600"
                    }`}
                    aria-label={meta.isVideo ? "Video call" : "Audio call"}
                  >
                    {meta.isVideo ? (
                      <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    ) : (
                      <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-orange-600 transition-colors">
                    {call.receiverName || "Unknown Astrologer"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                    <span className={`inline-flex items-center gap-1 font-medium ${meta.isVideo ? "text-blue-600" : "text-emerald-600"}`}>
                      {meta.isVideo ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                      {meta.isVideo ? "Video Call" : "Audio Call"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{call.createdAt ? formatDate(call.createdAt) : "Date unavailable"}</span>
                  </div>
                </div>
              </div>

              {/* Right: Status + Duration */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap border ${meta.badgeClasses}`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                  {meta.live && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-sm font-bold text-gray-900 tabular-nums">
                    <Clock className="h-3.5 w-3.5 text-orange-400" />
                    <span>{formatDuration(call.duration || 0)}</span>
                  </div>
                  {call.rpm && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">₹{call.rpm}/min</p>
                  )}
                </div>
              </div>
            </div>

            {call.reason && !meta.completed && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Reason:</span> {call.reason}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-6 sm:py-8 min-h-[120px]">
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-gray-500 text-sm font-medium">Loading more call logs...</div>
            </div>
          ) : (
            <button
              onClick={loadMoreCallLogs}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
