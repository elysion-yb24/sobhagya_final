"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { isAuthenticated } from "../../../utils/auth-utils";
import { fetchMessages, sendMessage, RemedyMessage } from "../../../utils/pooja-api";

export default function RemedyChatPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = (params?.threadId as string) || "";

  const [messages, setMessages] = useState<RemedyMessage[]>([]);
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const load = async () => {
    try {
      const data = await fetchMessages(threadId);
      setMessages(data.messages || []);
      setThread(data.thread);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?next=${encodeURIComponent(`/pooja/chat/${threadId}`)}`);
      return;
    }
    load();
    const interval = setInterval(load, 5000); // poll
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const onSend = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    // optimistic
    const optimistic: RemedyMessage = {
      _id: `tmp-${Date.now()}`,
      threadId,
      senderType: "USER",
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    try {
      await sendMessage(threadId, body);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const statusLabel = thread?.status === "COMPLETED" ? "Remedy completed" : thread?.status === "IN_PROGRESS" ? "Remedy in progress" : "Remedy booked";

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
        <button onClick={() => router.push("/pooja/orders")} className="text-gray-500 hover:text-orange-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-lg">🧘</div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 truncate">{thread?.providerName || "Pandit"}</p>
          <p className="text-xs text-gray-400 truncate">{thread?.productTitle || "Remedy Chat"}</p>
        </div>
      </div>

      {/* status banner */}
      <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-100 text-center">
        <span className="text-xs font-medium text-amber-700">{statusLabel} · your pandit will share updates here</span>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
          </div>
        )}
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        {!loading && messages.length === 0 && !error && (
          <div className="text-center text-gray-400 text-sm py-10">No messages yet. Say hello to your pandit 🙏</div>
        )}

        {messages.map((m) => {
          const mine = m.senderType === "USER";
          const admin = m.senderType === "ADMIN";
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : admin ? "justify-center" : "justify-start"}`}>
              {admin ? (
                <div className="max-w-[85%] bg-amber-50 border border-amber-100 text-amber-800 text-xs px-4 py-2 rounded-xl text-center">
                  {m.body}
                </div>
              ) : (
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    mine
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-md"
                      : "bg-white border border-orange-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {!mine && <p className="text-[10px] font-semibold text-orange-500 mb-0.5">{thread?.providerName || "Pandit"}</p>}
                  {m.body}
                  <div className={`text-[10px] mt-1 text-right ${mine ? "text-orange-100" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="p-3 bg-white border-t border-orange-100 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Type a message…"
            className="flex-1 bg-orange-50 border border-orange-100 rounded-full px-4 py-2.5 text-sm outline-none focus:border-orange-300"
          />
          <button
            onClick={onSend}
            disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center disabled:opacity-50 transition-all shadow-sm"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
