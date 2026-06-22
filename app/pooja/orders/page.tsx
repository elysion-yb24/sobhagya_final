"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, RotateCcw, ScrollText } from "lucide-react";
import { isAuthenticated } from "../../utils/auth-utils";
import { fetchOrders, fetchOrder, PoojaOrder, formatINR } from "../../utils/pooja-api";
import BackButton from "../../components/ui/BackButton";
import { Skeleton } from "../../components/ui/SkeletonLoader";

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PENDING_PAYMENT: "Payment Pending",
  FAILED: "Failed",
};

function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4 space-y-2">
      <div className="flex justify-between">
        <Skeleton variant="text" height={12} width={100} />
        <Skeleton variant="rounded" height={18} width={70} />
      </div>
      <Skeleton variant="text" height={16} width="60%" />
      <Skeleton variant="text" height={12} width="40%" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rounded" height={36} className="flex-1" />
        <Skeleton variant="rounded" height={36} className="flex-1" />
      </div>
    </div>
  );
}

export default function PoojaOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PoojaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  // Open the booking's chat (the in-app embed of Chatterbox). The chat session is
  // created server-side on the PAID tail; if it wasn't (chat-service briefly
  // unreachable), fetching the order self-heals it first.
  const openChat = async (o: PoojaOrder) => {
    setOpening(o._id);
    setError(null);
    try {
      let threadId = o.chatThreadId;
      let sessionId = o.chatSessionId;
      if (!threadId) {
        const fresh = await fetchOrder(o._id);
        threadId = fresh.chatThreadId || null;
        sessionId = fresh.chatSessionId || null;
      }
      if (!threadId) {
        setError("Couldn't connect you to the pandit yet. Please try again in a moment.");
        return;
      }
      router.push(`/pooja/chat/${threadId}${sessionId ? `?sessionId=${sessionId}` : ""}`);
    } catch (e: any) {
      setError(e?.message || "Couldn't open the chat.");
    } finally {
      setOpening(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?next=${encodeURIComponent("/pooja/orders")}`);
      return;
    }
    fetchOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">My Remedy Orders</h1>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}

        <div className="space-y-3">
          {!loading && orders.map((o) => {
            const first = o.lineItems?.[0];
            return (
              <div key={o._id} className="bg-white rounded-2xl shadow-sm hover:shadow-premium border border-orange-100 p-4 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">#{o._id.slice(-12)}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[o.status] || o.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 mt-1.5">{first?.title}</p>
                <p className="text-xs text-gray-400">{first?.providerName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-600 font-bold">{formatINR(o.totalPayable)}</span>
                  <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  {first && (
                    <button
                      onClick={() => router.push(`/pooja/product/${first.productId}`)}
                      className="flex-1 border border-orange-200 text-orange-700 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-orange-50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Book Again
                    </button>
                  )}
                  {(o.status === "PAID" || o.status === "IN_PROGRESS" || o.status === "COMPLETED") && (
                    <button
                      onClick={() => openChat(o)}
                      disabled={opening === o._id}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      <MessageCircle className="w-4 h-4" /> {opening === o._id ? "Connecting…" : "Chat with Pandit"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4">
              <ScrollText className="w-7 h-7 text-orange-500" />
            </div>
            <p className="text-gray-700 font-medium">No remedy orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Book a puja to see it here.</p>
            <button onClick={() => router.push("/pooja")} className="mt-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md">
              Browse Remedies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
