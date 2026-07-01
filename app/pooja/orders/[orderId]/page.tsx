"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarClock, MessageCircle, Video, Clock, CheckCircle2, Sparkles, RefreshCw, Download } from "lucide-react";
import { isAuthenticated } from "../../../utils/auth-utils";
import { fetchOrder, fetchProduct, PoojaOrder, PoojaSchedule, formatINR } from "../../../utils/pooja-api";
import { usePoojaChat } from "../../../hooks/usePoojaChat";
import { startCallNative } from "../../../utils/nativeBridge";
import SchedulePujaLiveModal from "../../../components/pooja/SchedulePujaLiveModal";
import PoojaFeedbackModal from "../../../components/pooja/PoojaFeedbackModal";
import Countdown from "../../../components/pooja/Countdown";
import BackButton from "../../../components/ui/BackButton";
import { Skeleton } from "../../../components/ui/SkeletonLoader";

const JOIN_WINDOW_MS = 2 * 60 * 1000; // Join enables 2 min before the scheduled time.

function fmt(dt?: string | null) {
  return dt ? new Date(dt).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
}

export default function PoojaOrderHubPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "";

  const [order, setOrder] = useState<PoojaOrder | null>(null);
  const [schedule, setSchedule] = useState<PoojaSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [responding, setResponding] = useState(false);
  const [tick, setTick] = useState(0);
  // Pooja image: prefer the snapshot on the order; fall back to the live product
  // (covers orders created before image-snapshotting landed).
  const [imageUrl, setImageUrl] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const o = await fetchOrder(orderId);
      setOrder(o);
      setSchedule(o.pujaLive || null);
      const li = o.lineItems?.[0];
      if (li?.image) {
        setImageUrl(li.image);
      } else if (li?.productId) {
        fetchProduct(li.productId)
          .then((p) => setImageUrl(p.imageUrl || p.heroImage || p.thumbnail || ""))
          .catch(() => {});
      }
      // If the puja already completed while the devotee was away and they never
      // rated, surface the feedback prompt on open (the live socket event may have
      // fired when they weren't on this page).
      if (o.status === "COMPLETED" && !o.feedback?.rating) setShowFeedback(true);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Couldn't load your booking.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(`/pooja/orders/${orderId}`)}`);
      return;
    }
    load();
  }, [orderId, load, router]);

  // re-evaluate the join window each second
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { scheduleLive, respondScheduleChange, markJoin } = usePoojaChat({
    threadId: order?.chatThreadId,
    sessionId: order?.chatSessionId,
    orderId,
    handlers: {
      pooja_live_scheduled: (p) => p?.pujaLive && setSchedule(p.pujaLive),
      pooja_schedule_change_requested: (p) => p?.pujaLive && setSchedule(p.pujaLive),
      pooja_live_start: () => load(),
      pooja_live_reminder: () => load(),
      // Live puja ended → prompt for the in-app rating, then refresh the order so
      // the page reflects the COMPLETED state.
      pooja_feedback_request: () => {
        setShowFeedback(true);
        load();
      },
    },
  });

  const first = order?.lineItems?.[0];
  const scheduledAt = schedule?.scheduledAt || null;
  const pending = schedule?.changeRequest?.status === "pending" ? schedule.changeRequest : null;
  const isCompleted = schedule?.status === "completed" || order?.status === "COMPLETED";

  const joinable = useMemo(() => {
    void tick;
    if (!scheduledAt || isCompleted) return false;
    return Date.now() >= new Date(scheduledAt).getTime() - JOIN_WINDOW_MS;
  }, [scheduledAt, isCompleted, tick]);

  const handleSchedule = async (date: Date) => {
    const resp = await scheduleLive(date.toISOString());
    if (resp?.success) {
      if (resp.data) setSchedule(resp.data);
    } else {
      throw new Error(resp?.message || "Could not schedule. Please try again.");
    }
  };

  const onRespond = async (accept: boolean) => {
    setResponding(true);
    try {
      const resp = await respondScheduleChange(accept);
      if (resp?.success && resp.data) setSchedule(resp.data);
      if (!accept) setShowSchedule(true); // decline → repropose
    } finally {
      setResponding(false);
    }
  };

  const onJoin = () => {
    markJoin();
    startCallNative({
      poojaId: first?.productId,
      orderId,
      sessionId: order?.chatSessionId ? String(order.chatSessionId) : undefined,
      threadId: order?.chatThreadId ? String(order.chatThreadId) : undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Skeleton variant="rounded" height={120} className="w-full" />
          <Skeleton variant="rounded" height={160} className="w-full" />
        </div>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-red-500 text-sm">{error || "Booking not found."}</p>
        <button onClick={() => router.push("/pooja/orders")} className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold shadow-[0_4px_15px_rgba(255,106,0,0.3)]">
          My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          <button onClick={load} className="text-gray-400 hover:text-[#FF8C00] transition-colors" aria-label="Refresh"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {/* Booking summary */}
        <div className="bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] p-5">
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Booking confirmed
          </div>
          <div className="flex gap-4 mt-2">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={first?.title || "Pooja"} className="w-20 h-20 rounded-2xl object-cover border border-orange-50 shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-[#FF8C00]" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[#4A3B32] leading-tight">{first?.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">with {first?.providerName || "your astrologer"}</p>
              <p className="text-xs text-gray-400 mt-1.5">Your astrologer is committed to perform this remedy. Schedule your Live Puja below — they may propose a new time for you to approve.</p>
            </div>
          </div>
        </div>

        {/* Pending astrologer change-request */}
        {pending?.proposedAt && (
          <div className="mt-4 rounded-[2rem] border border-sky-200 bg-sky-50 p-5">
            <p className="text-sm font-bold text-sky-900 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Astrologer proposed a new time</p>
            <p className="text-sm text-sky-800 mt-1 font-semibold">{fmt(pending.proposedAt)}</p>
            {pending.note ? <p className="text-xs text-sky-700 mt-0.5">Reason: “{pending.note}”</p> : null}
            <div className="mt-3 flex gap-2">
              <button onClick={() => onRespond(true)} disabled={responding} className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60">Accept</button>
              <button onClick={() => onRespond(false)} disabled={responding} className="flex-1 rounded-xl border border-sky-300 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-60">Decline · Repropose</button>
            </div>
          </div>
        )}

        {/* Schedule card */}
        <div className="mt-4 bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] p-5">
          {scheduledAt ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Live Puja {isCompleted ? "completed" : "scheduled for"}</p>
                  <p className="text-lg font-bold text-[#4A3B32] mt-0.5">{fmt(scheduledAt)}</p>
                  {!isCompleted && <Countdown to={scheduledAt} className="text-xs text-[#FF8C00] font-semibold" prefix="Starts in " endedLabel="Starting now" />}
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-[#FF8C00]" />
                </div>
              </div>

              {!isCompleted && (
                <>
                  {/* Join */}
                  <button
                    onClick={joinable ? onJoin : undefined}
                    disabled={!joinable}
                    className={`mt-4 w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      joinable
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Video className="w-4 h-4" /> {joinable ? "Join Live Puja" : "Join enables 2 minutes before Pooja"}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2">Your Live Puja can run up to 4 hours.</p>

                  <button onClick={() => setShowSchedule(true)} className="mt-3 w-full py-2.5 rounded-2xl text-sm font-semibold border border-orange-100 text-[#4A3B32] hover:border-[#FF8C00] hover:text-[#FF8C00] transition-colors">
                    Reschedule
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-[#FF8C00]" />
              </div>
              <p className="font-bold text-[#4A3B32]">Propose your Pooja Schedule</p>
              <p className="text-sm text-gray-500 mt-1">Pick a time that suits you. Your astrologer will confirm it, or propose a new one.</p>
              <button onClick={() => setShowSchedule(true)} className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 transition-all">
                Choose date & time
              </button>
            </div>
          )}

          {/* Full chat with the astrologer (free for 2 days from booking). Opens the
              dedicated chat app where they discuss and schedule the Live Puja. */}
          <button
            onClick={() => order.chatThreadId && router.push(`/pooja/chat/${order.chatThreadId}`)}
            disabled={!order.chatThreadId}
            className="mt-3 w-full py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white shadow-[0_4px_15px_rgba(255,106,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <MessageCircle className="w-4 h-4" /> Chat with your astrologer
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">Free chat for 2 days — discuss and schedule your Live Puja here.</p>
        </div>

        {/* Payment details + invoice */}
        <div className="mt-4 bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] p-5">
          <h2 className="text-sm font-bold text-[#4A3B32] mb-3">Payment details</h2>
          <div className="space-y-2 text-sm">
            <DetailRow label="Subtotal" value={formatINR(order.subtotal)} />
            {order.discount > 0 && (
              <DetailRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`- ${formatINR(order.discount)}`} green />
            )}
            <DetailRow label={`GST (${((order.gstRate ?? 0.18) * 100).toFixed(0)}%)`} value={formatINR(order.gstAmount)} />
            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
              <span className="font-bold text-[#4A3B32]">Total Paid</span>
              <span className="font-bold text-[#FF8C00] text-lg">{formatINR(order.totalPayable)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-gray-400">Payment method</span>
            <span className="text-right font-semibold text-[#4A3B32]">Sobhagya Wallet</span>
            <span className="text-gray-400">Status</span>
            <span className="text-right font-semibold text-emerald-600">{order.status === "PAID" || order.status === "IN_PROGRESS" || order.status === "COMPLETED" ? "Paid" : order.status.replace(/_/g, " ")}</span>
            <span className="text-gray-400">Paid on</span>
            <span className="text-right font-semibold text-[#4A3B32]">{fmt(order.fulfilledAt || order.createdAt)}</span>
            <span className="text-gray-400">Order ID</span>
            <span className="text-right font-semibold text-[#4A3B32]">#{order._id.slice(-8).toUpperCase()}</span>
          </div>

          <button
            onClick={() => router.push(`/pooja/orders/${orderId}/invoice`)}
            className="mt-4 w-full py-2.5 rounded-2xl text-sm font-bold border border-orange-100 text-[#FF8C00] hover:bg-[#FFFAF0] transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Invoice
          </button>
        </div>

        {/* Negotiation timeline */}
        {schedule?.history && schedule.history.length > 0 && (
          <div className="mt-4 bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] p-5">
            <h2 className="text-sm font-bold text-[#4A3B32] mb-3">Schedule activity</h2>
            <div className="space-y-3">
              {schedule.history.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${h.by === "astrologer" ? "bg-sky-400" : "bg-[#FF8C00]"}`} />
                    {i < schedule.history!.length - 1 && <span className="w-px flex-1 bg-orange-100 my-1" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-xs font-semibold text-[#4A3B32] capitalize">{h.by === "astrologer" ? "Astrologer" : "You"} · {h.note}</p>
                    {h.at ? <p className="text-[11px] text-gray-400">{fmt(h.at)}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => router.push("/pooja/orders")} className="mt-4 w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-[#FF8C00] transition-colors">
          View all my orders
        </button>
      </div>

      <SchedulePujaLiveModal isOpen={showSchedule} onClose={() => setShowSchedule(false)} onSchedule={handleSchedule} bookingDate={order.fulfilledAt || order.createdAt} />

      {showFeedback && (
        <PoojaFeedbackModal
          orderId={orderId}
          initialRating={order.feedback?.rating || 0}
          initialComment={order.feedback?.comment || ""}
          onClose={() => setShowFeedback(false)}
          onSubmitted={(rating, comment) =>
            setOrder((prev) => (prev ? { ...prev, feedback: { ...(prev.feedback || {}), rating, comment } } : prev))
          }
        />
      )}
    </div>
  );
}

function DetailRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={green ? "text-green-600 font-medium" : "text-gray-700 font-medium"}>{value}</span>
    </div>
  );
}
