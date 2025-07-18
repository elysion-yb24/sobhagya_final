"use client";

import { useState, useEffect } from "react";
import { getAuthToken } from "../../utils/auth-utils";
import { Phone, Clock, Loader2, RefreshCw } from "lucide-react";
import { buildApiUrl } from "../../config/api";

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
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCallLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }
      
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        buildApiUrl("/calling/api/call/call-log?skip=0&limit=10&role=user"),
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
        throw new Error('Failed to fetch call logs');
      }

      const data = await response.json();
      
      // Handle the API response structure
      let calls = [];
      if (data.data?.list && Array.isArray(data.data.list)) {
        calls = data.data.list;
      } else if (data.list && Array.isArray(data.list)) {
        calls = data.list;
      } else if (Array.isArray(data.data)) {
        calls = data.data;
      } else if (Array.isArray(data)) {
        calls = data;
      }

      setCallLogs(calls);
      setError(null);
    } catch (error) {
      console.error('Error fetching call logs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch call logs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
    
    // Set up auto-refresh for pending calls - reduced frequency
    const interval = setInterval(() => {
      // Check if there are any pending calls
      const hasPendingCalls = callLogs.some(call => 
        call.status === 'pending' || 
        call.status === 'ongoing' || 
        call.status === 'active'
      );
      
      if (hasPendingCalls) {
        fetchCallLogs(true); // Refresh with loading indicator
      }
    }, 15000); // Increased from 5000 to 15000 (15 seconds)
    
    return () => clearInterval(interval);
  }, []); // Removed callLogs dependency to prevent infinite re-renders

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatDuration = (seconds: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Call History
          <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2">
            ({callLogs.length} {callLogs.length === 1 ? 'call' : 'calls'})
          </span>
        </h3>
        <button
          onClick={() => fetchCallLogs(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
            isRefreshing 
              ? 'text-blue-500 cursor-not-allowed bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Refresh call history"
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      {/* Mobile-optimized call logs */}
      <div className="space-y-4">
        {callLogs.map((call, index) => (
          <div
            key={call._id || index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Mobile layout */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Avatar and basic info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                  {call.receiverName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {call.receiverName || 'Unknown Astrologer'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {call.createdAt ? formatDate(call.createdAt) : 'Date not available'}
                  </p>
                </div>
              </div>

              {/* Status and duration - mobile responsive */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    call.status === 'completed' && (call.duration > 0)
                      ? 'bg-green-100 text-green-800' 
                      : call.status === 'pending' || call.status === 'ongoing' || call.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : (call.duration === 0 || !call.duration)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {call.status === 'completed' && (call.duration > 0)
                      ? 'Completed' 
                      : call.status === 'pending' || call.status === 'ongoing' || call.status === 'active'
                        ? 'Live'
                        : (call.duration === 0 || !call.duration)
                          ? 'Missed'
                          : 'Dropped'}
                  </span>
                  {(call.status === 'pending' || call.status === 'ongoing' || call.status === 'active') && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Duration and rate */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{formatDuration(call.duration || 0)}</span>
                  </div>
                  {call.rpm && (
                    <p className="text-xs text-gray-500 mt-1">₹{call.rpm}/min</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reason for failed calls */}
            {call.reason && call.status !== 'completed' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Reason:</span> {call.reason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 