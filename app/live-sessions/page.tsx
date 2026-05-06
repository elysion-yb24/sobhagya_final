'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
  Star,
  Zap,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { Mandala, StarDust } from '../services/_components/Ornaments';

/* ════════════════════════════════════════════════════════════════════ */
/*  Live Sessions — Celestial Portal Edition                            */
/*  Cinematic 3D experience with aurora, particles & holographic cards  */
/* ════════════════════════════════════════════════════════════════════ */
export default function LiveSessionsPage() {
  const router = useRouter();
  const { isConnected, getSessions } = useLiveSocket();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Global mouse position for parallax effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

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

  // Parallax transforms for backdrop layers
  const layer1X = useTransform(mouseX, [-1, 1], [-20, 20]);
  const layer1Y = useTransform(mouseY, [-1, 1], [-20, 20]);
  const layer2X = useTransform(mouseX, [-1, 1], [10, -10]);
  const layer2Y = useTransform(mouseY, [-1, 1], [10, -10]);

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% -20%, #3a1a08 0%, #1a0a02 45%, #050201 100%)',
      }}
    >
      {/* ═══════ AURORA / NEBULA BACKDROP ═══════ */}
      <AuroraBackdrop />

      {/* ═══════ DEEP STARFIELD (3 layers, parallax) ═══════ */}
      <motion.div style={{ x: layer1X, y: layer1Y }} className="absolute inset-0 z-0 pointer-events-none">
        <CosmicStars count={80} sizeMul={1} opacity={0.9} seed={1} />
      </motion.div>
      <motion.div style={{ x: layer2X, y: layer2Y }} className="absolute inset-0 z-0 pointer-events-none">
        <CosmicStars count={40} sizeMul={1.6} opacity={0.7} seed={2} />
      </motion.div>

      {/* Shooting stars */}
      <ShootingStars />

      {/* Slow rotating mandala (very faint) */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-[0.04] flex items-center justify-center pointer-events-none"
      >
        <Mandala className="text-amber-400 animate-rotate-slow" size={1400} />
      </div>

      {/* ═══════ HERO ═══════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 lg:pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            {/* Status chip */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,212,140,0.16), rgba(247,148,29,0.16))',
                border: '1px solid rgba(255,212,140,0.45)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px -8px rgba(247,148,29,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <span className="absolute inset-0 -translate-x-full animate-[shimmerSlide_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase relative"
                style={{ color: '#FFE7B5' }}
              >
                Live · Streaming Now
              </span>
              <Sparkles className="w-3 h-3 text-amber-300 relative" />
            </motion.div>

            {/* Title with letter animation */}
            <AnimatedTitle />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-4 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed"
              style={{
                fontFamily: 'Poppins',
                color: 'rgba(255,240,210,0.82)',
              }}
            >
              Step through a celestial portal. Connect with spiritual guides streaming{' '}
              <span style={{ color: '#FFD58A', fontWeight: 600 }}>live</span> — birth chart,
              marriage match, vastu and more, in real-time.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-6 inline-flex flex-wrap items-center gap-3 justify-center lg:justify-start"
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
              <RefreshButton
                onClick={handleRefresh}
                disabled={refreshing || loading}
                spinning={refreshing}
              />
            </motion.div>
          </div>

          {/* RIGHT: 3D Cosmic Portal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            <CosmicPortal viewers={sessions.reduce((s, v) => s + (v.viewers || 0), 0)} />
          </motion.div>
        </div>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
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
              {/* Stories strip — top broadcasters with constellation lines */}
              <StoriesStrip sessions={sessions} onJoin={handleJoinSession} />

              {/* Featured Crystal Ball Hero */}
              {sessions.length > 0 && (
                <FeaturedHero
                  session={sessions[0]}
                  onJoin={() => handleJoinSession(sessions[0].sessionId)}
                />
              )}

              {sessions.length > 1 && (
                <>
                  <SectionDivider label="All Live Sessions" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
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

      {/* ═══════ GLOBAL ANIMATIONS ═══════ */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes shimmerSlide {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes auroraFlow {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          33% { transform: translate3d(40px, -30px, 0) rotate(5deg); }
          66% { transform: translate3d(-30px, 40px, 0) rotate(-5deg); }
        }
        @keyframes auroraFlow2 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-50px, 30px, 0) rotate(-8deg); }
        }
        @keyframes shoot {
          0% { transform: translate(0,0) rotate(215deg); opacity: 0; }
          5% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translate(-700px, 700px) rotate(215deg); opacity: 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
          to { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
        }
        @keyframes orbitReverse {
          from { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
          to { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
        }
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(247,148,29,0.5), 0 0 80px rgba(247,148,29,0.3); }
          50% { box-shadow: 0 0 70px rgba(247,148,29,0.8), 0 0 140px rgba(247,148,29,0.5); }
        }
        @keyframes hue-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(20deg); }
        }
        @keyframes letter-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(247,148,29,0.4), 0 0 40px rgba(247,148,29,0.2); }
          50% { text-shadow: 0 0 35px rgba(247,148,29,0.7), 0 0 70px rgba(247,148,29,0.4); }
        }
        @keyframes ring-rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes live-ripple {
          0% { box-shadow: 0 0 0 0 rgba(247,148,29,0.55); }
          70% { box-shadow: 0 0 0 16px rgba(247,148,29,0); }
          100% { box-shadow: 0 0 0 0 rgba(247,148,29,0); }
        }
      `}</style>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  AURORA BACKDROP — animated nebula blobs                             */
/* ════════════════════════════════════════════════════════════════════ */
function AuroraBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-1/4 -left-1/4 w-[60rem] h-[60rem] rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, rgba(247,148,29,0.35) 0%, rgba(247,148,29,0) 60%)',
          filter: 'blur(80px)',
          animation: 'auroraFlow 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[55rem] h-[55rem] rounded-full opacity-35"
        style={{
          background:
            'radial-gradient(circle, rgba(168,85,247,0.28) 0%, rgba(168,85,247,0) 60%)',
          filter: 'blur(90px)',
          animation: 'auroraFlow2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[45rem] h-[45rem] rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(255,180,71,0.25) 0%, rgba(255,180,71,0) 60%)',
          filter: 'blur(70px)',
          animation: 'auroraFlow 30s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-2/3 left-1/4 w-[35rem] h-[35rem] rounded-full opacity-25"
        style={{
          background:
            'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0) 60%)',
          filter: 'blur(80px)',
          animation: 'auroraFlow2 35s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  ANIMATED TITLE — letter-by-letter reveal with glow                  */
/* ════════════════════════════════════════════════════════════════════ */
function AnimatedTitle() {
  const text = 'Live Sessions';
  const letters = text.split('');
  return (
    <h1
      className="text-5xl sm:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1]"
      style={{
        fontFamily: "'EB Garamond', serif",
        animation: 'letter-glow 4s ease-in-out infinite',
      }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.15 + i * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            display: 'inline-block',
            backgroundImage:
              'linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 40%, #F7B23A 80%, #B86A0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'pre',
            transformOrigin: 'bottom',
          }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  COSMIC PORTAL — 3D rotating orb with orbits & particles             */
/* ════════════════════════════════════════════════════════════════════ */
function CosmicPortal({ viewers }: { viewers: number }) {
  return (
    <div className="relative w-[420px] h-[420px]" style={{ perspective: 1200 }}>
      {/* Outer pulsing halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(247,148,29,0.4) 0%, rgba(247,148,29,0) 65%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />

      {/* Orbiting ring 1 */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-8 rounded-full"
        style={{
          border: '1.5px solid rgba(255,212,140,0.35)',
          transform: 'rotateX(70deg)',
          boxShadow: '0 0 40px rgba(247,148,29,0.25)',
        }}
      >
        {/* Particle on ring */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{
            background:
              'radial-gradient(circle, #FFF6DA, #F7B23A)',
            boxShadow: '0 0 20px #F7B23A, 0 0 40px #F7941D',
          }}
        />
      </motion.div>

      {/* Orbiting ring 2 (reverse) */}
      <motion.div
        animate={{ rotateZ: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-16 rounded-full"
        style={{
          border: '1px dashed rgba(255,212,140,0.28)',
          transform: 'rotateX(75deg) rotateY(15deg)',
        }}
      >
        <div
          className="absolute -bottom-1 right-4 w-2 h-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, #fff, #A78BFA)',
            boxShadow: '0 0 14px #A78BFA',
          }}
        />
      </motion.div>

      {/* Orbiting ring 3 — vertical */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-12 rounded-full"
        style={{
          border: '1px solid rgba(168,85,247,0.25)',
          transform: 'rotateY(70deg)',
        }}
      />

      {/* Floating zodiac particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 180;
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
            style={{
              x: Math.cos(angle) * r,
              y: Math.sin(angle) * r,
              background:
                i % 3 === 0
                  ? 'radial-gradient(circle, #fff, #F7B23A)'
                  : i % 3 === 1
                  ? 'radial-gradient(circle, #fff, #A78BFA)'
                  : 'radial-gradient(circle, #fff, #38BDF8)',
              boxShadow: '0 0 12px currentColor',
            }}
            animate={{
              x: [Math.cos(angle) * r, Math.cos(angle + 0.3) * r, Math.cos(angle) * r],
              y: [Math.sin(angle) * r, Math.sin(angle + 0.3) * r, Math.sin(angle) * r],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        );
      })}

      {/* Core orb with 3D shading */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-20 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 28%, #FFF8DC 0%, #FFD58A 25%, #F7941D 55%, #8B3F02 90%)',
          boxShadow:
            '0 0 60px rgba(247,148,29,0.7), 0 0 120px rgba(247,148,29,0.4), inset -30px -30px 80px rgba(80,30,0,0.7), inset 20px 20px 50px rgba(255,250,210,0.4)',
        }}
      >
        {/* Inner texture / craters */}
        <div
          className="absolute inset-0 rounded-full opacity-50 mix-blend-overlay"
          style={{
            background:
              'radial-gradient(circle at 65% 70%, rgba(120,50,0,0.6), transparent 30%), radial-gradient(circle at 25% 60%, rgba(255,240,180,0.3), transparent 25%)',
          }}
        />
      </motion.div>

      {/* Center radio icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1"
        >
          <Radio className="w-10 h-10 text-amber-100 drop-shadow-[0_0_12px_rgba(255,200,100,0.9)]" />
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: '#FFE7B5', textShadow: '0 0 10px rgba(247,148,29,0.8)' }}
          >
            {viewers > 0 ? `${viewers} watching` : 'Tune in'}
          </span>
        </motion.div>
      </div>

      {/* Light rays */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(255,212,140,0.35) 8deg, transparent 16deg, transparent 90deg, rgba(255,212,140,0.25) 98deg, transparent 106deg, transparent 180deg, rgba(255,212,140,0.3) 188deg, transparent 196deg, transparent 270deg, rgba(255,212,140,0.2) 278deg, transparent 286deg)',
          animation: 'ring-rotate-slow 40s linear infinite',
          maskImage:
            'radial-gradient(circle, transparent 35%, black 45%, black 80%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(circle, transparent 35%, black 45%, black 80%, transparent 95%)',
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  SHOOTING STARS                                                       */
/* ════════════════════════════════════════════════════════════════════ */
function ShootingStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        top: `${10 + i * 17}%`,
        left: `${60 + (i * 13) % 35}%`,
        delay: i * 4,
        duration: 6 + (i % 3),
      })),
    [],
  );
  return (
    <div aria-hidden className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full"
          style={{
            top: s.top,
            left: s.left,
            background: '#FFE7B5',
            boxShadow:
              '0 0 4px #FFE7B5, 0 0 0 1px rgba(255,231,181,0.4), -10px 0 20px 1px rgba(255,231,181,0.6)',
            animation: `shoot ${s.duration}s linear ${s.delay}s infinite`,
          }}
        >
          <span
            className="absolute top-0 left-0 h-px w-[60px] -translate-x-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,231,181,0.85))',
              transform: 'rotate(35deg)',
              transformOrigin: 'right',
            }}
          />
        </span>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  COSMIC STARS field                                                  */
/* ════════════════════════════════════════════════════════════════════ */
function CosmicStars({
  count = 60,
  sizeMul = 1,
  opacity = 1,
  seed = 0,
}: {
  count?: number;
  sizeMul?: number;
  opacity?: number;
  seed?: number;
}) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const idx = i + seed * 100;
        const x = (idx * 17.3) % 100;
        const y = (idx * 23.7) % 100;
        const size = (1 + ((idx * 3) % 3) * 0.6) * sizeMul;
        const dur = 4 + ((idx * 1.7) % 5);
        const delay = (idx * 0.4) % 5;
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
            animate={{ opacity: [0.15, 0.95, 0.15], scale: [0.9, 1.3, 0.9] }}
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

/* ════════════════════════════════════════════════════════════════════ */
/*  STAT PILL                                                           */
/* ════════════════════════════════════════════════════════════════════ */
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
      ? { dot: '#34D399', text: '#D1FAE5', border: 'rgba(52,211,153,0.45)' }
      : tone === 'danger'
        ? { dot: '#F87171', text: '#FCA5A5', border: 'rgba(248,113,113,0.45)' }
        : { dot: '#FFD58A', text: '#FFE7B5', border: 'rgba(255,212,140,0.45)' };

  return (
    <span
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md"
      style={{
        background: 'rgba(255,212,140,0.06)',
        border: `1px solid ${palette.border}`,
        color: palette.text,
        fontFamily: 'Poppins',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
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
            style={{ background: palette.dot, boxShadow: `0 0 8px ${palette.dot}` }}
          />
        </span>
      )}
      {label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  REFRESH BUTTON                                                      */
/* ════════════════════════════════════════════════════════════════════ */
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
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full overflow-hidden font-semibold text-[13px] disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #E8850B 100%)',
        boxShadow:
          '0 12px 24px -8px rgba(247,148,29,0.65), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 1px rgba(255,213,138,0.5)',
        color: '#fff',
        fontFamily: 'Poppins',
      }}
    >
      <RefreshCw
        className={`w-3.5 h-3.5 relative z-10 ${
          spinning
            ? 'animate-spin'
            : 'group-hover:rotate-180 transition-transform duration-700'
        }`}
      />
      <span className="relative z-10">Refresh</span>
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  STORIES STRIP                                                       */
/* ════════════════════════════════════════════════════════════════════ */
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="mb-10 relative"
    >
      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.32em] uppercase"
          style={{ color: '#FFD58A' }}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          Streaming Now
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-300/30 via-amber-300/10 to-transparent" />
      </div>

      <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
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
      initial={{ opacity: 0, scale: 0.7, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="group flex flex-col items-center gap-2.5 flex-shrink-0"
      style={{ perspective: 600 }}
    >
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Outer ripple */}
        <span
          className="absolute inset-0 rounded-full"
          style={{ animation: 'live-ripple 2.5s ease-out infinite' }}
        />
        {/* Glow halo on hover */}
        <span
          className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
          style={{
            background:
              'radial-gradient(circle, rgba(247,148,29,0.7), transparent 70%)',
          }}
        />

        {/* Rotating conic gold ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="w-[88px] h-[88px] rounded-full relative"
          style={{
            background:
              'conic-gradient(from 0deg, #F7941D, #FFE7B5, #B86A0B, #FFD58A, #A78BFA, #F7941D)',
            padding: 3,
            boxShadow:
              '0 8px 24px -6px rgba(247,148,29,0.5), 0 0 0 1px rgba(255,212,140,0.2)',
          }}
        >
          <div
            className="w-full h-full rounded-full p-[2px]"
            style={{
              background:
                'radial-gradient(circle, #2a1304 0%, #0e0501 100%)',
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1a0d04] relative">
              {session.broadcasterProfilePicture ? (
                <img
                  src={session.broadcasterProfilePicture}
                  alt={session.broadcasterName}
                  className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-700">
                  <span className="text-white font-bold text-2xl">
                    {session.broadcasterName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              {/* gloss */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* LIVE badge */}
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-white text-[9px] font-bold uppercase tracking-[0.16em] rounded-md shadow-lg flex items-center gap-1"
          style={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            boxShadow: '0 4px 12px -2px rgba(239,68,68,0.65)',
          }}
        >
          <span className="relative flex h-1 w-1">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1 w-1 bg-white" />
          </span>
          LIVE
        </span>

        {/* Viewer badge */}
        {session.viewers ? (
          <span
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5"
            style={{
              background: 'rgba(15,5,1,0.9)',
              border: '1px solid rgba(255,212,140,0.4)',
              color: '#FFE7B5',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Eye className="w-2 h-2" />
            {session.viewers}
          </span>
        ) : null}
      </div>
      <span
        className="text-[11px] font-semibold max-w-[88px] truncate"
        style={{ color: '#FFE7B5', fontFamily: 'Poppins' }}
      >
        {session.broadcasterName?.split(' ')[0] || 'Live'}
      </span>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION DIVIDER                                                     */
/* ════════════════════════════════════════════════════════════════════ */
function SectionDivider({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-4 mt-16 mb-7"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/30 to-amber-300/40" />
      <span className="inline-flex items-center gap-2">
        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
        <span
          className="text-[11px] font-semibold tracking-[0.32em] uppercase"
          style={{ color: '#FFD58A' }}
        >
          {label}
        </span>
        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300/30 to-amber-300/40" />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  FEATURED HERO — Crystal Ball card                                   */
/* ════════════════════════════════════════════════════════════════════ */
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
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), {
    stiffness: 220,
    damping: 18,
  });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), {
    stiffness: 220,
    damping: 18,
  });
  const sx = useTransform(px, [-0.5, 0.5], ['15%', '85%']);
  const sy = useTransform(py, [-0.5, 0.5], ['15%', '85%']);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${sx} ${sy}, rgba(255,210,140,0.28), transparent 55%)`;
  const holoBorder = useMotionTemplate`conic-gradient(from ${useTransform(
    px,
    [-0.5, 0.5],
    [0, 360],
  )}deg, #F7941D, #FFE7B5, #A78BFA, #38BDF8, #FFD58A, #B86A0B, #F7941D)`;

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
    ? getTimeSince(
        typeof session.createdAt === 'string'
          ? new Date(session.createdAt).getTime()
          : Number(session.createdAt),
      )
    : '';

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onLeave}
      onClick={onJoin}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: 'preserve-3d',
        perspective: 1400,
      }}
      className="group relative cursor-pointer"
    >
      {/* Holographic rotating border */}
      <motion.div
        className="absolute -inset-[2px] rounded-[20px] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: holoBorder,
          filter: 'blur(0.5px)',
        }}
      />
      {/* Bloom glow */}
      <div
        className="absolute -inset-4 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(247,148,29,0.45), transparent 70%)',
        }}
      />

      <div
        className="relative rounded-[18px] overflow-hidden grid grid-cols-1 md:grid-cols-[1.4fr_1fr]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #361a06 0%, #190a02 60%, #0b0501 100%)',
        }}
      >
        {/* LEFT — video preview */}
        <div className="relative aspect-video md:aspect-auto md:h-full bg-black overflow-hidden min-h-[300px]">
          {session.broadcasterProfilePicture ? (
            <img
              src={session.broadcasterProfilePicture}
              alt={session.broadcasterName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-950">
              <span className="text-8xl font-bold text-amber-200/60">
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
                'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 35%, rgba(11,5,1,0.70) 100%), linear-gradient(90deg, rgba(0,0,0,0.45), transparent 50%)',
            }}
          />

          {/* Scanlines */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.5) 3px, transparent 4px)',
            }}
          />

          {/* Cursor spotlight */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: spotlight,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.4s',
            }}
          />

          {/* Floating sparkles inside thumbnail */}
          <div className="absolute inset-0 pointer-events-none">
            <StarDust count={14} opacity={0.6} seed={3} />
          </div>

          {/* LIVE badge (top-left) */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-[10px] font-bold uppercase tracking-[0.22em] rounded-md"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                boxShadow: '0 8px 24px -4px rgba(239,68,68,0.7), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              LIVE
            </motion.span>
            {timeSinceStart && (
              <span className="text-white/95 text-[10px] bg-black/60 backdrop-blur-md rounded px-2.5 py-1 font-medium border border-white/10">
                {timeSinceStart}
              </span>
            )}
          </div>

          {/* Viewer count (top-right) */}
          <div
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,212,140,0.25)',
            }}
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-white text-xs font-bold">
              {session.viewers || 0}
            </span>
          </div>

          {/* Active call badge */}
          {session.activeCall && Object.keys(session.activeCall || {}).length > 0 && (
            <div
              className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 8px 20px -4px rgba(16,185,129,0.6)',
              }}
            >
              <PhoneCall className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold tracking-wider uppercase">
                On Call
              </span>
            </div>
          )}

          {/* Crystal Play Orb */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{
                scale: hovered ? 1 : 0.85,
                opacity: hovered ? 1 : 0.55,
                rotate: hovered ? 360 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,250,228,0.98), rgba(247,178,58,0.92) 50%, rgba(184,106,11,0.85))',
                border: '2px solid rgba(255,212,140,0.7)',
                boxShadow:
                  '0 16px 48px -10px rgba(247,148,29,0.75), inset 0 2px 6px rgba(255,255,255,0.8), 0 0 60px rgba(247,148,29,0.5)',
              }}
            >
              <Play className="w-9 h-9 ml-1 text-amber-900" fill="currentColor" />
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border-2 border-dashed border-amber-300/60"
              />
            </motion.div>
          </div>
        </div>

        {/* RIGHT — info panel */}
        <div className="relative p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#1a0a02]/40 to-transparent">
          <StarDust count={12} opacity={0.4} seed={5} />

          <div className="relative">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.26em] uppercase mb-4 relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,212,140,0.18), rgba(247,148,29,0.18))',
                border: '1px solid rgba(255,212,140,0.45)',
                color: '#FFD58A',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <Zap className="w-3 h-3 fill-amber-300" />
              Featured Live
            </span>

            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight"
              style={{
                fontFamily: "'EB Garamond', serif",
                backgroundImage:
                  'linear-gradient(180deg, #FFFCEF 0%, #FFE7B5 45%, #F7B23A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(247,148,29,0.3)',
              }}
            >
              {session.broadcasterName || 'Astrologer'}
            </h2>

            <p
              className="mt-3 text-sm leading-relaxed"
              style={{
                fontFamily: 'Poppins',
                color: 'rgba(255,240,210,0.78)',
              }}
            >
              Streaming live now — join to ask questions, get instant guidance, and connect spiritually through the cosmic veil.
            </p>

            {/* Stats */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
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
                    className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(247,148,29,0.18), rgba(247,148,29,0.10))',
                      border: '1px solid rgba(247,148,29,0.45)',
                      color: '#FFD58A',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    Public ₹{session.publicAudioRpm}/min
                  </span>
                ) : null}
                {session.privateAudioRpm ? (
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(168,85,247,0.10))',
                      border: '1px solid rgba(168,85,247,0.45)',
                      color: '#E9D5FF',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative mt-7"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className="group/btn relative w-full overflow-hidden rounded-xl py-3.5 px-5 font-semibold text-white inline-flex items-center justify-center gap-2"
              style={{
                background:
                  'linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #E8850B 100%)',
                boxShadow:
                  '0 16px 32px -10px rgba(247,148,29,0.75), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 0 1px rgba(255,213,138,0.55)',
                fontFamily: 'Poppins',
              }}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Join Live Session
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            </button>
          </motion.div>
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md"
      style={{
        background: 'rgba(255,212,140,0.06)',
        border: '1px solid rgba(255,212,140,0.22)',
        color: '#FFE7B5',
        fontFamily: 'Poppins',
      }}
    >
      {icon}
      <span className="font-bold">{value.toLocaleString()}</span>
      <span style={{ color: 'rgba(255,231,181,0.55)' }}>{label}</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  SESSION CARD — holographic 3D                                       */
/* ════════════════════════════════════════════════════════════════════ */
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
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), {
    stiffness: 220,
    damping: 18,
  });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), {
    stiffness: 220,
    damping: 18,
  });
  const sx = useTransform(px, [-0.5, 0.5], ['10%', '90%']);
  const sy = useTransform(py, [-0.5, 0.5], ['10%', '90%']);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${sx} ${sy}, rgba(255,210,140,0.28), transparent 55%)`;

  // Holographic shimmer angle follows cursor
  const holoAngle = useTransform(px, [-0.5, 0.5], [0, 360]);
  const holoBorder = useMotionTemplate`conic-gradient(from ${holoAngle}deg, #F7941D, #FFE7B5, #A78BFA, #FFD58A, #F7941D)`;

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
    ? getTimeSince(
        typeof session.createdAt === 'string'
          ? new Date(session.createdAt).getTime()
          : Number(session.createdAt),
      )
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
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.65,
        delay: 0.06 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: 'preserve-3d',
        perspective: 1100,
      }}
      className="group relative cursor-pointer"
    >
      {/* Bloom glow on hover */}
      <div
        className="absolute -inset-3 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(247,148,29,0.45), transparent 70%)',
        }}
      />

      {/* Holographic rotating border */}
      <motion.div
        className="absolute -inset-[1.5px] rounded-[18px] opacity-90 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: holoBorder, filter: 'blur(0.4px)' }}
      />

      <div
        className="relative rounded-[16px] overflow-hidden flex flex-col h-full"
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
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-1000"
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

          {/* gradient overlay */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.50) 0%, transparent 35%, rgba(11,5,1,0.65) 100%)',
            }}
          />

          {/* Scanline overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.5) 3px, transparent 4px)',
            }}
          />

          {/* spotlight */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: spotlight,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.35s',
            }}
          />

          {/* LIVE badge + time */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-white text-[10px] font-bold uppercase tracking-[0.18em] rounded-md"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                boxShadow: '0 4px 12px -2px rgba(239,68,68,0.65)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              LIVE
            </span>
            {timeSinceStart && (
              <span
                className="text-white/95 text-[10px] rounded px-1.5 py-0.5 font-medium"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,212,140,0.18)',
                }}
              >
                {timeSinceStart}
              </span>
            )}
          </div>

          {/* Viewer count */}
          <div
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,212,140,0.22)',
            }}
          >
            <Eye className="w-3 h-3 text-amber-300" />
            <span className="text-white text-[11px] font-bold">
              {session.viewers || 0}
            </span>
          </div>

          {/* Active call badge */}
          {hasActiveCall && (
            <div
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 4px 12px -2px rgba(16,185,129,0.65)',
              }}
            >
              <PhoneCall className="w-2.5 h-2.5 text-white" />
              <span className="text-white text-[9px] font-bold uppercase tracking-wider">
                On Call
              </span>
            </div>
          )}

          {/* Play overlay — crystal orb */}
          <motion.div
            animate={{
              scale: hovered ? 1 : 0.65,
              opacity: hovered ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,250,228,0.98), rgba(247,178,58,0.9))',
                border: '2px solid rgba(255,212,140,0.7)',
                boxShadow:
                  '0 12px 32px -8px rgba(247,148,29,0.7), inset 0 1px 3px rgba(255,255,255,0.8), 0 0 40px rgba(247,148,29,0.5)',
              }}
            >
              <Play className="w-6 h-6 ml-0.5 text-amber-900" fill="currentColor" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-full border border-dashed border-amber-300/60"
              />
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="relative p-4 flex gap-3 flex-1">
          {/* Avatar */}
          <motion.div
            animate={{ rotate: hovered ? 360 : 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden p-[1.5px]"
            style={{
              background:
                'conic-gradient(from 0deg, #F7941D, #FFD58A, #B86A0B, #FFD58A, #F7941D)',
              boxShadow: '0 4px 12px -3px rgba(247,148,29,0.5)',
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
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-[16px] truncate"
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
                  border: '1px solid rgba(255,212,140,0.22)',
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
                  border: '1px solid rgba(248,113,113,0.28)',
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
                      background:
                        'linear-gradient(135deg, rgba(247,148,29,0.16), rgba(247,148,29,0.08))',
                      border: '1px solid rgba(247,148,29,0.32)',
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
                      background:
                        'linear-gradient(135deg, rgba(168,85,247,0.20), rgba(168,85,247,0.10))',
                      border: '1px solid rgba(168,85,247,0.40)',
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
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  COSMIC LOADER                                                       */
/* ════════════════════════════════════════════════════════════════════ */
function CosmicLoader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-32"
    >
      <div className="relative w-32 h-32" style={{ perspective: 800 }}>
        {/* outer rotating conic ring */}
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
        {/* mid dashed ring tilted */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border-2 border-dashed border-amber-300/30"
          style={{ transform: 'rotateX(60deg)' }}
        />
        {/* inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-6 rounded-full border border-purple-300/30"
          style={{ transform: 'rotateY(60deg)' }}
        />
        {/* core orb */}
        <div
          className="absolute inset-10 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, #FFF6DA 0%, #F2C26A 60%, #B07514 100%)',
            boxShadow:
              '0 0 40px rgba(247,148,29,0.7), inset 0 2px 4px rgba(255,255,255,0.7)',
            animation: 'pulse-glow 2.5s ease-in-out infinite',
          }}
        />
      </div>
      <p
        className="mt-8 text-sm font-medium tracking-[0.2em] uppercase"
        style={{ color: 'rgba(255,231,181,0.85)', fontFamily: 'Poppins' }}
      >
        Tuning into the cosmic stream…
      </p>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  EMPTY STATE                                                         */
/* ════════════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 sm:py-28 text-center"
    >
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-8" style={{ perspective: 800 }}>
        {/* halo */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(247,148,29,0.6), transparent 70%)',
          }}
        />
        {/* mandala */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Mandala className="text-amber-300" size={210} opacity={0.3} />
        </motion.div>
        {/* dashed orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 rounded-full border-2 border-dashed border-amber-300/35"
          style={{ transform: 'rotateX(60deg)' }}
        />
        {/* core orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, #FFF6DA 0%, #F2C26A 55%, #B07514 100%)',
              boxShadow:
                '0 0 50px rgba(247,148,29,0.7), inset 0 3px 6px rgba(255,255,255,0.7), inset 0 -8px 18px rgba(120,60,0,0.4)',
              border: '1.5px solid #F7B23A',
            }}
          >
            <Radio className="w-12 h-12 text-amber-900" />
          </motion.div>
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
        Peaceful silence in the cosmos
      </h3>
      <p
        className="text-sm max-w-md leading-relaxed mb-8"
        style={{
          fontFamily: 'Poppins',
          color: 'rgba(255,240,210,0.78)',
        }}
      >
        Our spiritual guides go live regularly. Check back soon, or connect with an astrologer right now.
      </p>

      <Link
        href="/call-with-astrologer"
        className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 font-semibold text-white text-sm"
        style={{
          background:
            'linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #E8850B 100%)',
          boxShadow:
            '0 16px 32px -10px rgba(247,148,29,0.7), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 0 1px rgba(255,213,138,0.55)',
          fontFamily: 'Poppins',
        }}
      >
        <PhoneCall className="w-4 h-4" />
        Browse Astrologers
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
        <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      </Link>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  HELPERS                                                             */
/* ════════════════════════════════════════════════════════════════════ */
function getTimeSince(timestamp: number): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return 'Just started';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return '';
}
