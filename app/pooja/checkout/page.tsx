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
  initiatePayment,
  payFromWallet,
  PoojaQuote,
  PoojaOrder,
  formatINR,
} from "../../utils/pooja-api";

type PayMethod = "wallet" | "phonepe";

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
  const [method, setMethod] = useState<PayMethod>("wallet");
  const [showTopUp, setShowTopUp] = useState(false);

  // Reuse the same created order across retries so we never double-charge.
  const createdOrderRef = useRef<PoojaOrder | null>(null);
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pooja-${Date.now()}-${Math.random()}`
  );

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
    loadQuote(undefined);
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
      await payFromWallet(order._id);
      refreshWalletBalance();
      router.push(`/pooja/payment-status?orderId=${order._id}`);
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "";
      if (/401|unauthor|authentication|please log in|session_expired/i.test(msg)) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Wallet payment failed. You can pay directly via PhonePe instead.");
        setMethod("phonepe");
      }
      setPaying(false);
    }
  };

  const onPayPhonePe = async () => {
    if (!quote) return;
    setPaying(true);
    setError(null);
    try {
      const order = await ensureOrder();
      // Backend (pg-sdk-node) creates the PhonePe order and returns the hosted
      // checkout URL. User pays via UPI / card / net-banking, then is redirected
      // to /pooja/payment-status.
      const { redirectUrl } = await initiatePayment(order._id);
      window.location.href = redirectUrl;
    } catch (e: any) {
      setError(friendlyError(e));
      setPaying(false);
    }
  };

  const onPrimary = () => {
    if (method === "wallet") {
      if (walletCovers) onPayWallet();
      else setShowTopUp(true);
    } else {
      onPayPhonePe();
    }
  };

  const onTopUpClose = () => {
    setShowTopUp(false);
    refreshWalletBalance();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const primaryLabel = paying
    ? ""
    : method === "wallet"
    ? walletCovers
      ? `Pay ${formatINR(grandTotal)} from Wallet`
      : `Add ${formatINR(shortfall)} & Pay`
    : `Pay ${formatINR(grandTotal)} via PhonePe`;

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white pb-28">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">Checkout</h1>

        {quote && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 space-y-3">
              {quote.lineItems.map((li, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{li.title}</p>
                    <p className="text-xs text-gray-400">{li.providerName}</p>
                  </div>
                  <span className="font-semibold text-gray-700">{formatINR(li.price)}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(quote.subtotal)} />
                {quote.discount > 0 && (
                  <Row label={`Discount${quote.couponCode ? ` (${quote.couponCode})` : ""}`} value={`- ${formatINR(quote.discount)}`} green />
                )}
                <Row label={`GST (${(quote.gstRate * 100).toFixed(1)}%)`} value={formatINR(quote.gstAmount)} />
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Payable</span>
                  <span className="font-bold text-orange-600 text-lg">{formatINR(grandTotal)}</span>
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

            {/* Payment method */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <p className="font-semibold text-gray-800 text-sm mb-3">Payment Method</p>

              {/* Wallet option */}
              <button
                onClick={() => setMethod("wallet")}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  method === "wallet" ? "border-orange-400 bg-orange-50/60 ring-1 ring-orange-200" : "border-orange-100 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Sobhagya Wallet</p>
                      <p className="text-xs text-gray-500">Balance: <span className="font-semibold text-gray-700">{formatINR(walletBalance)}</span></p>
                    </div>
                  </div>
                  {method === "wallet" && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                </div>

                {method === "wallet" && (
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
                )}
              </button>

              {/* PhonePe option */}
              <button
                onClick={() => setMethod("phonepe")}
                className={`w-full text-left rounded-xl border p-4 mt-3 transition-all ${
                  method === "phonepe" ? "border-orange-400 bg-orange-50/60 ring-1 ring-orange-200" : "border-orange-100 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-sm font-bold text-purple-700">
                      ₹
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Pay directly via PhonePe</p>
                      <p className="text-xs text-gray-500">UPI · Card · Net Banking</p>
                    </div>
                  </div>
                  {method === "phonepe" && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                </div>
              </button>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-400 px-1">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Payments are processed securely. Remedies are non-refundable once booked.
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 text-sm py-3">{error}</p>}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-orange-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onPrimary}
            disabled={paying || !quote}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
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
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
