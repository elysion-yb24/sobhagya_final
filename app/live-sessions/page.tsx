"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Heart,
  RefreshCw,
  Eye,
  Radio,
  WifiOff,
  Play,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useLiveSocket, LiveSession } from "../hooks/useLiveSocket";
import { isAuthenticated } from "../utils/auth-utils";

/* -------------------------------------------------------------------------- */
/*  Live Sessions — clean, simple, focused                                     */
/* -------------------------------------------------------------------------- */

export default function LiveSessionsPage() {
  const router = useRouter();
  const { isConnected, getSessions } = useLiveSocket();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getSessions(undefined, 50);
      setSessions(data);
    } catch (err) {
      console.error("[LiveSessions] Error fetching sessions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getSessions]);

  useEffect(() => {
    if (isConnected) {
      fetchSessions();
      const id = setInterval(fetchSessions, 15000);
      return () => clearInterval(id);
    }
  }, [isConnected, fetchSessions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleJoinSession = (sessionId: string) => {
    if (!isAuthenticated()) {
      localStorage.setItem("redirectAfterLogin", `/live-sessions/${sessionId}`);
      router.push("/login");
      return;
    }
    router.push(`/live-sessions/${sessionId}`);
  };

  const activeCount = sessions.length;

  return (
    <main className="bg-[#FFFDF9] min-h-screen">
      {/* HERO */}
      <section className="border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-red-700">
              Live Now
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{
              fontFamily: "'EB Garamond', serif",
              color: "#5a3a07",
            }}
          >
            Live Sessions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed"
            style={{ color: "#6b5230", fontFamily: "Poppins" }}
          >
            Connect with spiritual guides streaming live — birth chart,
            marriage match, vastu and more, in real-time.
          </motion.p>

          {/* Status row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-2.5"
          >
            <StatusPill
              text={`${activeCount} ${
                activeCount === 1 ? "astrologer" : "astrologers"
              } live`}
              tone="warning"
            />
            {isConnected ? (
              <StatusPill text="Connected" tone="success" />
            ) : (
              <StatusPill
                text="Reconnecting"
                tone="error"
                icon={<WifiOff className="w-3 h-3" />}
              />
            )}
            <RefreshButton
              onClick={handleRefresh}
              disabled={refreshing || loading}
              spinning={refreshing}
            />
          </motion.div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          {loading ? (
            <Loader key="loader" />
          ) : sessions.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-baseline justify-between mb-6">
                <h2
                  className="text-2xl sm:text-3xl font-bold"
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    color: "#5a3a07",
                  }}
                >
                  All Live Sessions
                </h2>
                <span
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: "#9a6b18" }}
                >
                  {activeCount} streaming
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {sessions.map((session, idx) => (
                  <SessionCard
                    key={session.sessionId}
                    session={session}
                    index={idx}
                    onJoin={() => handleJoinSession(session.sessionId)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  STATUS PILL                                                                */
/* -------------------------------------------------------------------------- */

function StatusPill({
  text,
  tone = "default",
  icon,
}: {
  text: string;
  tone?: "default" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}) {
  const palette =
    tone === "success"
      ? { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" }
      : tone === "error"
      ? { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" }
      : tone === "warning"
      ? { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500" }
      : { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-500" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${palette.bg} ${palette.border} ${palette.text}`}
      style={{ fontFamily: "Poppins" }}
    >
      {icon ? icon : <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />}
      {text}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  REFRESH BUTTON                                                             */
/* -------------------------------------------------------------------------- */

function RefreshButton({
  onClick,
  disabled,
  spinning,
}: {
  onClick: () => void;
  disabled: boolean;
  spinning: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F7941D] hover:bg-[#E8850B] text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: "Poppins" }}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  SESSION CARD — clean, minimal                                              */
/* -------------------------------------------------------------------------- */

function SessionCard({
  session,
  index,
  onJoin,
}: {
  session: LiveSession;
  index: number;
  onJoin: () => void;
}) {
  const timeSinceStart = session.createdAt
    ? getTimeSince(
        typeof session.createdAt === "string"
          ? new Date(session.createdAt).getTime()
          : Number(session.createdAt)
      )
    : "";
  const hasActiveCall =
    session.activeCall &&
    typeof session.activeCall === "object" &&
    Object.keys(session.activeCall).length > 0;

  return (
    <motion.button
      onClick={onJoin}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -3 }}
      className="group text-left bg-white rounded-2xl border border-amber-100 overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
        {session.broadcasterProfilePicture ? (
          <img
            src={session.broadcasterProfilePicture}
            alt={session.broadcasterName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-6xl font-bold text-amber-800/50"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {session.broadcasterName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Live
          </span>
          {timeSinceStart && (
            <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded">
              {timeSinceStart}
            </span>
          )}
        </div>

        {/* Viewer count */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded">
          <Eye className="w-3 h-3 text-white" />
          <span className="text-white text-[11px] font-bold">
            {session.viewers || 0}
          </span>
        </div>

        {/* On Call badge */}
        {hasActiveCall && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            <PhoneCall className="w-2.5 h-2.5" />
            On Call
          </div>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 ml-0.5 text-amber-700" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-600 p-[2px]">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            {session.broadcasterProfilePicture ? (
              <img
                src={session.broadcasterProfilePicture}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-amber-100">
                <span className="text-amber-700 font-bold text-sm">
                  {session.broadcasterName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-[15px] truncate"
            style={{
              fontFamily: "'EB Garamond', serif",
              color: "#3e2807",
            }}
          >
            {session.broadcasterName || "Astrologer"}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-600" style={{ fontFamily: "Poppins" }}>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {session.viewers || 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              {session.likes || 0}
            </span>
          </div>

          {(session.privateAudioRpm || session.publicAudioRpm) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {session.publicAudioRpm ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                  Pub ₹{session.publicAudioRpm}/min
                </span>
              ) : null}
              {session.privateAudioRpm ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 border border-purple-200 text-purple-800">
                  Pvt ₹{session.privateAudioRpm}/min
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  LOADER                                                                     */
/* -------------------------------------------------------------------------- */

function Loader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      <p
        className="mt-4 text-sm font-medium"
        style={{ color: "#9a6b18", fontFamily: "Poppins" }}
      >
        Loading live sessions…
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center py-16 sm:py-20"
    >
      <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
        <Radio className="w-7 h-7 text-amber-500" />
      </div>
      <h3
        className="text-xl sm:text-2xl font-bold mb-2"
        style={{
          fontFamily: "'EB Garamond', serif",
          color: "#5a3a07",
        }}
      >
        No live sessions right now
      </h3>
      <p
        className="text-sm max-w-sm mb-6"
        style={{ color: "#6b5230", fontFamily: "Poppins" }}
      >
        Our astrologers go live throughout the day. Check back soon, or connect
        with one directly.
      </p>
      <Link
        href="/call-with-astrologer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F7941D] hover:bg-[#E8850B] text-white text-sm font-semibold transition-colors"
        style={{ fontFamily: "Poppins" }}
      >
        <PhoneCall className="w-4 h-4" />
        Browse Astrologers
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function getTimeSince(timestamp: number): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return "Just started";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return "";
}
