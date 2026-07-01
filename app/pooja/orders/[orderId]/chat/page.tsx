"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { isAuthenticated, getUserDetails } from "../../../../utils/auth-utils";
import { fetchOrder, PoojaOrder } from "../../../../utils/pooja-api";
import { usePoojaChat } from "../../../../hooks/usePoojaChat";

type Msg = { _id?: string; sentBy?: string; senderId?: string; message?: string; messageType?: string; createdAt?: string };

export default function PoojaClarifyChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "";
  const userId = String(getUserDetails()?.id || getUserDetails()?._id || "");

  const [order, setOrder] = useState<PoojaOrder | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  const threadId = order?.chatThreadId ? String(order.chatThreadId) : null;
  const sessionId = order?.chatSessionId ? String(order.chatSessionId) : null;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(`/pooja/orders/${orderId}/chat`)}`);
      return;
    }
    (async () => {
      try {
        const o = await fetchOrder(orderId);
        setOrder(o);
        // message history
        if (o.chatThreadId) {
          const res = await fetch(`/api/chat/messages/${o.chatThreadId}?limit=100`, { credentials: "include" });
          const json = await res.json().catch(() => ({}));
          const list: Msg[] = json?.data?.messages || json?.data || [];
          setMessages(Array.isArray(list) ? list : []);
        }
      } catch {
        /* surface nothing fatal */
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, router]);

  // 1s tick for the countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // auto-expire when the window passes
  useEffect(() => {
    if (expiresAt && new Date(expiresAt).getTime() <= now) setEnded(true);
  }, [expiresAt, now]);

  // autoscroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const { sendMessage } = usePoojaChat({
    threadId,
    sessionId,
    onJoined: (session) => {
      if (session?.clarify?.expiresAt) setExpiresAt(session.clarify.expiresAt);
    },
    handlers: {
      receive_message: (m: Msg) => setMessages((prev) => [...prev, m]),
      clarify_window: (p: any) => p?.expiresAt && setExpiresAt(p.expiresAt),
      clarify_window_ended: () => setEnded(true),
    },
  });

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || ended || sending) return;
    setSending(true);
    setInput("");
    const optimistic: Msg = { _id: `tmp-${Date.now()}`, sentBy: userId, message: text, messageType: "text", createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const resp = await sendMessage(text);
      if (resp?.success) {
        if (resp.clarifyExpiresAt) setExpiresAt(resp.clarifyExpiresAt);
      } else if (resp?.code === "CLARIFY_ENDED") {
        setEnded(true);
      }
    } finally {
      setSending(false);
    }
  }, [input, ended, sending, sendMessage, userId]);

  const remainingMs = expiresAt ? new Date(expiresAt).getTime() - now : null;
  const mm = remainingMs != null ? Math.max(0, Math.floor(remainingMs / 60000)) : 5;
  const ss = remainingMs != null ? Math.max(0, Math.floor((remainingMs % 60000) / 1000)) : 0;
  const countdownLabel = remainingMs == null ? "5:00" : `${mm}:${String(ss).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
      {/* Header with countdown */}
      <div className="shrink-0 bg-white border-b border-orange-50 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.push(`/pooja/orders/${orderId}`)} aria-label="Back" className="text-gray-500 hover:text-[#FF8C00]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#4A3B32] truncate">{order?.lineItems?.[0]?.providerName || "Your astrologer"}</p>
          <p className="text-[11px] text-gray-400">Clarify scheduling — 5-minute window</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${ended ? "bg-gray-100 text-gray-400" : remainingMs != null && remainingMs < 60000 ? "bg-red-50 text-red-600" : "bg-[#FFF3E0] text-[#FF8C00]"}`}>
          <Clock className="w-4 h-4" /> {ended ? "0:00" : countdownLabel}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#FF8C00] animate-spin" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Say hello 🙏 — use this quick window to finalize timing with your astrologer.</p>
        ) : (
          messages.map((m, i) => {
            const mine = String(m.sentBy || m.senderId) === userId;
            return (
              <div key={m._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  mine ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white rounded-br-md" : "bg-white border border-orange-50 text-[#4A3B32] rounded-bl-md"
                }`}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input / ended state */}
      {ended ? (
        <div className="shrink-0 bg-white border-t border-orange-50 px-4 py-4 text-center">
          <p className="text-sm font-semibold text-gray-500">Chat Session Ended</p>
          <p className="text-xs text-gray-400 mt-0.5">The 5-minute clarify window is over. Manage your schedule from your booking.</p>
          <button onClick={() => router.push(`/pooja/orders/${orderId}`)} className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white text-sm font-bold shadow-[0_4px_15px_rgba(255,106,0,0.3)]">
            Back to booking
          </button>
        </div>
      ) : (
        <div className="shrink-0 bg-white border-t border-orange-50 px-3 py-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Type a message…"
            className="flex-1 bg-[#FFFAF0] border border-orange-100 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#FF8C00] transition-colors"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(255,106,0,0.3)] disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
