"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { fetchOrder } from "../../utils/pooja-api";

const SUCCESS_REDIRECT_MS = 3000; // success placeholder shows ~3s, then routes to chat
const FAIL_REDIRECT_MS = 3000; // failed placeholder shows ~3s, then routes back to Remedies

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") ?? null;

  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [message, setMessage] = useState("Verifying your payment…");

  const attemptsRef = useRef(0);
  const maxAttempts = 12;
  const pollInterval = 3000;
  const mounted = useRef(true);
  const settled = useRef(false); // guard so we redirect exactly once

  useEffect(() => {
    mounted.current = true;
    let timeoutId: any;

    // Failure placeholder → auto-redirect back to Remedies. No buttons.
    const failAndRedirect = (msg: string) => {
      if (settled.current) return;
      settled.current = true;
      setStatus("failed");
      setMessage(msg);
      timeoutId = setTimeout(() => {
        if (mounted.current) router.push("/pooja");
      }, FAIL_REDIRECT_MS);
    };

    // Success placeholder → auto-redirect into the astrologer chat. No buttons.
    const succeedAndRedirect = (dest: string, msg: string) => {
      if (settled.current) return;
      settled.current = true;
      setStatus("success");
      setMessage(msg);
      // Wallet may have been debited — nudge the header balance to refresh.
      if (typeof window !== "undefined") window.dispatchEvent(new Event("wallet-balance-refresh"));
      timeoutId = setTimeout(() => {
        if (mounted.current) router.push(dest);
      }, SUCCESS_REDIRECT_MS);
    };

    // Authoritative final check: a GET order triggers the server-side reconcile
    // (a wallet debit with a still-PENDING order flips to PAID), so we NEVER show
    // "failed" while money was actually taken.
    const finalCheckThenFail = async (timeoutMsg: string) => {
      try {
        const order = await fetchOrder(orderId as string);
        if (!mounted.current) return;
        if (order.status === "PAID" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") {
          succeedAndRedirect(
            order.chatThreadId ? `/pooja/chat/${order.chatThreadId}` : `/pooja/orders/${orderId}`,
            "Payment successful! Connecting you with your astrologer…",
          );
          return;
        }
      } catch { /* fall through to failure */ }
      failAndRedirect(timeoutMsg);
    };

    const check = async () => {
      if (!orderId) {
        failAndRedirect("Invalid order. Taking you back to Remedies…");
        return;
      }
      if (attemptsRef.current >= maxAttempts) {
        await finalCheckThenFail("Payment verification timed out. Taking you back to Remedies…");
        return;
      }
      attemptsRef.current += 1;
      try {
        const order = await fetchOrder(orderId);
        if (!mounted.current) return;
        if (order.status === "PAID" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") {
          // Connect the devotee straight into the astrologer chat (the /pooja/chat
          // handoff seeds cookies and opens chat_web_app). Wait one extra cycle for the
          // chat session to be stamped so we have the threadId to route to.
          if (!order.chatThreadId && attemptsRef.current < maxAttempts) {
            timeoutId = setTimeout(check, pollInterval);
            return;
          }
          succeedAndRedirect(
            order.chatThreadId ? `/pooja/chat/${order.chatThreadId}` : `/pooja/orders/${orderId}`,
            "Payment successful! Connecting you with your astrologer…",
          );
        } else if (order.status === "FAILED") {
          failAndRedirect("Payment failed. Taking you back to Remedies…");
        } else {
          timeoutId = setTimeout(check, pollInterval);
        }
      } catch (e: any) {
        if (mounted.current && attemptsRef.current < maxAttempts) timeoutId = setTimeout(check, pollInterval);
        else failAndRedirect("An error occurred while verifying payment. Taking you back to Remedies…");
      }
    };

    check();
    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [orderId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32] p-4">
      <motion.div
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(255,140,0,0.12)] p-8 sm:p-10 max-w-md w-full text-center space-y-6 border border-orange-50"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center">
          {status === "processing" && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6A00]/10 to-[#FFD200]/15 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#FF8C00] animate-spin" />
            </div>
          )}
          {status === "success" && (
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>
          )}
          {status === "failed" && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-50 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className={`text-2xl font-bold ${status === "success" ? "text-emerald-600" : status === "failed" ? "text-red-600" : "text-[#4A3B32]"}`}>
            {status === "processing" ? "Processing Payment" : status === "success" ? "Booking Confirmed 🎉" : "Payment Failed"}
          </h1>
          <p className="text-gray-500 text-base">{message}</p>
        </div>

        {status === "processing" && <p className="text-sm text-gray-400">Please do not close this window.</p>}
      </motion.div>
    </div>
  );
}

export default function PoojaPaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-90px)] bg-[#FFFAF0]">
          <Loader2 className="w-10 h-10 text-[#FF8C00] animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
