"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useSearchParams } from "next/navigation";

type Role = "user" | "partner";

interface Message {
  id: string;
  text: string;
  sender: string;
  senderRole: Role;
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  type?: "message" | "system" | "join" | "leave";
}

export default function RoomPage() {
  const search = useSearchParams();
  const routeParams = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [astrologerJoined, setAstrologerJoined] = useState(false);
  const [sessionRemaining, setSessionRemaining] = useState<number | null>(null);
  const [sessionMeta, setSessionMeta] = useState<{ start: number; duration: number } | null>(null);
  const [autoMessageSent, setAutoMessageSent] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const roomId = routeParams?.roomId as string | undefined;
  const userId = search?.get("userId") || Math.random().toString(36).slice(2);
  const userName = search?.get("userName") || "Guest";
  const role: Role = (search?.get("role") as Role) || "user";

  const sessionTickRef = useRef<number | undefined>(undefined);

  const startLocalCountdown = useCallback((start: number, durationSeconds: number) => {
    if (sessionTickRef.current) window.clearInterval(sessionTickRef.current);
    const endAt = start + durationSeconds * 1000;
    const tick = () => {
      const remainingMs = endAt - Date.now();
      const remaining = Math.max(0, Math.floor(remainingMs / 1000));
      setSessionRemaining(remaining);
      if (remaining <= 0 && sessionTickRef.current) {
        window.clearInterval(sessionTickRef.current);
        sessionTickRef.current = undefined;
      }
    };
    tick();
    sessionTickRef.current = window.setInterval(tick, 1000);
  }, []);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const newSocket = io({
      path: "/api/socketio",
      transports: ["polling", "websocket"],
      forceNew: true,
    });

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    newSocket.on("room_history", (history: Message[]) => setMessages(history));

    newSocket.on("new_message", (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        return exists ? prev : [...prev, message];
      });
    });

    newSocket.on("message_status_update", (data: { messageId: string; status: "sent" | "delivered" | "read" }) => {
      setMessages((prev) => prev.map((m) => (m.id === data.messageId ? { ...m, status: data.status } : m)));
    });

    newSocket.on("user_joined", (data: { userName: string; role: Role }) => {
      if (data.role === "partner") setAstrologerJoined(true);
    });

    newSocket.on("session_started", (data: { roomId: string; startTime: number; duration: number }) => {
      setSessionMeta({ start: data.startTime, duration: data.duration });
      startLocalCountdown(data.startTime, data.duration);
    });

    setSocket(newSocket);
    return () => {
      if (sessionTickRef.current) window.clearInterval(sessionTickRef.current);
      newSocket.disconnect();
    };
  }, [startLocalCountdown]);

  // Auto-join on connect
  useEffect(() => {
    if (!socket || !connected || !roomId) return;
    socket.emit("join_room", { roomId, userId, userName, role });
    setJoined(true);

    // Ask server to start or share session
    socket.emit("start_session", { roomId, duration: 300 });
    // Also request current session state in case it already exists
    socket.emit("request_session_state", { roomId });
  }, [socket, connected, roomId, userId, userName, role]);

  // Send auto details message once after joining
  useEffect(() => {
    if (!socket || !joined || autoMessageSent) return;
    const hasAutoFlag = search?.get('autoDetails') === '1';
    if (!hasAutoFlag) return;

    // Prefer sessionStorage prepared by launcher; else synthesize from query
    let text = '';
    try { text = sessionStorage.getItem('chatAutoMessage') || ''; } catch {}
    if (!text) {
      const astroName = search?.get('astroName') || 'Astrologer';
      text = `👋 Hi! I'm ${userName}.\n🧑‍⚕️ Astrologer: ${astroName}\n⏰ Joined at: ${new Date().toLocaleString()}`;
    }

    if (text.trim()) {
      const messageId = `${Date.now()}-${Math.random()}`;
      setMessages(prev => ([...prev, {
        id: messageId,
        text,
        sender: userName,
        senderRole: role,
        timestamp: Date.now(),
        status: 'sending',
      }]));
      socket.emit('send_message', { roomId, text, userId, userName, role, messageId });
      setAutoMessageSent(true);
    }
  }, [socket, search, joined, autoMessageSent, roomId, role, userId, userName]);

  const sendMessage = useCallback(() => {
    if (!socket || !joined || !messageInput.trim()) return;
    const text = messageInput.trim();
    const messageId = `${Date.now()}-${Math.random()}`;
    setMessageInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        text,
        sender: userName,
        senderRole: role,
        timestamp: Date.now(),
        status: "sending",
      },
    ]);

    socket.emit("send_message", { roomId, text, userId, userName, role, messageId });
  }, [socket, joined, messageInput, roomId, userId, userName, role]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const headerStatus = useMemo(() => {
    if (!joined) return "Joining...";
    if (!astrologerJoined) return "Astrologer is joining soon";
    return "Connected";
  }, [joined, astrologerJoined]);

  const invitePath = useMemo(() => {
    if (!roomId) return "";
    return `/chat-room/${roomId}?role=partner&userName=Astrologer`;
  }, [roomId]);

  const copyInvite = useCallback(async () => {
    if (!invitePath) return;
    const absoluteLink = typeof window !== "undefined" ? `${window.location.origin}${invitePath}` : invitePath;
    try {
      await navigator.clipboard.writeText(absoluteLink);
      alert("Invite link copied for astrologer");
    } catch {
      // fallback
      const dummy = document.createElement("textarea");
      dummy.value = absoluteLink;
      document.body.appendChild(dummy);
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      alert("Invite link copied for astrologer");
    }
  }, [invitePath]);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading room...</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="bg-white/90 border-b border-orange-200 p-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900">Chat Room: {roomId}</h1>
          <p className="text-sm text-gray-500">{connected ? "Online" : "Offline"} • {headerStatus}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyInvite} className="px-3 py-1.5 text-sm rounded-md border border-orange-300 hover:bg-orange-50">
            Copy astrologer invite
          </button>
          <div className="text-sm font-medium text-amber-700">Session: {formatTime(sessionRemaining)}</div>
        </div>
      </div>

      {/* Waiting banner */}
      {!astrologerJoined && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm">
          Astrologer is joining soon. You can start typing your question.
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderRole === role ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-lg max-w-md ${m.senderRole === role ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : "bg-white border border-amber-200"}`}>
              <p className="text-sm whitespace-pre-line">{m.text}</p>
              <div className="text-[10px] mt-1 opacity-70 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/90 border-t border-orange-200 p-4">
        <div className="flex items-center gap-2">
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={sendMessage}
            disabled={!joined || !messageInput.trim()}
            className="px-5 py-2 rounded-lg bg-orange-600 text-white disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


