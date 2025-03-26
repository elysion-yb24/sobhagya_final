"use client";

import { useState } from "react";
import { Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";

// Define interfaces
interface Transaction {
  _id: string;
  amount: number;
  date: string;
  status: string;
  type?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Download className="h-8 w-8 mb-3 text-gray-400" />
        <p className="text-base">No transactions found</p>
      </div>
    );
  }

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().substr(2);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      fullDate: `${day} ${month} ${year}, ${hours}:${minutes}`,
      formattedDate: `${day} ${month} ${year}`,
      formattedTime: `${hours}:${minutes}`
    };
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const { formattedDate, formattedTime } = formatTransactionDate(transaction.date);

        return (
          <div
            key={transaction._id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
              }`}>
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className={`h-5 w-5 ${
                    transaction.type === "credit" ? "text-green-600" : "text-red-600"
                  }`} />
                ) : (
                  <ArrowUpRight className={`h-5 w-5 ${
                    transaction.type === "credit" ? "text-green-600" : "text-red-600"
                  }`} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {transaction.type === "credit" ? "Credit" : "Debit"} Transaction
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>{formattedDate}, {formattedTime}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      transaction.status === "completed" ? "text-green-600" :
                      transaction.status === "cancelled" ? "text-gray-500" :
                      "text-red-600"
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                    <p className="text-base font-bold mt-1">₹{transaction.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}