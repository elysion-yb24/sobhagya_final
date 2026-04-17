"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle, ArrowRight, RefreshCw, Wallet } from "lucide-react";
import { getAuthToken } from "../utils/auth-utils";
import { useWalletBalance } from "../components/astrologers/WalletBalanceContext";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshWalletBalance } = useWalletBalance();

  const orderId = searchParams.get("order_id") || searchParams.get("transactionId");

  const [status, setStatus] = useState("processing"); // "processing" | "success" | "failed"
  const [message, setMessage] = useState("Verifying your payment…");

  const attemptsRef = useRef(0);
  const maxAttempts = 10;
  const pollInterval = 3000;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    let timeoutId;

    const checkStatus = async () => {
      if (!orderId) {
        if (isMounted.current) {
          setStatus("failed");
          setMessage("Invalid Order ID");
        }
        return;
      }

      if (attemptsRef.current >= maxAttempts) {
        if (isMounted.current) {
          setStatus("failed");
          setMessage(
            "Payment verification timed out. Please check your wallet."
          );
        }
        return;
      }

      attemptsRef.current += 1;

      try {
        const token = getAuthToken();
        const response = await fetch("/api/payment/phonepe/status-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ transactionId: orderId }),
          credentials: "include",
        });
        const json = await response.json();
        console.log("Poll response:", json);

        if (
          json?.success &&
          (json.data?.status === "done" || json.data?.status === "SUCCESS")
        ) {
          if (isMounted.current) {
            setStatus("success");
            setMessage("Payment Successful! Your wallet has been recharged.");
            // Refresh wallet balance
            try {
              await refreshWalletBalance();
            } catch {}
            scheduleSuccessRedirect();
          }
        } else if (
          json?.data?.status === "failed" ||
          json?.data?.status === "FAILED"
        ) {
          if (isMounted.current) {
            setStatus("failed");
            setMessage("Payment Failed. Please try again.");
          }
        } else {
          // Still processing — schedule next poll
          if (
            isMounted.current &&
            attemptsRef.current < maxAttempts
          ) {
            timeoutId = setTimeout(checkStatus, pollInterval);
          } else if (isMounted.current) {
            setStatus("failed");
            setMessage(
              "Payment verification timed out. Please check your wallet."
            );
          }
        }
      } catch (error) {
        console.log("Error polling payment status:", error);
        if (
          isMounted.current &&
          attemptsRef.current < maxAttempts
        ) {
          timeoutId = setTimeout(checkStatus, pollInterval);
        } else if (isMounted.current) {
          setStatus("failed");
          setMessage("An error occurred while verifying payment.");
        }
      }
    };

    const scheduleSuccessRedirect = () => {
      setTimeout(() => {
        if (isMounted.current) {
          router.push("/call-with-astrologer");
        }
      }, 8000);
    };

    checkStatus();

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [orderId, router, refreshWalletBalance]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white p-4">
      {/* decorative mandala background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='50' fill='none' stroke='%23D97706' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='35' fill='none' stroke='%23D97706' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='20' fill='none' stroke='%23D97706' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='5' fill='%23D97706'/%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 border border-orange-100 relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* icon based on status */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {status === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative z-10">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
              </motion.div>
            )}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center relative z-10">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </motion.div>
            )}
            {status === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-red-100 rounded-full blur-xl" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center relative z-10">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* text content */}
        <div className="space-y-2">
          <h1
            className={`text-2xl font-bold ${
              status === "success"
                ? "text-green-600"
                : status === "failed"
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {status === "processing"
              ? "Processing Payment"
              : status === "success"
              ? "Payment Successful! 🎉"
              : "Payment Failed"}
          </h1>
          <p className="text-gray-500 text-base">{message}</p>
        </div>

        {/* action buttons */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          {status === "failed" && (
            <>
              <button
                onClick={() => router.push("/wallet")}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
                Recharge Again
              </button>
              <button
                onClick={() => router.push("/call-with-astrologer")}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Go to Astrologers
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {status === "success" && (
            <>
              <button
                onClick={() => router.push("/call-with-astrologer")}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Talk to an Astrologer
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push("/wallet")}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                View Wallet
              </button>
              <p className="text-xs text-gray-400">
                Redirecting to astrologers in a few seconds…
              </p>
            </>
          )}

          {status === "processing" && (
            <p className="text-sm text-gray-400">
              Please do not close this window.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-orange-600 font-medium">Loading…</p>
          </div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
