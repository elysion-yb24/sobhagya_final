"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Tag, Wallet, CheckCircle2 } from "lucide-react";
import { isAuthenticated } from "../../utils/auth-utils";
import { useWalletBalance } from "../../components/astrologers/WalletBalanceContext";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import BackButton from "../../components/ui/BackButton";
import {
  fetchQuote,
  createOrder,
  fetchActiveOrder,
  payFromWallet,
  PoojaQuote,
  PoojaOrder,
  formatINR,
} from "../../utils/pooja-api";
import { topUpWalletNative } from "../../utils/nativeBridge";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get("productId") || "";
  const providerId = searchParams?.get("providerId") || "";

  const { walletBalance, refreshWalletBalance } = useWalletBalance();

  const lineItems = useMemo(() => [{ productId, providerId }], [productId, providerId]);

  const [quote, setQuote] = useState<PoojaQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [applying, setApplying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  // Set when this remedy+astrologer was already booked & paid — we show a notice
  // and bounce the user back to Remedies so they can never pay twice.
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  // Reuse the same created order across retries so we never double-charge.
  const createdOrderRef = useRef<PoojaOrder | null>(null);
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pooja-${Date.now()}-${Math.random()}`
  );

  // Show "already booked" then send the user back to the Remedies tab.
  const bounceAlreadyPaid = () => {
    setAlreadyPaid(true);
    setPaying(false);
    setTimeout(() => router.push("/pooja"), 2000);
  };

  useEffect(() => {
    if (!productId || !providerId) {
      setError("Missing product or pandit selection.");
      setLoading(false);
      return;
    }
    if (!isAuthenticated()) {
      router.push(`/login?next=${encodeURIComponent(`/pooja/checkout?productId=${productId}&providerId=${providerId}`)}`);
      return;
    }
    refreshWalletBalance();
    // Guard against re-paying: if a live order for this remedy+astrologer already
    // exists, either bounce (already paid) or reuse the still-pending one.
    fetchActiveOrder(productId, providerId)
      .then((existing) => {
        if (!existing) return loadQuote(undefined);
        if (["PAID", "IN_PROGRESS", "COMPLETED"].includes(existing.status)) {
          setLoading(false);
          bounceAlreadyPaid();
          return;
        }
        // A still-PENDING order for this cart → reuse it so we never create a duplicate.
        createdOrderRef.current = existing;
        return loadQuote(existing.couponCode || undefined);
      })
      .catch(() => loadQuote(undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, providerId]);

  // Auth failures are handled globally by SessionExpiredModal; show a friendly
  // message for everything else and never surface a raw "HTTP 401: {…}" body.
  const friendlyError = (e: any): string => {
    const msg = typeof e?.message === "string" ? e.message : "";
    if (/401|unauthor|authentication|please log in|session_expired/i.test(msg)) {
      return "Your session has expired. Please log in again.";
    }
    return msg || "Something went wrong. Please try again.";
  };

  const loadQuote = async (couponCode?: string) => {
    try {
      setApplying(!!couponCode);
      const q = await fetchQuote(lineItems, couponCode);
      setQuote(q);
      setAppliedCoupon(q.couponApplied ? q.couponCode || undefined : undefined);
      if (couponCode && !q.couponApplied) setError("Invalid coupon code.");
      else setError(null);
    } catch (e: any) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
      setApplying(false);
    }
  };

  const grandTotal = quote?.totalPayable ?? 0;
  const walletCovers = walletBalance >= grandTotal;
  const shortfall = Math.max(0, Math.ceil(grandTotal - walletBalance));
  const walletApplied = Math.min(walletBalance, grandTotal);
  const balanceAfter = Math.max(0, walletBalance - grandTotal);

  const ensureOrder = async (): Promise<PoojaOrder> => {
    if (createdOrderRef.current) return createdOrderRef.current;
    const order = await createOrder(lineItems, idempotencyKey, appliedCoupon);
    createdOrderRef.current = order;
    return order;
  };

  const onPayWallet = async () => {
    if (!quote) return;
    setPaying(true);
    setError(null);
    try {
      const order = await ensureOrder();
      // Race/back-button safety: the backend dedups to the existing order, so if it
      // is already settled, never debit again — show the notice and bounce.
      if (order.status && order.status !== "PENDING_PAYMENT") {
        bounceAlreadyPaid();
        return;
      }
      await payFromWallet(order._id);
      refreshWalletBalance();
      router.push(`/pooja/payment-status?orderId=${order._id}`);
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "";
      if (/401|unauthor|authentication|please log in|session_expired/i.test(msg)) {
        setError("Your session has expired. Please log in again.");
      } else if (/balance|DONT_HAVE_ENOUGH/i.test(msg)) {
        setError("Insufficient wallet balance. Please recharge your wallet to continue.");
        topUpWalletNative(shortfall);
        setShowTopUp(true);
      } else {
        setError("Wallet payment failed. Please try again.");
      }
      setPaying(false);
    }
  };

  // Pooja is wallet-only: pay when the wallet covers the total, otherwise prompt a
  // recharge. Inside the native WebView, also signal the wrapper to open its
  // top-up flow (postMessage + flutter); the web recharge modal is the fallback.
  const onPrimary = () => {
    if (walletCovers) {
      onPayWallet();
    } else {
      topUpWalletNative(shortfall);
      setShowTopUp(true);
    }
  };

  const onTopUpClose = () => {
    setShowTopUp(false);
    refreshWalletBalance();
  };

  if (alreadyPaid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-600">You've already booked this pooja 🙏</h1>
        <p className="text-gray-500 mt-2 max-w-sm">Your payment for this remedy is already done. Taking you back to Remedies…</p>
        <Loader2 className="w-5 h-5 text-[#FF8C00] animate-spin mt-5" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin" />
      </div>
    );
  }

  const primaryLabel = paying
    ? ""
    : walletCovers
    ? `Pay ${formatINR(grandTotal)} from Wallet`
    : `Add ${formatINR(shortfall)} & Pay`;

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] pb-28 font-sans text-[#4A3B32]">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="font-bold text-[#4A3B32] text-2xl mb-4">Checkout</h1>

        {quote && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(255,140,0,0.03)] border border-orange-50 p-6 space-y-4">
              {quote.lineItems.map((li, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-gray-800 text-[15px]">{li.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{li.providerName}</p>
                  </div>
                  <span className="font-black text-gray-800 text-base">{formatINR(li.price)}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <Row label="Subtotal" value={formatINR(quote.subtotal)} />
                {quote.discount > 0 && (
                  <Row label={`Discount${quote.couponCode ? ` (${quote.couponCode})` : ""}`} value={`- ${formatINR(quote.discount)}`} green />
                )}
                <Row label={`GST (${(quote.gstRate * 100).toFixed(1)}%)`} value={formatINR(quote.gstAmount)} />
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-[#4A3B32] text-base">Total Payable</span>
                  <span className="font-bold text-[#FF8C00] text-xl tracking-tight">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 pt-2">
                <div className="flex-1 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3">
                  <Tag className="w-4 h-4 text-orange-400" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 py-2 text-sm outline-none bg-transparent"
                  />
                </div>
                <button
                  onClick={() => loadQuote(coupon)}
                  disabled={!coupon || applying}
                  className="px-4 rounded-xl bg-orange-100 text-orange-700 text-sm font-semibold disabled:opacity-50"
                >
                  {applying ? "…" : "APPLY"}
                </button>
              </div>
            </div>

            {/* Payment method — Sobhagya Wallet only. */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(255,140,0,0.03)] border border-orange-50 p-6">
              <p className="font-bold text-[#4A3B32] text-[15px] mb-4">Payment Method</p>

              <div className="w-full text-left rounded-2xl border border-[#FF8C00]/30 bg-gradient-to-br from-[#FFFAF0] to-[#FF8C00]/10 p-4 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] flex items-center justify-center shadow-sm">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#4A3B32] text-[15px]">Sobhagya Wallet</p>
                      <p className="text-[13px] text-gray-500 font-medium">Balance: <span className="font-bold text-[#4A3B32]">{formatINR(walletBalance)}</span></p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#FF8C00]" />
                </div>

                <div className="mt-3 pt-3 border-t border-orange-100 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Paid from wallet</span>
                    <span className="text-green-600 font-medium">- {formatINR(walletApplied)}</span>
                  </div>
                  {walletCovers ? (
                    <div className="flex justify-between text-gray-500">
                      <span>Balance after payment</span>
                      <span className="font-medium text-gray-700">{formatINR(balanceAfter)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-red-600 font-medium">Add to wallet</span>
                      <span className="text-red-600 font-bold">{formatINR(shortfall)}</span>
                    </div>
                  )}
                </div>
              </div>

              {!walletCovers && (
                <button
                  onClick={() => setShowTopUp(true)}
                  className="w-full mt-3 rounded-xl border border-orange-200 text-orange-700 text-sm font-semibold py-2.5 hover:bg-orange-50"
                >
                  + Recharge wallet to continue
                </button>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-400 px-1">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Payments are processed securely. Your astrologer is confirmed on booking — schedule your Live Puja after payment; they may propose a new time for you to approve.
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 text-sm py-3">{error}</p>}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-orange-100/50 p-4 shadow-[0_-10px_30px_rgba(255,140,0,0.05)]">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onPrimary}
            disabled={paying || !quote}
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,106,0,0.4)] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : primaryLabel}
          </button>
        </div>
      </div>

      <InsufficientBalanceModal
        isOpen={showTopUp}
        onClose={onTopUpClose}
        currentBalance={walletBalance}
        requiredAmount={grandTotal}
        serviceType="consultation"
      />
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={green ? "text-green-600 font-medium" : "text-gray-700 font-medium"}>{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
