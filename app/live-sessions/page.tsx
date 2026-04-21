'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveSocket, LiveSession } from '../hooks/useLiveSocket';
import { isAuthenticated } from '../utils/auth-utils';
import { Users, Heart, RefreshCw, Eye, Radio, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

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
      console.error('[LiveSessions] Error fetching sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getSessions]);

  useEffect(() => {
    if (isConnected) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 15000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchSessions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleJoinSession = (sessionId: string) => {
    if (!isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', `/live-sessions/${sessionId}`);
      router.push('/login');
      return;
    }
    router.push(`/live-sessions/${sessionId}`);
  };

  return (
    <section className="bg-orange-50/30 w-full min-h-screen">
      {/* Top status bar — top offsets match the fixed global header height (see ClientLayout pt values) */}
      <div className="sticky top-[72px] md:top-[80px] lg:top-[96px] z-30 bg-white/85 backdrop-blur-xl border-b border-orange-100 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="w-5 h-5 text-red-500" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-gray-900 font-bold text-xl tracking-tight">Live Sessions</h1>
            </div>
            {!isConnected && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" /> Reconnecting
              </span>
            )}
            {isConnected && !loading && (
              <span className="text-gray-400 text-xs font-medium">
                {sessions.length} sessions active
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all text-xs font-bold shadow-sm disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-5 text-gray-400 text-sm font-medium">Connecting to spiritual realm...</p>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-28 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6 border border-orange-200">
              <Radio className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Peaceful silence at the moment</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
              Our spiritual guides go live regularly to help you. Check back soon or connect with an astrologer directly.
            </p>
            <Link
              href="/call-with-astrologer"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all"
            >
              Browse Astrologers
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Instagram-style scrollable stories row for top sessions */}
            {sessions.length > 0 && (
              <div className="mb-8">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {sessions.slice(0, 10).map((session, idx) => (
                    <motion.button
                      key={session.sessionId}
                      onClick={() => handleJoinSession(session.sessionId)}
                      className="flex flex-col items-center gap-2 flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="relative">
                        {/* Gradient ring (Instagram Live style) */}
                        <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 shadow-md">
                          <div className="w-full h-full rounded-full p-[2px] bg-white">
                            <div className="w-full h-full rounded-full overflow-hidden bg-orange-50">
                              {session.broadcasterProfilePicture ? (
                                <img
                                  src={session.broadcasterProfilePicture}
                                  alt={session.broadcasterName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
                                  <span className="text-white font-bold text-lg">
                                    {session.broadcasterName?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* LIVE badge */}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold uppercase rounded-md tracking-wide">
                          LIVE
                        </span>
                      </div>
                      <span className="text-gray-700 text-[11px] font-semibold max-w-[72px] truncate">
                        {session.broadcasterName?.split(' ')[0]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Live style grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {sessions.map((session, idx) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  index={idx}
                  onJoin={() => handleJoinSession(session.sessionId)}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function SessionCard({ session, index, onJoin }: { session: LiveSession; index: number; onJoin: () => void }) {
  const timeSinceStart = session.createdAt
    ? getTimeSince(typeof session.createdAt === 'string' ? new Date(session.createdAt).getTime() : Number(session.createdAt))
    : '';

  const hasActiveCall = session.activeCall && typeof session.activeCall === 'object' && Object.keys(session.activeCall).length > 0;

  return (
    <motion.div
      onClick={onJoin}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white hover:bg-orange-50 transition-all duration-500 border border-orange-100/60 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-200/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      {/* Thumbnail — 16:9 aspect */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {session.broadcasterProfilePicture ? (
          <img
            src={session.broadcasterProfilePicture}
            alt={session.broadcasterName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <span className="text-6xl font-bold text-orange-200">
              {session.broadcasterName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Top left: LIVE badge + time */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          {timeSinceStart && (
            <span className="text-white/90 text-[10px] bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 font-medium">
              {timeSinceStart}
            </span>
          )}
        </div>

        {/* Top right: Viewer count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
          <Eye className="w-3 h-3 text-white/80" />
          <span className="text-white text-[11px] font-medium">{session.viewers || 0}</span>
        </div>

        {/* Bottom: gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />

        {hasActiveCall && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm rounded px-2 py-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-bold">ON CALL</span>
          </div>
        )}

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-orange-50 ring-2 ring-orange-100 group-hover:ring-orange-200 transition-all">
          {session.broadcasterProfilePicture ? (
            <img
              src={session.broadcasterProfilePicture}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
              <span className="text-white font-bold text-xs">
                {session.broadcasterName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-bold text-base truncate group-hover:text-orange-600 transition-colors">
            {session.broadcasterName}
          </h3>
          <div className="flex items-center gap-3 text-gray-500 text-xs mt-1">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              <Users className="w-3 h-3" />
              {session.viewers || 0}
            </span>
            <span className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full font-medium text-red-500">
              <Heart className="w-3 h-3 fill-red-500" />
              {session.likes || 0}
            </span>
          </div>
          {/* Rate pills */}
          {(session.privateAudioRpm || session.publicAudioRpm) && (
            <div className="flex items-center gap-1.5 mt-2">
              {session.publicAudioRpm && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-semibold">
                  Public ₹{session.publicAudioRpm}/min
                </span>
              )}
              {session.privateAudioRpm && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold">
                  Private ₹{session.privateAudioRpm}/min
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getTimeSince(timestamp: number): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return 'Just started';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return '';
}
