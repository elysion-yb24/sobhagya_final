'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import { useLiveSocket, LiveSession } from '../hooks/useLiveSocket';
import { isAuthenticated } from '../utils/auth-utils';
import {
  Users,
  Heart,
  RefreshCw,
  Eye,
  Radio,
  WifiOff,
  Sparkles,
  Play,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  Mandala,
  StarDust,
} from '../services/_components/Ornaments';

/* ==================================================================== */
/*  Live Sessions — Cosmic Edition                                      */
/* ==================================================================== */
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

  const activeCount = sessions.length;

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 70% 0%, #2a1304 0%, #150802 60%, #080301 100%)',
      }}
    >
      {/* ============ COSMIC BACKDROP LAYERS ============ */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-[0.05] flex items-center justify-center pointer-events-none"
      >
        <Mandala className="text-amber-400 animate-rotate-slow" size={1200} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 40% at 30% 20%, rgba(247,148,29,0.14), transparent 70%), radial-gradient(50% 40% at 80% 60%, rgba(255,210,140,0.08), transparent 70%)',
        }}
      />
      <CosmicStars />

      {/* ============ HERO ============ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="text-center lg:text-left">
            {/* Status chip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,212,140,0.14), rgba(247,148,29,0.14))',
                border: '1px solid rgba(255,212,140,0.4)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase"
                style={{ color: '#FFE7B5' }}
              >
                Live Now
              </span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-tight leading-[1.05]"
              style={{
                fontFamily: "'EB Garamond', serif",
                backgroundImage:
                  'linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 45%, #F7B23A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(247,148,29,0.25)',
              }}
            >
              Live Sessions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-3 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed"
              style={{
                fontFamily: 'Poppins',
                color: 'rgba(255,240,210,0.78)',
              }}
            >
              Connect with spiritual guides streaming live — birth chart, marriage match, vastu and more, in real-time.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-5 inline-flex flex-wrap items-center gap-3 justify-center lg:justify-start"
            >
              <StatPill
                label={`${activeCount} ${activeCount === 1 ? 'astrologer' : 'astrologers'} live`}
                pulse
              />
              {!isConnected ? (
                <StatPill
                  label="Reconnecting"
                  icon={<WifiOff className="w-3 h-3" />}
                  tone="danger"
                />
              ) : (
                <StatPill label="Connected" tone="success" />
              )}
            </motion.div>
          </div>

          {/* Right side: refresh button + cosmic orb decoration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex items-center gap-3 justify-center lg:justify-end"
          >
            <RefreshButton
              onClick={handleRefresh}
              disabled={refreshing || loading}
              spinning={refreshing}
            />
          </motion.div>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <AnimatePresence mode="wait">
          {loading ? (
            <CosmicLoader key="loader" />
          ) : sessions.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Stories strip — top broadcasters */}
              <StoriesStrip sessions={sessions} onJoin={handleJoinSession} />

              {/* Featured + Grid */}
              {sessions.length > 0 && (
                <FeaturedHero
                  session={sessions[0]}
                  onJoin={() => handleJoinSession(sessions[0].sessionId)}
                />
              )}

              {sessions.length > 1 && (
                <>
                  <div className="flex items-center gap-3 mt-12 mb-5">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/30 to-amber-300/30" />
                    <span
                      className="text-[11px] font-semibold tracking-[0.28em] uppercase"
                      style={{ color: '#FFD58A' }}
                    >
                      All Live Sessions
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300/30 to-amber-300/30" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    {sessions.slice(1).map((session, idx) => (
                      <SessionCard
                        key={session.sessionId}
                        session={session}
                        index={idx}
                        onJoin={() => handleJoinSession(session.sessionId)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

/* ==================================================================== */
/*  Sub-components                                                       */
/* ==================================================================== */

/** Stat pill shown in hero. */
function StatPill({
  label,
  icon,
  pulse,
  tone = 'default',
}: {
  label: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  tone?: 'default' | 'success' | 'danger';
}) {
  const palette =
    tone === 'success'
      ? { dot: '#34D399', text: '#FFE7B5', border: 'rgba(255,212,140,0.35)' }
      : tone === 'danger'
        ? { dot: '#F87171', text: '#FCA5A5', border: 'rgba(248,113,113,0.35)' }
        : { dot: '#FFD58A', text: '#FFE7B5', border: 'rgba(255,212,140,0.35)' };

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md"
      style={{
        background: 'rgba(255,212,140,0.06)',
        border: `1px solid ${palette.border}`,
        color: palette.text,
        fontFamily: 'Poppins',
      }}
    >
      {icon ? (
        icon
      ) : (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping"
              style={{ background: palette.dot }}
            />
          )}
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ background: palette.dot }}
          />
        </span>
      )}
      {label}
    </span>
  );
}

