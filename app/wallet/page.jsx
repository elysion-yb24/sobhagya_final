"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CreditCard,
  Smartphone,
  DollarSign,
  Gift,
  Sparkles,
  TrendingUp,
  Star,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

const WalletPage = () => {
  const [balance, setBalance] = useState("₹0.0");
  const [selectedAmount, setSelectedAmount] = useState("₹59");
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("recharge");
  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced recharge options with better UI data
  const rechargeOptions = [
    { 
      amount: "₹59", 
      extra: "20% extra", 
      popular: false,
      savings: "₹12",
      color: "from-blue-500 to-blue-600"
    },
    { 
      amount: "₹99", 
      extra: "30% extra", 
      popular: true,
      savings: "₹30",
      color: "from-green-500 to-green-600"
    },
    { 
      amount: "₹199", 
      extra: "30% extra", 
      popular: false,
      savings: "₹60",
      color: "from-purple-500 to-purple-600"
    },
  ];

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: Smartphone, description: "Instant & Secure" },
    { id: "card", name: "Cards", icon: CreditCard, description: "Visa, MasterCard" },
    { id: "wallet", name: "Wallet", icon: WalletIcon, description: "Digital Wallets" },
  ];

  useEffect(() => {
    setMounted(true);
    // Simulate loading wallet data
    const timer = setTimeout(() => {
      setBalance("₹247.50");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      showNotification("Wallet refreshed successfully!");
    }, 1500);
  };

  const handleRecharge = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      const newTransaction = {
        id: `TXN${Math.floor(Math.random() * 1000000)}`,
        type: "credit",
        amount: totalAmount,
        baseAmount: baseAmount,
        bonusAmount: bonusAmount,
        status: Math.random() > 0.9 ? "failed" : "success",
        date: new Date(),
        description: `Wallet Recharge ${
          showCustomInput ? `₹${customAmount}` : selectedAmount
        }`,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
      };

      setTransactions((prevTransactions) => [
        newTransaction,
        ...prevTransactions,
      ]);

      if (newTransaction.status === "success") {
        showNotification("🎉 Recharge successful! Your wallet has been updated.");
        const newBalance = (
          parseFloat(balance.replace("₹", "")) + parseFloat(totalAmount)
        ).toFixed(1);
        setBalance(`₹${newBalance}`);
        setTimeout(() => setActiveTab("transactions"), 500);
      } else {
        showNotification("❌ Recharge failed. Please try again.", "error");
        setTimeout(() => setActiveTab("transactions"), 500);
      }
    }, 2000);
  };

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

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-orange-600 font-medium">Loading your wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative">
      {/* Enhanced Notification */}
      <AnimatePresence>
      {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center max-w-md ${
            notification.type === "success"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white"
          }`}
        >
            <div className="flex items-center">
          {notification.type === "success" ? (
                <CheckCircle className="h-6 w-6 mr-3" />
          ) : (
                <XCircle className="h-6 w-6 mr-3" />
          )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setNotification(null)}
            >
            <X className="h-4 w-4" />
          </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Wallet Header */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>

        <div className="relative p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Wallet</h1>
                <p className="text-white/80 text-sm">Manage your balance & transactions</p>
        </div>
            </div>
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
      </div>

          {/* Enhanced Balance Display */}
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Current Balance</p>
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={balance}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-3xl font-bold"
                      >
                        {showBalance ? balance : "₹***.**"}
                      </motion.span>
                    </AnimatePresence>
        <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-300">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+12.5%</span>
                </div>
                <p className="text-white/60 text-xs">This month</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex">
          {[
            { id: "recharge", label: "Recharge", icon: Plus, count: null },
            { id: "transactions", label: "Transactions", icon: Clock, count: transactions.length }
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              className={`flex-1 py-4 font-medium flex justify-center items-center gap-2 relative ${
                activeTab === tab.id
                  ? "text-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
        >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                  {tab.count}
            </span>
          )}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
      {activeTab === "recharge" && (
            <motion.div
              key="recharge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Enhanced Recharge Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Quick Recharge Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rechargeOptions.map((option, index) => (
                    <motion.div
                      key={option.amount}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedAmount === option.amount && !showCustomInput
                          ? "border-orange-500 bg-orange-50 shadow-lg"
                          : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedAmount(option.amount);
                  setShowCustomInput(false);
                }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {option.popular && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Popular
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {option.amount}
                        </div>
                        <div className="text-green-600 font-medium text-sm mb-2">
                  {option.extra}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Save {option.savings}
                        </div>
                      </div>
                    </motion.div>
            ))}
                </div>
          </div>

              {/* Enhanced Custom Amount */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <button
              onClick={() => setShowCustomInput(!showCustomInput)}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Enter Custom Amount
                  <ChevronDown className={`h-4 w-4 transition-transform ${showCustomInput ? 'rotate-180' : ''}`} />
            </button>

                <AnimatePresence>
            {showCustomInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-2xl p-4"
                    >
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter amount"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium"
                  />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </div>
                </div>
                      {customAmount && (
                        <div className="mt-2 text-sm text-gray-600">
                          You'll get {bonusRate}% extra = ₹{bonusAmount} bonus
              </div>
            )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Offer Display */}
              {(selectedAmount || customAmount) && (
                <motion.div 
                  className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Gift className="h-5 w-5 text-white" />
          </div>
                    <div>
                      <h4 className="font-semibold text-green-800">
                        🎉 Special Offer Applied!
                      </h4>
                      <p className="text-green-600 text-sm">
                        {bonusRate}% extra on {displayAmount}
            </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-green-800 font-medium text-lg">
              You will get ₹{bonusAmount} extra in wallet
            </p>
                    <p className="text-green-600 text-sm mt-1">
                      Total wallet credit: ₹{totalAmount}
                    </p>
          </div>
                </motion.div>
              )}

              {/* Enhanced Breakdown */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Payment Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
              <span className="text-gray-600">Recharge Amount</span>
                    <span className="font-medium">{displayAmount}</span>
            </div>
                  <div className="flex justify-between items-center">
              <span className="text-gray-600">GST ({gstRate}%)</span>
                    <span className="font-medium">₹{gstAmount}</span>
            </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Payable</span>
                      <span className="font-bold text-lg text-orange-600">₹{payableAmount}</span>
            </div>
          </div>
            </div>
              </motion.div>

              {/* Enhanced Payment Methods */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Payment Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedPaymentMethod === method.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <method.icon className="h-6 w-6 text-gray-700" />
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{method.name}</div>
                          <div className="text-xs text-gray-500">{method.description}</div>
            </div>
          </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Recharge Button */}
              <motion.button
            onClick={handleRecharge}
                disabled={isLoading || !baseAmount}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1 }}
          >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Recharge Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              {/* Trust Indicators */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                {[
                  { icon: Shield, text: "100% Secure", color: "text-green-500" },
                  { icon: Zap, text: "Instant Credit", color: "text-blue-500" },
                  { icon: CheckCircle, text: "Verified", color: "text-purple-500" },
                  { icon: Star, text: "Best Rates", color: "text-orange-500" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span>{item.text}</span>
        </div>
                ))}
              </motion.div>
            </motion.div>
      )}

      {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Transaction History
                </h3>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                  <ListFilter className="h-4 w-4" />
                Filter
              </button>
          </div>

              {transactions.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h4>
                  <p className="text-gray-500 mb-4">Your transaction history will appear here</p>
                  <button 
                    onClick={() => setActiveTab("recharge")}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Make Your First Recharge
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <motion.div
                  key={transaction.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                    transaction.status === "success"
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                    {transaction.type === "credit" ? (
                              <ArrowDownCircle className="h-5 w-5" />
                    ) : (
                              <ArrowUpCircle className="h-5 w-5" />
                    )}
                  </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(transaction.date)} • {transaction.paymentMethod}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                          transaction.status === "success"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}>
                            {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                    </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {transaction.status}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
    </div>
  );
};

export default WalletPage;
