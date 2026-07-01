"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Eye, RefreshCw, ScrollText, Video, Star } from "lucide-react";
import { isAuthenticated } from "../../utils/auth-utils";
import { fetchOrders, PoojaOrder, formatINR } from "../../utils/pooja-api";
import { startCallNative, hasNativeBridge } from "../../utils/nativeBridge";
import BackButton from "../../components/ui/BackButton";
import { Skeleton } from "../../components/ui/SkeletonLoader";
import PoojaFeedbackModal from "../../components/pooja/PoojaFeedbackModal";
import Countdown from "../../components/pooja/Countdown";

// The live puja video runs on the mobile app; the web only SIGNALS via the native
// bridge (postMessage + flutter). Returns false outside any WebView wrapper.
function fireStartCall(o: PoojaOrder): boolean {
  startCallNative({
    poojaId: o.lineItems?.[0]?.productId,
    orderId: String(o._id),
    sessionId: o.chatSessionId ? String(o.chatSessionId) : undefined,
    threadId: o.chatThreadId ? String(o.chatThreadId) : undefined,
  });
  return hasNativeBridge();
}

// Join enables ~2 minutes before the scheduled time. NOTE: the authoritative gate
// is server/mobile-side; this is the UX affordance. Returns 'soon' | 'open' | null.
function joinState(o: PoojaOrder): "soon" | "open" | null {
  const at = o.pujaLive?.scheduledAt ? new Date(o.pujaLive.scheduledAt).getTime() : 0;
  if (!at || o.pujaLive?.status === "completed" || o.pujaLive?.status === "cancelled") return null;
  return Date.now() >= at - 2 * 60 * 1000 ? "open" : "soon";
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING_PAYMENT: "bg-[#F49C1C]/20 text-[#F49C1C]",
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
    <div className="bg-white rounded-[2rem] border border-gray-100 p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton variant="text" height={14} width={120} />
        <Skeleton variant="rounded" height={22} width={80} />
      </div>
      <Skeleton variant="text" height={18} width="70%" />
      <Skeleton variant="text" height={14} width="40%" />
      <div className="flex gap-3 pt-3">
        <Skeleton variant="rounded" height={44} className="flex-1" />
        <Skeleton variant="rounded" height={44} className="flex-1" />
      </div>
    </div>
  );
}

export default function PoojaOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PoojaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<PoojaOrder | null>(null);
  const [joinNote, setJoinNote] = useState<string | null>(null);

  const onJoin = (o: PoojaOrder) => {
    if (!fireStartCall(o)) {
      setJoinNote("Please open the Sobhagya app to start your Live Puja.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?next=${encodeURIComponent("/pooja/orders")}`);
      return;
    }
    const refresh = (initial = false) =>
      fetchOrders()
        .then(setOrders)
        .catch((e) => setError(e.message))
        .finally(() => initial && setLoading(false));
    refresh(true);
    // Re-fetch when the user returns to this tab/page (e.g. after scheduling on the
    // detail page) so the scheduled time + Join state stay consistent everywhere.
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="font-bold text-[#4A3B32] text-2xl mb-4">My Remedy Orders</h1>

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
            const js = joinState(o);
            const scheduledLabel = o.pujaLive?.scheduledAt
              ? new Date(o.pujaLive.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
              : null;
            const canFeedback = o.status === "COMPLETED" && !o.feedback?.rating;
            return (
              <div key={o._id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(255,140,0,0.03)] hover:shadow-[0_12px_30px_rgba(255,106,0,0.1)] border border-orange-50 p-5 sm:p-6 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">ORDER #{o._id.slice(-8).toUpperCase()}</span>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[o.status] || o.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="font-bold text-[#4A3B32] text-lg mt-2.5">{first?.title}</p>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">{first?.providerName}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[#FF8C00] font-bold text-lg">{formatINR(o.totalPayable)}</span>
                  <span className="text-xs font-medium text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                {scheduledLabel && o.pujaLive?.status !== "completed" && (
                  <div className="mt-2 flex items-center justify-between gap-2 bg-[#FFFAF0] border border-orange-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-600">🪔 Live Puja · <span className="font-semibold text-[#4A3B32]">{scheduledLabel}</span></p>
                    <Countdown to={o.pujaLive?.scheduledAt} className="text-[11px] font-bold text-[#FF8C00] shrink-0" prefix="" endedLabel="now" />
                  </div>
                )}

                {/* Join Now (live puja) — enabled ~2 min before the scheduled time. */}
                {js && (
                  <>
                    <button
                      onClick={() => js === "open" && onJoin(o)}
                      disabled={js !== "open"}
                      className={`mt-4 w-full text-[15px] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                        js === "open"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      }`}
                    >
                      <Video className="w-5 h-5" /> {js === "open" ? "Join Live Puja Now" : "Button enables 2 mins before time"}
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-1.5">Your Live Puja can run up to 4 hours.</p>
                  </>
                )}

                <div className="flex gap-3 mt-4">
                  {/* Always available: full booking + payment details + invoice. */}
                  <button
                    onClick={() => router.push(`/pooja/orders/${o._id}`)}
                    className="flex-1 border-2 border-orange-50 text-[#4A3B32] text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#FFFAF0] transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  {canFeedback ? (
                    <button
                      onClick={() => setFeedbackFor(o)}
                      className="flex-1 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(255,106,0,0.3)]"
                    >
                      <Star className="w-4 h-4 drop-shadow-sm" /> Rate Puja
                    </button>
                  ) : o.pujaLive?.scheduledAt && o.pujaLive?.status !== "completed" && o.pujaLive?.status !== "cancelled" ? (
                    <button
                      onClick={() => router.push(`/pooja/orders/${o._id}`)}
                      className="flex-1 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(255,106,0,0.3)] transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> Reschedule
                    </button>
                  ) : (o.status === "PAID" || o.status === "IN_PROGRESS") ? (
                    <button
                      onClick={() => router.push(`/pooja/orders/${o._id}`)}
                      className="flex-1 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(255,106,0,0.3)] transition-all"
                    >
                      <CalendarClock className="w-4 h-4" /> Schedule Puja
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FFFAF0] flex items-center justify-center mb-4 shadow-inner">
              <ScrollText className="w-7 h-7 text-[#FF8C00]" />
            </div>
            <p className="text-gray-700 font-medium">No remedy orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Book a puja to see it here.</p>
            <button onClick={() => router.push("/pooja")} className="mt-5 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-semibold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(255,106,0,0.3)] transition-all">
              Browse Remedies
            </button>
          </div>
        )}
      </div>

      {feedbackFor && (
        <PoojaFeedbackModal
          orderId={feedbackFor._id}
          onClose={() => setFeedbackFor(null)}
          onSubmitted={(rating, comment) =>
            setOrders((prev) => prev.map((x) => (x._id === feedbackFor._id ? { ...x, feedback: { rating, comment } } : x)))
          }
        />
      )}

      {joinNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setJoinNote(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-3xl mb-2">📱</div>
            <p className="text-gray-700">{joinNote}</p>
            <button onClick={() => setJoinNote(null)} className="mt-4 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-semibold px-6 py-2 rounded-lg">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
