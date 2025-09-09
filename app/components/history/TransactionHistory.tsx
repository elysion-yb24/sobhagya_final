"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAuthToken } from "../../utils/auth-utils";
import { ArrowUpRight, ArrowDownLeft, Wallet, Loader2 } from "lucide-react";
import { buildApiUrl } from "../../config/api";

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading transactions...</p>
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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions</h3>
        <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            {/* Mobile layout */}
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Transaction type icon */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                (transaction.amount || 0) >= 0 ? "bg-green-100" : "bg-orange-100"
              }`}>
                {(transaction.amount || 0) >= 0 ? (
                  <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                )}
              </div>

              {/* Transaction details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2">
                  {/* Transaction info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                      {getTransactionDisplayName(transaction)}
                    </h4>
                    {transaction.notes?.receiverName && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        with {transaction.notes.receiverName}
                      </p>
                    )}
                    {transaction.notes?.callDuration && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Duration: {Math.round(transaction.notes.callDuration / 60)} min
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction)}
                    </p>
                  </div>

                  {/* Amount and status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      transaction.status === "done" || transaction.status === "completed" ? "bg-green-100 text-green-800" :
                      transaction.status === "cancelled" ? "bg-gray-100 text-gray-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                    
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-bold ${
                        (transaction.amount || 0) >= 0 ? "text-green-600" : "text-orange-600"
                      }`}>
                        {(transaction.amount || 0) >= 0 ? "+" : "-"}₹{Math.abs(transaction.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll loader */}
      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-8 min-h-[120px]">
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-gray-500 text-sm">Loading more transactions...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* <div className="text-gray-400 text-sm">Scroll down to load more transactions</div> */}
              <button
                onClick={loadMoreTransactions}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}