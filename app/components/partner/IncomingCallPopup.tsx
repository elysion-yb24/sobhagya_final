'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, PhoneOff, PhoneCall, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useIncomingCallSocket } from '../../hooks/useIncomingCallSocket';

interface IncomingCallPopupProps {
  /** Set true when the partner is genuinely able to take a call. */
  enabled?: boolean;
}

// Backend's MAX_CALL_RING_DURATION (livekitTokenController.js) is 80s.
const RING_TIMEOUT_MS = 80_000;

/**
 * Synthesises a classic two-tone phone ring (440Hz + 480Hz, on for 2s, off for 4s)
 * using the Web Audio API. Returns a `stop()` function. Beats shipping a binary
 * asset and survives autoplay policies the same way <audio> does — both still
 * need a prior user gesture, but the AudioContext keeps trying.
 */
function startRingtone(): () => void {
  if (typeof window === 'undefined') return () => {};
  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!Ctx) return () => {};
  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return () => {};
  }

  let stopped = false;
  const oscillators: OscillatorNode[] = [];

  const scheduleBurst = (startAt: number) => {
    [440, 480].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.15, startAt + 0.05);
      gain.gain.linearRampToValueAtTime(0.15, startAt + 1.95);
      gain.gain.linearRampToValueAtTime(0, startAt + 2.0);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 2.0);
      oscillators.push(osc);
    });
  };

  // Schedule the first ~10 cycles up front; reschedule periodically.
  const scheduleAhead = () => {
    if (stopped) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 10; i++) {
      scheduleBurst(now + i * 6);
    }
  };
  scheduleAhead();
  const interval = setInterval(scheduleAhead, 50_000);

  // Resuming covers the autoplay-policy case where the context starts suspended.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  return () => {
    stopped = true;
    clearInterval(interval);
    oscillators.forEach((o) => {
      try { o.stop(); } catch { /* already stopped */ }
    });
    ctx.close().catch(() => {});
  };
}

export default function IncomingCallPopup({ enabled = true }: IncomingCallPopupProps) {
  const router = useRouter();
  const { incomingCall, dismiss, acceptCall, rejectCall } = useIncomingCallSocket();
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(RING_TIMEOUT_MS / 1000));
  const stopRingRef = useRef<(() => void) | null>(null);

  // Ringtone, vibration, ring timer, countdown — all driven from one effect so
  // they start together and tear down together.
  useEffect(() => {
    if (!enabled || !incomingCall || muted) return;
    stopRingRef.current = startRingtone();
    if ('vibrate' in navigator) {
      try { navigator.vibrate?.([400, 200, 400, 200, 400, 200, 400]); } catch { /* noop */ }
    }
    return () => {
      stopRingRef.current?.();
      stopRingRef.current = null;
    };
  }, [enabled, incomingCall, muted]);

  // 80s auto-dismiss + countdown.
  useEffect(() => {
    if (!incomingCall) return;
    setSecondsLeft(Math.round(RING_TIMEOUT_MS / 1000));
    const tick = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    const timeout = setTimeout(() => {
      dismiss(incomingCall.callId);
    }, RING_TIMEOUT_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
  }, [incomingCall, dismiss]);

  // Reset transient state when the popup closes.
  useEffect(() => {
    if (!incomingCall) {
      setBusy(null);
      setError(null);
      setMuted(false);
    }
  }, [incomingCall]);

  if (!enabled) return null;

  const handleAccept = async () => {
    if (!incomingCall || busy) return;
    setBusy('accept');
    setError(null);
    try {
      const data = await acceptCall(incomingCall.channel, true);
      const livekitToken: string = data?.data?.token || '';
      const wsURL: string = data?.data?.livekitSocketURL || incomingCall.livekitSocketURL || '';
      const params = new URLSearchParams({
        userId: incomingCall.callerId,
        userName: incomingCall.callerName,
        roomName: incomingCall.channel,
        callType: incomingCall.callType,
        token: livekitToken,
        wsURL,
      });
      dismiss(incomingCall.callId);
      router.push(`/astrologer-video-call?${params.toString()}`);
    } catch (e: any) {
      setError(e?.message || 'Could not accept the call. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (!incomingCall || busy) return;
    setBusy('reject');
    setError(null);
    const callId = incomingCall.callId;
    try {
      await rejectCall(incomingCall.channel, incomingCall.receiverId, 'rejected_by_partner');
    } catch (e: any) {
      console.warn('Failed to reject call via socket', e);
    } finally {
      dismiss(callId);
      setBusy(null);
    }
  };

  const isVideo = incomingCall?.callType === 'video';
  const callerInitial = (incomingCall?.callerName || '?').charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          key={incomingCall.callId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-b from-[#0e1116] via-[#1a1d24] to-[#2a1810] text-white overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="incoming-call-title"
        >
          {/* Ambient orange glow behind the avatar — purely decorative */}
          <motion.div
            aria-hidden
            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] rounded-full bg-orange-600/20 blur-[140px]"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Header strip with status + countdown */}
          <div className="relative z-10 pt-[max(env(safe-area-inset-top),1.25rem)] px-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-80 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
              </span>
              Incoming {isVideo ? 'Video' : 'Audio'} Call
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-mono font-bold text-white/60 tabular-nums">
                {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:
                {String(secondsLeft % 60).padStart(2, '0')}
              </div>
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Unmute ringtone' : 'Mute ringtone'}
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white/80 transition"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Caller card */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="relative mb-8">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-orange-400/40"
                animate={{ scale: [1, 1.7, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-orange-400/30"
                animate={{ scale: [1, 2.3, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-orange-400/20"
                animate={{ scale: [1, 2.9, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
              />
              {incomingCall.callerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={incomingCall.callerAvatar}
                  alt={incomingCall.callerName}
                  className="relative w-36 h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-white/20">
                  {callerInitial}
                </div>
              )}
            </div>

            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Calling…</p>
            <h2
              id="incoming-call-title"
              className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white"
            >
              {incomingCall.callerName}
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              {isVideo ? (
                <Video className="w-4 h-4 text-orange-300" />
              ) : (
                <Phone className="w-4 h-4 text-orange-300" />
              )}
              <span className="text-[12px] font-bold text-white/90 uppercase tracking-wider">
                {isVideo ? 'Video Consultation' : 'Audio Consultation'}
              </span>
            </div>

            {error && (
              <p className="mt-6 max-w-sm text-sm font-bold text-red-200 bg-red-500/15 border border-red-400/30 rounded-2xl px-4 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Action row — mobile-style: large round buttons at the bottom */}
          <div className="relative z-10 px-6 pb-[max(env(safe-area-inset-bottom),2rem)] pt-4">
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto items-end">
              <button
                onClick={handleReject}
                disabled={!!busy}
                aria-label="Decline incoming call"
                className="flex flex-col items-center gap-3 group"
              >
                <span
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition shadow-2xl shadow-red-900/40 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy === 'reject' ? (
                    <Loader2 className="w-9 h-9 animate-spin text-white" />
                  ) : (
                    <PhoneOff className="w-9 h-9 text-white" />
                  )}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
                  Decline
                </span>
              </button>

              <button
                onClick={handleAccept}
                disabled={!!busy}
                aria-label="Accept incoming call"
                className="flex flex-col items-center gap-3 group"
              >
                <motion.span
                  className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition shadow-2xl shadow-emerald-900/40 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  animate={busy ? {} : { scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {busy === 'accept' ? (
                    <Loader2 className="w-9 h-9 animate-spin text-white" />
                  ) : (
                    <PhoneCall className="w-9 h-9 text-white" />
                  )}
                </motion.span>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
                  Answer
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