/** Cosmic refresh button with rotating shimmer. */
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
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full overflow-hidden font-semibold text-sm disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #F7941D 0%, #E8850B 100%)',
        boxShadow:
          '0 14px 28px -10px rgba(247,148,29,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
        color: '#fff',
        fontFamily: 'Poppins',
      }}
    >
      <RefreshCw
        className={`w-3.5 h-3.5 relative z-10 ${spinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}
      />
      <span className="relative z-10">Refresh</span>
      {/* shimmer */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </motion.button>
  );
}

/** Faint twinkling stars across the whole page. */
function CosmicStars() {
  const stars = Array.from({ length: 60 });
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {stars.map((_, i) => {
        const x = (i * 17.3) % 100;
        const y = (i * 23.7) % 100;
        const size = 1 + ((i * 3) % 3) * 0.6;
        const dur = 4 + ((i * 1.7) % 5);
        const delay = (i * 0.4) % 5;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background:
                'radial-gradient(circle, rgba(255,225,160,0.95), rgba(247,148,29,0))',
              filter: 'blur(0.4px)',
            }}
            animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.9, 1.2, 0.9] }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────  Stories strip  ───────────────── */
function StoriesStrip({
  sessions,
  onJoin,
}: {
  sessions: LiveSession[];
  onJoin: (id: string) => void;
}) {
  if (sessions.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-hide">
        {sessions.slice(0, 12).map((session, idx) => (
          <StoryAvatar
            key={session.sessionId}
            session={session}
            index={idx}
            onClick={() => onJoin(session.sessionId)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function StoryAvatar({
  session,
  index,
  onClick,
}: {
  session: LiveSession;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center gap-2 flex-shrink-0"
    >
      <div className="relative">
        {/* Outer ping ripples */}
        <span className="absolute inset-0 rounded-full" style={{ animation: 'live-ripple 2.5s ease-out infinite', boxShadow: '0 0 0 0 rgba(247,148,29,0.5)' }} />
        {/* Rotating conic gold ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-[80px] h-[80px] rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #F7941D, #FFD58A, #B86A0B, #FFD58A, #F7941D)',
            padding: 3,
          }}
        >
          <div
            className="w-full h-full rounded-full p-[2px]"
            style={{
              background:
                'radial-gradient(circle, #2a1304 0%, #0e0501 100%)',
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1a0d04]">
              {session.broadcasterProfilePicture ? (
                <img
                  src={session.broadcasterProfilePicture}
                  alt={session.broadcasterName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-700">
                  <span className="text-white font-bold text-xl">
                    {session.broadcasterName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* LIVE badge */}
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-white text-[9px] font-bold uppercase tracking-[0.12em] rounded-md shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            boxShadow: '0 4px 10px -2px rgba(239,68,68,0.55)',
          }}
        >
          LIVE
        </span>
      </div>
      <span
        className="text-[11px] font-semibold max-w-[80px] truncate"
        style={{ color: '#FFE7B5', fontFamily: 'Poppins' }}
      >
        {session.broadcasterName?.split(' ')[0] || 'Live'}
      </span>

      <style jsx>{`
        @keyframes live-ripple {
          0% { box-shadow: 0 0 0 0 rgba(247,148,29,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(247,148,29,0); }
          100% { box-shadow: 0 0 0 0 rgba(247,148,29,0); }
        }
      `}</style>
    </motion.button>
  );
}

/* ─────────────────  Featured hero  ───────────────── */
function FeaturedHero({
  session,
  onJoin,
}: {
  session: LiveSession;
  onJoin: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [3, -3]), {
    stiffness: 220,
    damping: 18,
  });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-3, 3]), {
    stiffness: 220,
    damping: 18,
  });
  const sx = useTransform(px, [-0.5, 0.5], ['20%', '80%']);
  const sy = useTransform(py, [-0.5, 0.5], ['20%', '80%']);
  const spotlight = useMotionTemplate`radial-gradient(500px circle at ${sx} ${sy}, rgba(255,210,140,0.20), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    setHovered(false);
  };

  const timeSinceStart = session.createdAt
    ? getTimeSince(typeof session.createdAt === 'string' ? new Date(session.createdAt).getTime() : Number(session.createdAt))
    : '';

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onLeave}
      onClick={onJoin}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: 'preserve-3d',
        perspective: 1200,
      }}
      className="group relative cursor-pointer"
    >
      {/* Static gilt frame */}
      <div
        className="relative rounded-2xl p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_36px_64px_-26px_rgba(247,148,29,0.55)]"
        style={{
          background:
            'linear-gradient(135deg, #F7941D 0%, #FFD58A 30%, #B86A0B 55%, #FFD58A 80%, #F7941D 100%)',
        }}
      >
        <div
          className="relative rounded-[14px] overflow-hidden grid grid-cols-1 md:grid-cols-[1.4fr_1fr]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, #361a06 0%, #190a02 60%, #0b0501 100%)',
          }}
        >
          {/* LEFT — video preview */}
          <div className="relative aspect-video md:aspect-auto md:h-full bg-black overflow-hidden min-h-[240px]">
            {session.broadcasterProfilePicture ? (
              <img
                src={session.broadcasterProfilePicture}
                alt={session.broadcasterName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-950">
                <span className="text-7xl font-bold text-amber-200/60">
                  {session.broadcasterName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Cinematic gradient overlay */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 35%, rgba(11,5,1,0.60) 100%), linear-gradient(90deg, rgba(0,0,0,0.40), transparent 40%)',
              }}
            />

            {/* Cursor spotlight */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: spotlight, opacity: hovered ? 1 : 0, transition: 'opacity 0.4s' }}
            />

            {/* LIVE badge (top-left) */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 text-white text-[10px] font-bold uppercase tracking-[0.18em] rounded-md"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  boxShadow: '0 6px 18px -4px rgba(239,68,68,0.55)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE
              </span>
              {timeSinceStart && (
                <span className="text-white/90 text-[10px] bg-black/55 backdrop-blur-md rounded px-2 py-0.5 font-medium">
                  {timeSinceStart}
                </span>
              )}
            </div>

            {/* Viewer count (top-right) */}
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md rounded-full px-3 py-1">
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white text-xs font-semibold">
                {session.viewers || 0}
              </span>
            </div>

            {/* Active call badge */}
            {session.activeCall && Object.keys(session.activeCall || {}).length > 0 && (
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                <PhoneCall className="w-3 h-3 text-white" />
                <span className="text-white text-[10px] font-bold tracking-wider uppercase">
                  On Call
                </span>
              </div>
            )}

            {/* Play button on hover */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  scale: hovered ? 1 : 0.85,
                  opacity: hovered ? 1 : 0.5,
                }}
                transition={{ duration: 0.4 }}
                className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,246,218,0.95), rgba(242,194,106,0.85))',
                  border: '1.5px solid #F7B23A',
                  boxShadow:
                    '0 10px 30px -8px rgba(247,148,29,0.6), inset 0 1px 2px rgba(255,255,255,0.8)',
                }}
              >
                <Play
                  className="w-7 h-7 ml-1 text-amber-900"
                  fill="currentColor"
                />
              </motion.div>
            </div>
          </div>

          {/* RIGHT — info panel */}
          <div className="relative p-6 sm:p-7 flex flex-col justify-between">
            <StarDust count={10} opacity={0.4} seed={1} />

            <div className="relative">
              <span
                className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,212,140,0.16), rgba(247,148,29,0.16))',
                  border: '1px solid rgba(255,212,140,0.4)',
                  color: '#FFD58A',
                }}
              >
                <Sparkles className="w-3 h-3" />
                Featured
              </span>

              <h2
                className="text-2xl sm:text-3xl font-bold leading-tight"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  backgroundImage:
                    'linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 50%, #F7B23A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {session.broadcasterName || 'Astrologer'}
              </h2>

              <p
                className="mt-2 text-sm leading-relaxed"
                style={{
                  fontFamily: 'Poppins',
                  color: 'rgba(255,240,210,0.75)',
                }}
              >
                Streaming live now — join to ask questions, get instant guidance, and connect spiritually.
              </p>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <MiniStat
                  icon={<Users className="w-3 h-3" />}
                  value={session.viewers || 0}
                  label="watching"
                />
                <MiniStat
                  icon={<Heart className="w-3 h-3 fill-red-400 text-red-400" />}
                  value={session.likes || 0}
                  label="likes"
                />
              </div>

              {/* Rate pills */}
              {(session.privateAudioRpm || session.publicAudioRpm) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {session.publicAudioRpm ? (
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide"
                      style={{
                        background: 'rgba(247,148,29,0.12)',
                        border: '1px solid rgba(247,148,29,0.3)',
                        color: '#FFD58A',
                      }}
                    >
                      Public ₹{session.publicAudioRpm}/min
                    </span>
                  ) : null}
                  {session.privateAudioRpm ? (
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide"
                      style={{
                        background: 'rgba(168,85,247,0.14)',
                        border: '1px solid rgba(168,85,247,0.35)',
                        color: '#E9D5FF',
                      }}
                    >
                      Private ₹{session.privateAudioRpm}/min
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative mt-6"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                className="group/btn relative w-full overflow-hidden rounded-xl py-3 px-5 font-semibold text-white inline-flex items-center justify-center gap-2"
                style={{
                  background:
                    'linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #E8850B 100%)',
                  boxShadow:
                    '0 14px 28px -10px rgba(247,148,29,0.65), inset 0 1px 0 rgba(255,255,255,0.35)',
                  border: '1px solid rgba(255,213,138,0.55)',
                  fontFamily: 'Poppins',
                }}
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Join Live Session
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background: 'rgba(255,212,140,0.06)',
        border: '1px solid rgba(255,212,140,0.20)',
        color: '#FFE7B5',
        fontFamily: 'Poppins',
      }}
    >
      {icon}
      <span>{value.toLocaleString()}</span>
      <span style={{ color: 'rgba(255,231,181,0.55)' }}>{label}</span>
    </span>
  );
}

