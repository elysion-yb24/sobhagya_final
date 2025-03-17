"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Home,
  Phone,
  Wallet as WalletIcon,
  Clock,
  Check,
  AlertCircle,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  ListFilter,
} from "lucide-react";

const WalletPage = () => {
  const [balance, setBalance] = useState("₹0.0");
  const [selectedAmount, setSelectedAmount] = useState("₹59");
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("recharge"); // "recharge" or "transactions"

  const rechargeOptions = [
    { amount: "₹59", extra: "20% extra" },
    { amount: "₹99", extra: "30% extra" },
    { amount: "₹199", extra: "30% extra" },
  ];

  // Calculate values based on selected amount
  const baseAmount = parseInt(
    showCustomInput && customAmount
      ? customAmount
      : selectedAmount.replace("₹", "")
  );
  const gstRate = 18.0;
  const gstAmount = ((baseAmount * gstRate) / 100).toFixed(2);
  const payableAmount = (baseAmount + parseFloat(gstAmount)).toFixed(2);

  // Calculate bonus based on selection
  const getBonusRate = () => {
    if (showCustomInput && customAmount) {
      // Custom bonus logic based on amount tiers
      const amount = parseInt(customAmount);
      if (amount >= 200) return 30;
      if (amount >= 90) return 30;
      if (amount >= 50) return 20;
      return 10;
    }

    const option = rechargeOptions.find((opt) => opt.amount === selectedAmount);
    return option ? parseInt(option.extra.split("%")[0]) : 0;
  };

  const bonusRate = getBonusRate();
  const bonusAmount = ((baseAmount * bonusRate) / 100).toFixed(1);
  const totalAmount = (baseAmount + parseFloat(bonusAmount)).toFixed(1);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleRecharge = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      // Create a new transaction record
      const newTransaction = {
        id: `TXN${Math.floor(Math.random() * 1000000)}`,
        type: "credit",
        amount: totalAmount,
        baseAmount: baseAmount,
        bonusAmount: bonusAmount,
        status: Math.random() > 0.9 ? "failed" : "success", // 10% chance of failure for demo
        date: new Date(),
        description: `Wallet Recharge ${
          showCustomInput ? `₹${customAmount}` : selectedAmount
        }`,
        paymentMethod: "UPI",
      };

      // Add the transaction to history
      setTransactions((prevTransactions) => [
        newTransaction,
        ...prevTransactions,
      ]);

      // Only update balance if transaction was successful
      if (newTransaction.status === "success") {
        showNotification("Recharge successful! Your wallet has been updated.");
        // Update wallet balance
        const newBalance = (
          parseFloat(balance.replace("₹", "")) + parseFloat(totalAmount)
        ).toFixed(1);
        setBalance(`₹${newBalance}`);

        // Automatically switch to transactions tab after successful recharge
        setTimeout(() => {
          setActiveTab("transactions");
        }, 500);
      } else {
        showNotification("Recharge failed. Please try again.", "error");
        // Also show transactions tab on failure so user can see the failed transaction
        setTimeout(() => {
          setActiveTab("transactions");
        }, 500);
      }
    }, 1500);
  };

  // Format selected amount for display
  const displayAmount = showCustomInput
    ? `₹${customAmount || "0"}`
    : selectedAmount;


  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center w-11/12 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{notification.message}</span>
          <button className="ml-auto" onClick={() => setNotification(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Wallet header with animated balance */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-white">
        <h1 className="text-2xl font-bold text-black">Wallet</h1>
        <div className="border border-yellow-400 rounded-md px-4 py-2 text-black bg-yellow-50 transition-all duration-300 hover:shadow-md">
          {balance}
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 font-medium flex justify-center items-center ${
            activeTab === "recharge"
              ? "text-green-600 border-b-2 border-green-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("recharge")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Recharge
        </button>
        <button
          className={`flex-1 py-3 font-medium flex justify-center items-center ${
            activeTab === "transactions"
              ? "text-green-600 border-b-2 border-green-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Transactions
          {transactions.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {transactions.length}
            </span>
          )}
        </button>
      </div>

      {/* Recharge Tab Content */}
      {activeTab === "recharge" && (
        <div className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-center mb-8">
            Recharge Top-up
          </h2>

          {/* Recharge options */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {rechargeOptions.map((option, index) => (
              <button
                key={index}
                className={`h-24 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                  !showCustomInput && selectedAmount === option.amount
                    ? "border-green-500 bg-green-50 shadow-sm transform scale-105"
                    : "border-gray-200 bg-gray-100 hover:border-green-300 hover:bg-green-50"
                }`}
                onClick={() => {
                  setSelectedAmount(option.amount);
                  setShowCustomInput(false);
                }}
              >
                <span className="font-semibold text-lg">{option.amount}</span>
                <span className="text-green-500 text-sm mt-1">
                  {option.extra}
                </span>
              </button>
            ))}
          </div>

          {/* Custom amount option */}
          <div className="mb-10">
            <button
              className={`w-full py-3 px-4 border rounded-lg mb-2 text-left flex justify-between items-center ${
                showCustomInput
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              }`}
              onClick={() => setShowCustomInput(!showCustomInput)}
            >
              <span className="font-medium">Custom Amount</span>
              <span
                className={`text-sm ${
                  showCustomInput ? "text-green-500" : "text-gray-500"
                }`}
              >
                {showCustomInput ? "Selected" : "Tap to enter"}
              </span>
            </button>

            {showCustomInput && (
              <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-3 py-3 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Minimum ₹20 · Maximum ₹10,000
                </p>
                {customAmount && parseInt(customAmount) < 20 && (
                  <p className="text-sm text-red-500 mt-1">
                    Please enter an amount of at least ₹20
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Offer applied card */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-10 transform transition-all duration-300 hover:shadow-md">
            <p className="text-green-600 mb-2">
              Offer Applied: {bonusRate}% extra on {displayAmount}
            </p>
            <p className="text-black font-medium text-lg">
              You will get ₹{bonusAmount} extra in wallet
            </p>
          </div>

          {/* Recharge amount breakdown */}
          <div className="space-y-3 mb-6 text-lg border-b border-gray-100 pb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Recharge Amount</span>
              <span className="text-right">{displayAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST ({gstRate}%)</span>
              <span className="text-right">₹{gstAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Payable Amount</span>
              <span className="font-semibold text-right">₹{payableAmount}</span>
            </div>
          </div>

          {/* Total amount with check */}
          <div className="bg-green-100 rounded-lg p-4 flex items-center mb-6 transform transition-all duration-300 hover:bg-green-200">
            <div className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <span className="text-black text-lg">
              You'll get ₹{totalAmount} on this recharge.
            </span>
          </div>

          {/* Payment methods tabs */}
          <div className="mb-8">
            <div className="flex border-b">
              <button className="py-2 px-4 border-b-2 border-green-500 text-green-600 font-medium">
                UPI
              </button>
              <button className="py-2 px-4 text-gray-500 hover:text-gray-700">
                Cards
              </button>
              <button className="py-2 px-4 text-gray-500 hover:text-gray-700">
                NetBanking
              </button>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex justify-center items-center text-gray-700 mb-6">
            <span className="text-black font-medium">Secured by PhonePe</span>
            <div className="ml-2 text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Recharge button */}
          <button
            className={`w-1/2 py-4 rounded-lg flex justify-center items-center px-8 mt-8 mb-6 relative overflow-hidden mx-auto ${
              isLoading
                ? "bg-orange-300 cursor-wait"
                : "bg-orange-400 hover:bg-orange-500 active:bg-orange-600 transition-colors duration-200"
            }`}
            onClick={handleRecharge}
            disabled={
              isLoading ||
              (showCustomInput &&
                (!customAmount || parseInt(customAmount) < 20))
            }
          >
            <span className="font-semibold text-xl">
              {isLoading ? "Processing..." : "Recharge"}
            </span>
            <ArrowRight className="h-6 w-6" />

            {/* Loading animation */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-orange-400 bg-opacity-50">
                <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Transactions Tab Content */}
      {activeTab === "transactions" && (
        <div className="px-4 py-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            {transactions.length > 0 && (
              <button className="text-green-600 flex items-center text-sm">
                <ListFilter className="h-4 w-4 mr-1" />
                Filter
              </button>
            )}
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 rounded-lg flex items-start border shadow-sm ${
                    transaction.status === "success"
                      ? "bg-white border-green-100"
                      : "bg-white border-red-100"
                  }`}
                >
                  <div className="flex-shrink-0 mr-3">
                    {transaction.type === "credit" ? (
                      <ArrowDownCircle
                        className={`h-10 w-10 ${
                          transaction.status === "success"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      />
                    ) : (
                      <ArrowUpCircle className="h-10 w-10 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="font-medium">{transaction.description}</p>
                      <p
                        className={`font-semibold ${
                          transaction.status === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₹
                        {transaction.amount}
                      </p>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: {transaction.paymentMethod}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          TXN ID: {transaction.id}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-xs rounded px-2 py-0.5 inline-block font-medium tracking-wide capitalize
                          ${
                            transaction.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                        {transaction.status === "success" && (
                          <div className="text-xs text-gray-600 mt-2">
                            <p>Base: ₹{transaction.baseAmount}</p>
                            <p>Bonus: ₹{transaction.bonusAmount}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Your transaction history will appear here
              </p>
              <button
                className="px-6 py-2 bg-green-100 text-green-700 rounded-lg font-medium"
                onClick={() => setActiveTab("recharge")}
              >
                Make your first recharge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletPage;
