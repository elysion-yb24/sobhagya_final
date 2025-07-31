"use client";

import { useState, useEffect } from "react";
import { getAuthToken } from "../../utils/auth-utils";
import { ArrowUpRight, ArrowDownLeft, Wallet, Loader2 } from "lucide-react";
import { buildApiUrl } from "../../config/api";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  description?: string;
  createdAt?: string; // Add alternative date fields
  updatedAt?: string;
  timestamp?: string | number;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      const apiUrl = buildApiUrl("/payment/api/transaction/transactions?skip=0&limit=10");
      console.log('Fetching transactions from:', apiUrl);
      
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
        console.log('Transaction history response data:', data);

        if (data.success && data.data) {
          // Debug: Log the actual transaction data to see what fields are available
          console.log('Transaction data:', data.data.list);
          setTransactions(data.data.list || []);
          setError(null);
        } else {
          throw new Error(data.message || 'No transactions found');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Transaction History
          <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2">
            ({transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'})
          </span>
        </h3>
      </div>

      {/* Mobile-optimized transaction list */}
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
                transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
              }`}>
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                )}
              </div>

              {/* Transaction details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2">
                  {/* Transaction info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                      {transaction.description || `${transaction.type === "credit" ? "Credit" : "Debit"} Transaction`}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction)}
                    </p>
                  </div>

                  {/* Amount and status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      transaction.status === "completed" ? "bg-green-100 text-green-800" :
                      transaction.status === "cancelled" ? "bg-gray-100 text-gray-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                    
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-bold ${
                        transaction.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "credit" ? "+" : ""}₹{transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}