/* ─────────────────  Grid card  ───────────────── */
function SessionCard({
  session,
  index,
  onJoin,
}: {
  session: LiveSession;
  index: number;
  onJoin: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), {
    stiffness: 220,
    damping: 18,
  });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-4, 4]), {
    stiffness: 220,
    damping: 18,
  });
  const sx = useTransform(px, [-0.5, 0.5], ['20%', '80%']);
  const sy = useTransform(py, [-0.5, 0.5], ['20%', '80%']);
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${sx} ${sy}, rgba(255,210,140,0.22), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    setHovered(false);
  };

  const timeSinceStart = session.createdAt
    ? getTimeSince(typeof session.createdAt === 'string' ? new Date(session.createdAt).getTime() : Number(session.createdAt))
    : '';
  const hasActiveCall =
    session.activeCall &&
    typeof session.activeCall === 'object' &&
    Object.keys(session.activeCall).length > 0;

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onLeave}
      onClick={onJoin}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: 'preserve-3d',
        perspective: 900,
      }}
      className="group relative cursor-pointer"
    >
      {/* Static gilt frame */}
      <div
        className="relative rounded-2xl p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_24px_46px_-22px_rgba(247,148,29,0.50)]"
        style={{
          background:
            'linear-gradient(135deg, #F7941D 0%, #FFD58A 30%, #B86A0B 55%, #FFD58A 80%, #F7941D 100%)',
        }}
      >
        <div
          className="relative rounded-[14px] overflow-hidden flex flex-col"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, #2e1605 0%, #170902 65%, #0a0401 100%)',
          }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-black overflow-hidden">
            {session.broadcasterProfilePicture ? (
              <img
                src={session.broadcasterProfilePicture}
                alt={session.broadcasterName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-950">
                <span className="text-6xl font-bold text-amber-200/60">
                  {session.broadcasterName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}

            {/* gradient overlay */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.50) 0%, transparent 30%, rgba(11,5,1,0.55) 100%)',
              }}
            />

            {/* spotlight */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: spotlight, opacity: hovered ? 1 : 0, transition: 'opacity 0.35s' }}
            />

            {/* LIVE badge + time */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-white text-[10px] font-bold uppercase tracking-[0.16em] rounded-md"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  boxShadow: '0 4px 10px -2px rgba(239,68,68,0.55)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE
              </span>
              {timeSinceStart && (
                <span className="text-white/90 text-[10px] bg-black/55 backdrop-blur-md rounded px-1.5 py-0.5 font-medium">
                  {timeSinceStart}
                </span>
              )}
            </div>

            {/* Viewer count */}
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/55 backdrop-blur-md rounded-full px-2 py-0.5">
              <Eye className="w-3 h-3 text-amber-300" />
              <span className="text-white text-[11px] font-semibold">
                {session.viewers || 0}
              </span>
            </div>

            {/* Active call badge */}
            {hasActiveCall && (
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md rounded-full px-2 py-0.5 shadow-lg">
                <PhoneCall className="w-2.5 h-2.5 text-white" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider">
                  On Call
                </span>
              </div>
            )}

            {/* Play overlay */}
            <motion.div
              animate={{
                scale: hovered ? 1 : 0.7,
                opacity: hovered ? 1 : 0,
              }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,246,218,0.95), rgba(242,194,106,0.85))',
                  border: '1.5px solid #F7B23A',
                  boxShadow:
                    '0 8px 24px -6px rgba(247,148,29,0.6), inset 0 1px 2px rgba(255,255,255,0.8)',
                }}
              >
                <Play
                  className="w-5 h-5 ml-0.5 text-amber-900"
                  fill="currentColor"
                />
              </div>
            </motion.div>
          </div>

          {/* Info */}
          <div className="relative p-4 flex gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden p-[1.5px]"
              style={{
                background:
                  'linear-gradient(135deg, #F7941D, #FFD58A, #B86A0B)',
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#1a0d04]">
                {session.broadcasterProfilePicture ? (
                  <img
                    src={session.broadcasterProfilePicture}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-700">
                    <span className="text-white font-bold text-xs">
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
                  backgroundImage:
                    'linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 50%, #F7B23A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {session.broadcasterName}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: 'rgba(255,212,140,0.08)',
                    border: '1px solid rgba(255,212,140,0.18)',
                    color: '#FFE7B5',
                  }}
                >
                  <Users className="w-2.5 h-2.5" />
                  {session.viewers || 0}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: 'rgba(248,113,113,0.10)',
                    border: '1px solid rgba(248,113,113,0.25)',
                    color: '#FCA5A5',
                  }}
                >
                  <Heart className="w-2.5 h-2.5 fill-red-400" />
                  {session.likes || 0}
                </span>
              </div>

              {(session.privateAudioRpm || session.publicAudioRpm) && (
                <div className="flex items-center gap-1.5 mt-2">
                  {session.publicAudioRpm ? (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide"
                      style={{
                        background: 'rgba(247,148,29,0.10)',
                        border: '1px solid rgba(247,148,29,0.25)',
                        color: '#FFD58A',
                      }}
                    >
                      Pub ₹{session.publicAudioRpm}/min
                    </span>
                  ) : null}
                  {session.privateAudioRpm ? (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide"
                      style={{
                        background: 'rgba(168,85,247,0.12)',
                        border: '1px solid rgba(168,85,247,0.30)',
                        color: '#E9D5FF',
                      }}
                    >
                      Pvt ₹{session.privateAudioRpm}/min
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────  Loader  ───────────────── */
function CosmicLoader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-32"
    >
      <div className="relative w-24 h-24">
        {/* outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent, #F7941D, #FFD58A, transparent)',
            padding: 2,
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
        {/* inner dashed ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border-2 border-dashed border-amber-300/30"
        />
        {/* core orb */}
        <div
          className="absolute inset-7 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, #FFF6DA 0%, #F2C26A 60%, #B07514 100%)',
            boxShadow:
              '0 0 30px rgba(247,148,29,0.6), inset 0 2px 4px rgba(255,255,255,0.7)',
          }}
        />
      </div>
      <p
        className="mt-6 text-sm font-medium tracking-wide"
        style={{ color: 'rgba(255,231,181,0.75)', fontFamily: 'Poppins' }}
      >
        Tuning into the cosmic stream…
      </p>
    </motion.div>
  );
}

