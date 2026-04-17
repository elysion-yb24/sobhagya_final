"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Wallet as WalletIcon,
  Clock,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  Plus,
  Sparkles,
  TrendingUp,
  Star,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Info,
  Gift,
  Phone,
  Video,
  CreditCard,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { useWalletBalance } from "../components/astrologers/WalletBalanceContext";
import { getAuthToken } from "../utils/auth-utils";

/* ────────────────── constants & helpers ────────────────── */

const DEFAULT_PLANS = [
  { price: 79, additional: 20 },
  { price: 109, additional: 30 },
  { price: 199, additional: 40 },
  { price: 399, additional: 50 },
  { price: 999, additional: 50 },
  { price: 1499, additional: 50 },
];

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const getPaymentIcon = (paymentFor) => {
  switch (paymentFor) {
    case "recharge":
      return <IndianRupee className="h-5 w-5" />;
    case "cashback":
      return <Gift className="h-5 w-5" />;
    case "video":
      return <Video className="h-5 w-5" />;
    case "call":
    case "audio":
      return <Phone className="h-5 w-5" />;
    case "gift":
      return <Gift className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
};

const getPaymentLabel = (tx) => {
  const pf = tx.paymentFor || tx.description || "";
  switch (pf) {
    case "recharge":
      return "Wallet Recharge";
    case "cashback":
      return "Cashback Bonus";
    case "video":
      return `Video Call${tx.notes?.receiverName ? ` — ${tx.notes.receiverName}` : ""}`;
    case "call":
    case "audio":
      return `Audio Call${tx.notes?.receiverName ? ` — ${tx.notes.receiverName}` : ""}`;
    case "gift":
      return "Gift Sent";
    default:
      return pf || "Transaction";
  }
};

/* ────────────────── main component ────────────────── */

const WalletPage = () => {
  const { walletBalance, isFetching, refreshWalletBalance } = useWalletBalance();

  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(1);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recharge");
  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | "pending" | "success" | "failed" | "timeout"

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  /* ── load plans on mount ── */
  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (!token) return;
    const authHeader = { Authorization: `Bearer ${token}` };

    fetch("/api/payment/wallet-page-data", { headers: authHeader })
      .then((r) => r.json())
      .then((res) => {
        if (
          res?.success &&
          Array.isArray(res?.data?.balances) &&
          res.data.balances.length
        ) {
          setPlans(res.data.balances);
        }
      })
      .catch(() => {});
  }, []);

  /* ── fetch transactions ── */
  const fetchTransactions = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    setIsTxLoading(true);
    try {
      const res = await fetch("/api/transaction-history?skip=0&limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const list = json?.data?.transactions || json?.data || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch {
      setTransactions([]);
    } finally {
      setIsTxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab, fetchTransactions]);

  /* ── derived values ── */
  const selectedPlan = plans[selectedPlanIdx] || plans[0];
  const baseAmount =
    showCustomInput && customAmount
      ? parseInt(customAmount, 10) || 0
      : selectedPlan?.price || 0;

  const getBonusRate = () => {
    if (showCustomInput && customAmount) {
      const amount = parseInt(customAmount, 10);
      if (amount >= 999) return 50;
      if (amount >= 399) return 50;
      if (amount >= 199) return 40;
      if (amount >= 109) return 30;
      if (amount >= 79) return 20;
      return 10;
    }
    return selectedPlan?.additional || selectedPlan?.cashback || 0;
  };
  const bonusRate = getBonusRate();
  const bonusAmount = ((baseAmount * bonusRate) / 100).toFixed(1);
  const totalWalletCredit = (baseAmount + parseFloat(bonusAmount || 0)).toFixed(1);
  const gstAmount = ((baseAmount * 18) / 100).toFixed(2);
  const payableAmount = (baseAmount + parseFloat(gstAmount)).toFixed(2);
  const displayAmount = showCustomInput ? `₹${customAmount || "0"}` : `₹${baseAmount}`;

  const handleCustomAmountChange = (e) => {
    const v = e.target.value;
    if (v === "" || /^\d+$/.test(v)) setCustomAmount(v);
  };

  /* ── poll PhonePe status ── */
  const pollStatus = useCallback(
    async (transactionId) => {
      const token = getAuthToken();
      let attempts = 0;
      const maxAttempts = 20;
      const delay = 2500;
      setPaymentStatus("pending");
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, delay));
        try {
          const resp = await fetch("/api/payment/phonepe/status-check", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactionId }),
            credentials: "include",
          });
          const json = await resp.json();
          const status = json?.data?.status;
          if (status === "done" || status === "SUCCESS") {
            setPaymentStatus("success");
            showNotification(
              `🎉 Recharge successful! ₹${totalWalletCredit} credited.`
            );
            await refreshWalletBalance();
            setActiveTab("transactions");
            fetchTransactions();
            return;
          }
          if (status === "failed" || status === "FAILED") {
            setPaymentStatus("failed");
            showNotification("Payment failed. Please try again.", "error");
            return;
          }
        } catch {
          /* keep polling */
        }
        attempts++;
      }
      setPaymentStatus("timeout");
      showNotification(
        "Still waiting on payment confirmation — check Transactions tab.",
        "error"
      );
    },
    [fetchTransactions, refreshWalletBalance, showNotification, totalWalletCredit]
  );

  /* ── initiate PhonePe payment ── */
  const handleRecharge = async () => {
    if (!baseAmount || baseAmount < 1) {
      showNotification("Please select a valid amount.", "error");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      showNotification("Please log in to recharge.", "error");
      return;
    }

    const saltKey = process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY;
    const saltIndex = process.env.NEXT_PUBLIC_PHONEPE_SALT_INDEX || "1";
    const phonePeEndpoint =
      process.env.NEXT_PUBLIC_PHONEPE_API_END_POINT || "/pg/v1/pay";
    const phonePeBaseUrl =
      process.env.NEXT_PUBLIC_PHONEPE_BASE_URL ||
      "https://api-preprod.phonepe.com/apis/pg-sandbox";
    const callbackUrl = process.env.NEXT_PUBLIC_PHONEPE_CALLBACK_URL;

    if (!saltKey) {
      showNotification(
        "PhonePe is not configured (missing salt key).",
        "error"
      );
      return;
    }

    setIsLoading(true);
    setPaymentStatus(null);

    try {
      console.log("[Recharge] initiate — amount:", baseAmount, "extra%:", bonusRate);

      // Step 1: create transaction record on our backend
      const initResp = await fetch("/api/payment/phonepe/initiate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: baseAmount,
          extra: bonusRate,
          paymentFor: "recharge",
          isWeb: false,
          chatPlanName: "",
        }),
        credentials: "include",
      });
      const initJson = await initResp.json();
      console.log("[Recharge] initiate response:", initResp.status, initJson);

      if (!initJson?.success || !initJson?.data?.transactionId) {
        showNotification(
          initJson?.message || "Failed to initiate payment.",
          "error"
        );
        return;
      }

      const { transactionId, amount: amountWithGst, userId } = initJson.data;

      // Step 2: Call our secure server-side route that handles PhonePe hashing & API call
      console.log("[Recharge] fetching payload from /pay...");
      const payResp = await fetch("/api/payment/phonepe/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          transactionId: transactionId,
          amount: amountWithGst,
          userId: userId,
          extra: bonusRate
        }),
      });
      
      const payJson = await payResp.json();
      console.log("[Recharge] /pay response:", payResp.status, payJson);

      if (!payJson.success || !payJson.redirectUrl) {
        showNotification(payJson.message || "Failed to initiate PhonePe payment.", "error");
        return;
      }

      // Step 3: Open PhonePe payment page in popup
      const paymentUrl = payJson.redirectUrl;
      const paymentWindow = window.open(
        paymentUrl,
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      if (!paymentWindow) {
        showNotification("Popup blocked! Please allow popups to continue.", "error");
        // Fallback: redirect if popup blocked
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 2000);
      } else {
        showNotification("Complete the payment in the popup…");
      }
      
      await pollStatus(transactionId);
    } catch (err) {
      console.error("[Recharge] error:", err);
      showNotification(err?.message || "Something went wrong.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── initial loading state ── */
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-orange-600 font-medium">Loading your wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  const balanceDisplay = `₹${Number(walletBalance || 0).toFixed(2)}`;

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white relative">
      {/* ── notification toast ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center max-w-md ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 mr-3 flex-shrink-0" />
              )}
              <span className="font-medium text-sm">{notification.message}</span>
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

      {/* ── wallet balance hero ── */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* decorative pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='4' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative p-6 pb-8">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
                <p className="text-white/80 text-sm">
                  Manage your balance & consultations
                </p>
              </div>
            </div>
            <motion.button
              onClick={refreshWalletBalance}
              disabled={isFetching}
              className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw
                className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
              />
            </motion.button>
          </div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    Current Balance
                  </p>
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={balanceDisplay}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-3xl font-bold tracking-tight"
                      >
                        {showBalance ? balanceDisplay : "₹***.**"}
                      </motion.span>
                    </AnimatePresence>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-300">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Live</span>
                </div>
                <p className="text-white/50 text-xs mt-1">Synced with server</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── tab bar ── */}
      <div className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-30">
        <div className="flex">
          {[
            { id: "recharge", label: "Recharge", icon: Plus, count: null },
            {
              id: "transactions",
              label: "Transactions",
              icon: Clock,
              count: transactions.length,
            },
          ].map((tab) => (
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
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── tab content ── */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* ──────── RECHARGE TAB ──────── */}
          {activeTab === "recharge" && (
            <motion.div
              key="recharge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* plan grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Quick Recharge Options
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {plans.map((plan, index) => {
                    const price = plan.price;
                    const extra = plan.additional || plan.cashback || 0;
                    const active = selectedPlanIdx === index && !showCustomInput;
                    const isBest = extra >= 40;
                    return (
                      <motion.div
                        key={`${price}-${index}`}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          active
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg shadow-orange-100"
                            : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                        }`}
                        onClick={() => {
                          setSelectedPlanIdx(index);
                          setShowCustomInput(false);
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.06 }}
                      >
                        {isBest && (
                          <div className="absolute -top-2.5 -right-2">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <Star className="h-3 w-3" />
                              Best
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          {/* Om symbol decoration */}
                          <div className="text-2xl mb-1 opacity-30">🕉️</div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ₹{price}
                          </div>
                          <div className="text-green-600 font-semibold text-sm mb-1">
                            +{extra}% extra
                          </div>
                          <div className="text-gray-500 text-xs">
                            Get ₹{((price * extra) / 100).toFixed(0)} bonus
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* custom amount */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Enter Custom Amount
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      showCustomInput ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showCustomInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="Enter amount"
                          className="w-full pl-10 pr-4 py-3.5 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-lg font-semibold bg-white transition-all"
                        />
                        <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-orange-400 text-lg font-bold">
                          ₹
                        </div>
                      </div>
                      {customAmount && (
                        <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                          <Gift className="h-4 w-4 text-green-500" />
                          You'll get {bonusRate}% extra = <span className="font-semibold text-green-600">₹{bonusAmount} bonus</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* offer banner */}
              {baseAmount > 0 && (
                <motion.div
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">
                        🎉 Offer Applied!
                      </h4>
                      <p className="text-green-600 text-sm">
                        {bonusRate}% extra on {displayAmount}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-green-800 font-semibold text-lg">
                      You will get ₹{bonusAmount} extra in wallet
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Total wallet credit: <span className="font-bold">₹{totalWalletCredit}</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* payment breakdown */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
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
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{gstAmount}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Payable</span>
                      <span className="font-bold text-lg text-orange-600">
                        ₹{payableAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* recharge CTA */}
              <motion.button
                onClick={handleRecharge}
                disabled={isLoading || !baseAmount}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Recharge Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              {/* payment status indicator */}
              <AnimatePresence>
                {paymentStatus && paymentStatus !== "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-2xl p-4 flex items-center gap-3 ${
                      paymentStatus === "pending"
                        ? "bg-blue-50 border border-blue-200"
                        : paymentStatus === "failed"
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    {paymentStatus === "pending" && (
                      <>
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        <span className="text-blue-700 font-medium text-sm">
                          Verifying payment… Please don't close this page.
                        </span>
                      </>
                    )}
                    {paymentStatus === "failed" && (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 font-medium text-sm">
                          Payment failed. Please try again.
                        </span>
                      </>
                    )}
                    {paymentStatus === "timeout" && (
                      <>
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-700 font-medium text-sm">
                          Verification timed out. Check Transactions tab.
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* trust badges */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                {[
                  { icon: Shield, text: "100% Secure", color: "text-green-500" },
                  { icon: Zap, text: "Instant Credit", color: "text-blue-500" },
                  {
                    icon: CheckCircle,
                    text: "PhonePe Secured",
                    color: "text-purple-500",
                  },
                  { icon: Star, text: "Best Rates", color: "text-orange-500" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-xl px-3 py-2.5 border border-gray-100"
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ──────── TRANSACTIONS TAB ──────── */}
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
                <button
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white px-3 py-2 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  onClick={fetchTransactions}
                  disabled={isTxLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isTxLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              {isTxLoading ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 mt-4 text-sm">Loading transactions…</p>
                </div>
              ) : transactions.length === 0 ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-10 w-10 text-orange-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    No Transactions Yet
                  </h4>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Your recharge and consultation transaction history will appear here
                  </p>
                  <button
                    onClick={() => setActiveTab("recharge")}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-md transition-all"
                  >
                    Make Your First Recharge
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, index) => {
                    const id = tx._id || tx.id || index;
                    const isCredit =
                      tx.credit === true ||
                      tx.type === "credit" ||
                      tx.isCredited === true ||
                      tx.paymentFor === "recharge" ||
                      tx.paymentFor === "cashback";
                    const status =
                      tx.status || (tx.success ? "done" : "pending");
                    const success =
                      status === "done" || status === "success" || status === "SUCCESS";
                    const description = getPaymentLabel(tx);
                    const date = tx.createdAt || tx.date || tx.updatedAt;
                    const amount = Math.abs(Number(tx.amount || 0)).toFixed(2);

                    return (
                      <motion.div
                        key={id}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-xl ${
                                isCredit
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownCircle className="h-5 w-5" />
                              ) : (
                                getPaymentIcon(tx.paymentFor)
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 capitalize text-sm">
                                {description}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {date ? formatDate(date) : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold text-base ${
                                isCredit ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isCredit ? "+" : "-"}₹{amount}
                            </div>
                            <div
                              className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-semibold ${
                                success
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {success ? "Completed" : status}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
