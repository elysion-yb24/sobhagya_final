"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAuthToken } from "../../utils/auth-utils";
import { Phone, Clock, Loader2 } from "lucide-react";

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
      return date.toLocaleString();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading call history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!callLogs || callLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No call history</h3>
        <p className="text-gray-500 text-sm">Your calls will appear here after completion</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="space-y-4">
        {callLogs.map((call, index) => (
          <div
            key={call._id || index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                  {call.receiverName?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {call.receiverName || "Unknown Astrologer"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {call.createdAt ? formatDate(call.createdAt) : "Date not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      call.status === "completed" && call.duration > 0
                        ? "bg-green-100 text-green-800"
                        : call.status === "pending" || call.status === "ongoing" || call.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : call.duration === 0 || !call.duration
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {call.status === "completed" && call.duration > 0
                      ? "Completed"
                      : call.status === "pending" || call.status === "ongoing" || call.status === "active"
                      ? "Live"
                      : call.duration === 0 || !call.duration
                      ? "Missed"
                      : "Dropped"}
                  </span>
                  {(call.status === "pending" || call.status === "ongoing" || call.status === "active") && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{formatDuration(call.duration || 0)}</span>
                  </div>
                  {call.rpm && <p className="text-xs text-gray-500 mt-1">₹{call.rpm}/min</p>}
                </div>
              </div>
            </div>

            {call.reason && call.status !== "completed" && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Reason:</span> {call.reason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-8 min-h-[120px]">
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-gray-500 text-sm">Loading more call logs...</div>
            </div>
          ) : (
            <button
              onClick={loadMoreCallLogs}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
