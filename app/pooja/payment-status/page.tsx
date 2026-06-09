"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, MessageCircle, ScrollText } from "lucide-react";
import { fetchOrder } from "../../utils/pooja-api";

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") ?? null;

  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [message, setMessage] = useState("Verifying your payment…");
  const [threadId, setThreadId] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const maxAttempts = 12;
  const pollInterval = 3000;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timeoutId: any;

    const check = async () => {
      if (!orderId) {
        setStatus("failed");
        setMessage("Invalid order.");
        return;
      }
      if (attemptsRef.current >= maxAttempts) {
        setStatus("failed");
        setMessage("Payment verification timed out. Check 'My Orders' shortly.");
        return;
      }
      attemptsRef.current += 1;
      try {
        const order = await fetchOrder(orderId);
        if (!mounted.current) return;
        if (order.status === "PAID" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") {
          setStatus("success");
          setMessage("Payment successful! Your remedy is booked.");
          setThreadId(order.chatThreadId || null);
          // Wallet may have been debited — nudge the header balance to refresh.
          if (typeof window !== "undefined") window.dispatchEvent(new Event("wallet-balance-refresh"));
          setTimeout(() => {
            if (mounted.current) router.push(order.chatThreadId ? `/pooja/chat/${order.chatThreadId}` : "/pooja/orders");
          }, 4000);
        } else if (order.status === "FAILED") {
          setStatus("failed");
          setMessage("Payment failed. Please try again.");
        } else {
          timeoutId = setTimeout(check, pollInterval);
        }
      } catch (e: any) {
        if (mounted.current && attemptsRef.current < maxAttempts) timeoutId = setTimeout(check, pollInterval);
        else {
          setStatus("failed");
          setMessage("An error occurred while verifying payment.");
        }
      }
    };

    check();
    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [orderId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white p-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 border border-orange-100"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center">
          {status === "processing" && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          )}
          {status === "failed" && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className={`text-2xl font-bold ${status === "success" ? "text-green-600" : status === "failed" ? "text-red-600" : "text-gray-900"}`}>
            {status === "processing" ? "Processing Payment" : status === "success" ? "Booking Confirmed 🎉" : "Payment Failed"}
          </h1>
          <p className="text-gray-500 text-base">{message}</p>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-3">
          {status === "success" && (
            <>
              {threadId && (
                <button
                  onClick={() => router.push(`/pooja/chat/${threadId}`)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" /> Chat with Pandit
                </button>
              )}
              <button onClick={() => router.push("/pooja/orders")} className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                <ScrollText className="h-4 w-4" /> View My Orders
              </button>
              <p className="text-xs text-gray-400">Taking you there automatically…</p>
            </>
          )}
          {status === "failed" && (
            <button onClick={() => router.push("/pooja")} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-xl">
              Back to Remedies
            </button>
          )}
          {status === "processing" && <p className="text-sm text-gray-400">Please do not close this window.</p>}
        </div>
      </motion.div>
    </div>
  );
}

export default function PoojaPaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-90px)]">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