/* ─────────────────  Empty state  ───────────────── */
function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 sm:py-28 text-center"
    >
      {/* Floating cosmic orb */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-8">
        {/* halo */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(247,148,29,0.55), transparent 70%)',
          }}
        />
        {/* mandala */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Mandala className="text-amber-300" size={180} opacity={0.25} />
        </motion.div>
        {/* dashed orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 rounded-full border-2 border-dashed border-amber-300/30"
        />
        {/* core orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, #FFF6DA 0%, #F2C26A 60%, #B07514 100%)',
              boxShadow:
                '0 0 40px rgba(247,148,29,0.6), inset 0 3px 6px rgba(255,255,255,0.7), inset 0 -5px 12px rgba(120,60,0,0.4)',
              border: '1.5px solid #F7B23A',
            }}
          >
            <Radio className="w-10 h-10 text-amber-900" />
          </div>
        </div>
      </div>

      <h3
        className="text-2xl sm:text-3xl font-bold mb-3"
        style={{
          fontFamily: "'EB Garamond', serif",
          backgroundImage:
            'linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 50%, #F7B23A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Peaceful silence at the moment
      </h3>
      <p
        className="text-sm max-w-md leading-relaxed mb-8"
        style={{
          fontFamily: 'Poppins',
          color: 'rgba(255,240,210,0.72)',
        }}
      >
        Our spiritual guides go live regularly. Check back soon, or connect with an astrologer right now.
      </p>

      <Link
        href="/call-with-astrologer"
        className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-semibold text-white text-sm"
        style={{
          background:
            'linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #E8850B 100%)',
          boxShadow:
            '0 14px 28px -10px rgba(247,148,29,0.65), inset 0 1px 0 rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,213,138,0.55)',
          fontFamily: 'Poppins',
        }}
      >
        <PhoneCall className="w-4 h-4" />
        Browse Astrologers
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </Link>
    </motion.div>
  );
}

/* ─────────────────  Helpers  ───────────────── */
function getTimeSince(timestamp: number): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return 'Just started';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return '';
}
