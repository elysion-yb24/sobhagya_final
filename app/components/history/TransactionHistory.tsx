"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getAuthToken } from "../../utils/auth-utils";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Video,
  Phone,
  Gift,
  IndianRupee,
  CreditCard,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface Transaction {
  _id: string;
  amount: number | null;
  balance?: number;
  date?: string;
  status: string;
  type?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string | number;
  isCredited?: boolean;
  paymentFor?: string;
  notes?: {
    callerName?: string;
    receiverName?: string;
    callDuration?: number | null;
    rpm?: number | null;
  };
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchTransactions = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const skip = (page - 1) * 10;
      const apiUrl = `/api/transaction-history?skip=${skip}&limit=10`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data) {
          const newTransactions: Transaction[] = data.data.list || [];
          
          setTransactions((prev) => {
            if (append) {
              // Remove duplicates when appending
              const existingIds = new Set(prev.map(t => t._id));
              const uniqueNew = newTransactions.filter(t => !existingIds.has(t._id));
              return [...prev, ...uniqueNew];
            }
            return newTransactions;
          });
          
          setHasMore(newTransactions.length === 10);
          setError(null);
        } else {
          throw new Error(data.message || 'No transactions found');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  // Load more function
  const loadMoreTransactions = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTransactions(nextPage, true);
  }, [hasMore, isLoadingMore, currentPage, fetchTransactions]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMoreTransactions();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isLoadingMore, loadMoreTransactions]);

  const getTransactionDate = (transaction: Transaction): string => {
    // Try multiple possible date fields
    const possibleDates = [
      transaction.date,
      transaction.createdAt,
      transaction.updatedAt,
      transaction.timestamp
    ];

    for (const dateValue of possibleDates) {
      if (dateValue !== undefined && dateValue !== null && dateValue !== '') {
        return String(dateValue);
      }
    }

    // If no date found, return current date as fallback
    console.warn('No valid date found for transaction:', transaction._id);
    return new Date().toISOString();
  };

  const getTransactionDisplayName = (transaction: Transaction): string => {
    // Check if it's a call-related transaction
    const paymentFor = transaction.paymentFor?.toLowerCase() || '';
    const description = transaction.description?.toLowerCase() || '';
    
    // Video call transactions
    if (paymentFor.includes('video') || description.includes('video') || 
        paymentFor.includes('videocall') || description.includes('videocall')) {
      return 'Video Call';
    }
    
    // Audio call transactions
    if (paymentFor.includes('audio') || description.includes('audio') || 
        paymentFor.includes('call') || description.includes('call')) {
      return 'Audio Call';
    }
    
    // Gift transactions
    if (paymentFor.includes('gift') || description.includes('gift')) {
      return 'Gift Sent';
    }
    
    // Wallet recharge
    if (paymentFor.includes('recharge') || description.includes('recharge') || 
        paymentFor.includes('wallet') || description.includes('wallet')) {
      return 'Wallet Recharge';
    }
    
    // Return original description or paymentFor if available
    return transaction.description || transaction.paymentFor || 
           `${(transaction.amount || 0) >= 0 ? "Credit" : "Debit"} Transaction`;
  };

  const formatDate = (transaction: Transaction) => {
    try {
      const dateString = getTransactionDate(transaction);
      
      // First try parsing as ISO string
      let date = new Date(dateString);
      
      // If invalid, try parsing as Unix timestamp (milliseconds)
      if (isNaN(date.getTime()) && !isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      }
      
      // If still invalid, try parsing as Unix timestamp (seconds)
      if (isNaN(date.getTime()) && !isNaN(Number(dateString))) {
        date = new Date(Number(dateString) * 1000);
      }

      // Final check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date after all attempts:', dateString);
        return 'Date unavailable';
      }

      // Format the date manually to avoid locale issues
      const day = date.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

      return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error, 'for transaction:', transaction._id);
      return 'Date unavailable';
    }
  };

  // Derive icon + color per transaction category
  const getTxnMeta = (t: Transaction) => {
    const pf = (t.paymentFor || "").toLowerCase();
    const desc = (t.description || "").toLowerCase();
    const isCredit = (t.amount || 0) >= 0;

    if (pf.includes("video") || desc.includes("video")) {
      return {
        label: "Video Call",
        Icon: Video,
        ringClass: "from-blue-400 to-indigo-500",
      };
    }
    if (pf.includes("audio") || desc.includes("audio") || pf === "call" || desc.includes("call")) {
      return {
        label: "Audio Call",
        Icon: Phone,
        ringClass: "from-emerald-400 to-green-600",
      };
    }
    if (pf.includes("gift") || desc.includes("gift")) {
      return {
        label: "Gift Sent",
        Icon: Gift,
        ringClass: "from-pink-400 to-rose-500",
      };
    }
    if (pf.includes("cashback") || desc.includes("cashback")) {
      return {
        label: "Cashback Bonus",
        Icon: Sparkles,
        ringClass: "from-amber-400 to-orange-500",
      };
    }
    if (pf.includes("recharge") || desc.includes("recharge") || pf.includes("wallet")) {
      return {
        label: "Wallet Recharge",
        Icon: IndianRupee,
        ringClass: "from-orange-400 to-amber-500",
      };
    }
    return {
      label: t.description || t.paymentFor || (isCredit ? "Credit" : "Debit"),
      Icon: CreditCard,
      ringClass: isCredit ? "from-emerald-400 to-green-600" : "from-orange-400 to-amber-500",
    };
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "done" || s === "completed" || s === "success") {
      return {
        text: "Completed",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (s === "cancelled" || s === "canceled") {
      return {
        text: "Cancelled",
        classes: "bg-gray-100 text-gray-600 border-gray-200",
      };
    }
    if (s === "pending") {
      return {
        text: "Pending",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    return {
      text: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
      classes: "bg-red-50 text-red-700 border-red-200",
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-600 text-sm font-medium">Loading transactions...</p>
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
          <h4 className="font-semibold text-red-900 text-sm">Unable to load transactions</h4>
          <p className="text-red-700 text-xs mt-1">{error}</p>
          <button
            onClick={() => fetchTransactions(1, false)}
            className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Wallet className="h-10 w-10 text-orange-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No transactions yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Your recharges, consultations, and other activity will appear here
        </p>
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Make Your First Recharge
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {transactions.map((transaction) => {
        const isCredit = (transaction.amount || 0) >= 0;
        const meta = getTxnMeta(transaction);
        const status = getStatusBadge(transaction.status);
        const { Icon: TxnIcon } = meta;

        return (
          <div
            key={transaction._id}
            className="group bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 md:p-5 hover:shadow-lg hover:shadow-orange-100/40 hover:border-orange-200 transition-all duration-300"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Gradient icon */}
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${meta.ringClass} flex items-center justify-center shadow-md`}>
                  <TxnIcon className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
                </div>
                {/* Credit/Debit indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow ${
                    isCredit ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  aria-label={isCredit ? "Credit" : "Debit"}
                >
                  {isCredit ? (
                    <ArrowDownLeft className="w-3 h-3 text-white" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight truncate group-hover:text-orange-600 transition-colors">
                      {meta.label}
                    </h4>
                    {transaction.notes?.receiverName && (
                      <p className="text-xs sm:text-sm text-orange-600 font-medium mt-0.5 truncate">
                        with {transaction.notes.receiverName}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-gray-500 mt-1">
                      <span>{formatDate(transaction)}</span>
                      {transaction.notes?.callDuration ? (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>{Math.max(1, Math.round(transaction.notes.callDuration / 60))} min</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-base sm:text-lg font-bold tabular-nums ${
                        isCredit ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹{Math.abs(transaction.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap border ${status.classes}`}
                  >
                    {status.text}
                  </span>
                  {transaction.notes?.rpm && (
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                      ₹{transaction.notes.rpm}/min
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Infinite scroll loader */}
      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-6 sm:py-8 min-h-[120px]">
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-gray-500 text-sm font-medium">Loading more transactions...</div>
            </div>
          ) : (
            <button
              onClick={loadMoreTransactions}
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