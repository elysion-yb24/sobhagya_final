'use client';

// Native chat page wired directly to the chat-service REST + Socket.IO.
//
// Layout:
//   /chat                            → thread list (full screen on mobile, split view ≥ md)
//   /chat?threadId=...&sessionId=... → active conversation (full screen on mobile)
//
// Realtime events used:
//   emit:   join_session, send_message, end_session, typing, read_message
//   listen: receive_message, astrologer_joined, session_ended, typing
//
// New in this redesign (text + image only, mobile-first):
//   - reply-to-message (uses backend replyMessage field)
//   - image attachments (Azure SAS via uploadChatFile, sent as messageType: 'image')
//   - image lightbox + long-press actions sheet
//   - session-ended card with rate / dakshina / chat-again

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAuthToken, getUserDetails, isAuthenticated } from '../utils/auth-utils';
import { fetchWalletBalance } from '../utils/production-api';
import { getApiBaseUrl } from '../config/api';
import {
  adaptThread,
  fetchMessages,
  fetchThreadById,
  fetchThreads,
  declineSession as apiDeclineSession,
  uploadChatFile,
  createChatSession,
  type BackendMessage,
  type BackendThread,
  type ChatThreadView,
  type PujaLive,
} from '../utils/chat-api';
import SchedulePujaLiveModal from '../components/pooja/SchedulePujaLiveModal';
import { useSessionManager } from '../components/astrologers/SessionManager';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages, { type Message as UIMessageBase } from '../components/chat/ChatMessages';
import ChatInput, {
  type PendingImage,
  type ReplyTarget,
} from '../components/chat/ChatInput';
import ImageLightbox from '../components/chat/ImageLightbox';
import MessageActionsSheet, {
  type MessageActionsTarget,
} from '../components/chat/MessageActionsSheet';
import RatingModal from '../components/ui/RatingModal';
import DakshinaModal from '../components/calling/ui/DakshinaModal';
import OfflineAstrologerModal from '../components/astrologers/OfflineAstrologerModal';
import {
  findOrFetchAstrologer,
  getCachedAstrologer,
} from '../utils/astrologer-cache';

const DEFAULT_CHAT_RPM = 5;

type UIMessage = UIMessageBase;

/** Normalise a backend message into the UI message shape. */
function adaptMessage(msg: BackendMessage, currentUserId: string | null): UIMessage {
  const mine = currentUserId && String(msg.sentBy) === String(currentUserId);
  const isInfo = msg.messageType === 'info' || msg.messageType === 'informative';
  return {
    id: String(msg._id || msg.chatId),
    messageId: String(msg._id || msg.chatId),
    text: msg.message || '',
    sender: isInfo ? 'system' : mine ? 'user' : 'astrologer',
    timestamp: msg.createdAt,
    messageType: (msg.messageType as UIMessage['messageType']) || 'text',
    fileLink: msg.fileLink,
    replyMessage: msg.replyMessage || null,
    isAutomated: Boolean(msg.isAutomated || isInfo),
    deliveryStatus: mine ? 'sent' : undefined,
  };
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected, lastConnectError, joinSessionRoom } = useSessionManager();

  const threadIdParam = searchParams?.get('threadId') || null;
  const sessionIdParam = searchParams?.get('sessionId') || null;

  // -------- auth gate --------
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');

  // Measure the global site header so the chat panel always sits cleanly
  // below it (the site header is two rows on desktop, one row on tablet/mobile,
  // and grows further at 150%+ browser zoom — a hardcoded offset can never
  // match all of those at once).
  const [siteHeaderHeight, setSiteHeaderHeight] = useState(64);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Look for the first <header> that's positioned fixed at the top.
    const headers = Array.from(document.querySelectorAll('header')) as HTMLElement[];
    let target: HTMLElement | null = null;
    for (const h of headers) {
      const cs = window.getComputedStyle(h);
      if (cs.position === 'fixed' && (cs.top === '0px' || cs.top === '0')) {
        target = h;
        break;
      }
    }
    if (!target) return;
    const update = () => {
      if (target) setSiteHeaderHeight(target.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(target);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = isAuthenticated();
    setAuthed(ok);
    if (ok) {
      const u = getUserDetails();
      setUserId(String(u?.id || u?._id || ''));
      setUserRole(u?.role || 'user');
    }
    setAuthChecked(true);
  }, []);

  // -------- thread list --------
  const [threads, setThreads] = useState<ChatThreadView[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    if (!authed) return;
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const { threads: backendThreads } = await fetchThreads({ limit: 30 });
      const adapted = (backendThreads as BackendThread[]).map((t) => adaptThread(t, userId));
      setThreads(adapted);
    } catch (err: unknown) {
      console.warn('[chat] loadThreads failed', err);
      setThreadsError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setThreadsLoading(false);
    }
  }, [authed, userId]);

  useEffect(() => {
    if (authed) loadThreads();
  }, [authed, loadThreads]);

  // -------- active thread / session --------
  const [activeThread, setActiveThread] = useState<ChatThreadView | null>(null);

  // Phase 2 — puja live (scheduled private video).
  const [pujaLive, setPujaLive] = useState<PujaLive | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [pujaTick, setPujaTick] = useState(0); // re-evaluates the "joinable" window over time
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionIdParam);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'ended' | 'pending'>('active');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [endingSession, setEndingSession] = useState(false);
  const [typingFromOther, setTypingFromOther] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Composer state.
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Lightbox state.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartId, setLightboxStartId] = useState<string | null>(null);

  // Action sheet state.
  const [actionsTarget, setActionsTarget] = useState<MessageActionsTarget | null>(null);

  // Post-session modals.
  const [showRating, setShowRating] = useState(false);
  const [showDakshina, setShowDakshina] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [chatAgainPending, setChatAgainPending] = useState(false);

  // Suggestion modal shown when "Chat again" can't be honoured because the
  // astrologer is offline ('offline') or rejected/is on another session ('busy').
  const [suggestionModal, setSuggestionModal] = useState<
    { reason: 'offline' | 'busy'; name: string } | null
  >(null);

  // Live billing/timer state.
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const sessionStartedAtRef = useRef<number | null>(null);

  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const loadingOlderRef = useRef(false);

  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const isNearBottomRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  // Track whether we've ever observed a disconnect so the "Reconnected" toast
  // only fires after a real reconnection — not on the first successful socket
  // handshake during page load.
  const hasDisconnectedRef = useRef(false);
  const typingWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (typingWatchdogRef.current) clearTimeout(typingWatchdogRef.current);
    };
  }, []);
  // Belt-and-braces: clear typing indicator if the session ends.
  useEffect(() => {
    if (sessionStatus === 'ended') {
      setTypingFromOther(false);
      if (typingWatchdogRef.current) {
        clearTimeout(typingWatchdogRef.current);
        typingWatchdogRef.current = null;
      }
    }
  }, [sessionStatus]);

  const wasConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (!isConnected) {
      hasDisconnectedRef.current = true;
    }
    if (!wasConnectedRef.current && isConnected && hasDisconnectedRef.current) {
      setShowReconnectedToast(true);
      const t = setTimeout(() => setShowReconnectedToast(false), 1500);
      wasConnectedRef.current = isConnected;
      return () => clearTimeout(t);
    }
    wasConnectedRef.current = isConnected;
  }, [isConnected]);

  // Track whether user is near the bottom of the message list.
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const near = distanceFromBottom < 80;
      isNearBottomRef.current = near;
      setShowJumpToBottom(!near && messages.length > 0);

      if (
        el.scrollTop <= 8 &&
        !loadingOlderRef.current &&
        hasMoreHistory &&
        threadIdParam &&
        messages.length > 0
      ) {
        loadOlderHistory();
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, hasMoreHistory, threadIdParam]);

  // Auto-scroll to bottom only when user is near bottom OR last message is mine.
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    const lastIsMine = last?.sender === 'user';
    if (isNearBottomRef.current || lastIsMine) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typingFromOther]);

  const scrollToBottom = useCallback(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    isNearBottomRef.current = true;
    setShowJumpToBottom(false);
  }, []);

  // Reset state and load thread metadata + history when threadId changes.
  useEffect(() => {
    if (!authed || !threadIdParam) {
      setActiveThread(null);
      setMessages([]);
      return;
    }

    let cancelled = false;
    setMessagesLoading(true);
    setMessages([]);
    setHasMoreHistory(false);
    isNearBottomRef.current = true;
    setShowJumpToBottom(false);
    setReplyTarget(null);
    setPendingImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });

    const HISTORY_PAGE = 20;
    (async () => {
      const [thread, history] = await Promise.all([
        fetchThreadById(threadIdParam),
        fetchMessages(threadIdParam, { limit: HISTORY_PAGE }),
      ]);
      if (cancelled) return;

      if (thread) {
        const view = adaptThread(thread, userId);
        const t = thread as unknown as {
          user?: { avatar?: string; name?: string };
          provider?: { avatar?: string; name?: string };
        };
        if (t.user?.avatar) view.userId.avatar = t.user.avatar;
        if (t.user?.name) view.userId.name = t.user.name;
        if (t.provider?.avatar) view.providerId.avatar = t.provider.avatar;
        if (t.provider?.name) view.providerId.name = t.provider.name;
        setActiveThread(view);
        setSessionStatus(view.status);
        setPujaLive(view.pujaLive || null);
        if (!sessionIdParam && view.lastSessionId) {
          setActiveSessionId(view.lastSessionId);
        }
      } else {
        setActiveThread(null);
        setPujaLive(null);
      }

      const adapted = history.map((m) => adaptMessage(m, userId));
      setMessages(adapted);
      setHasMoreHistory(history.length >= HISTORY_PAGE);
      setMessagesLoading(false);
    })().catch((err) => {
      if (cancelled) return;
      console.warn('[chat] load thread failed', err);
      setMessagesLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [authed, threadIdParam, userId, sessionIdParam]);

  // Cleanup any remaining object URLs on unmount.
  useEffect(() => {
    return () => {
      pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join socket room.
  useEffect(() => {
    if (!socket || !isConnected) return;
    if (!threadIdParam || !activeSessionId) return;
    let cancelled = false;
    (async () => {
      // For a pooja booking, the astrologer (role 'friend') opening the thread
      // joins as the provider — that's the "accept" that connects both. Billed
      // chats keep their existing behavior (join as user) — no regression.
      const acceptAsAstrologer = userRole === 'friend' && activeThread?.source === 'pooja';
      const ok = await joinSessionRoom(threadIdParam, activeSessionId, acceptAsAstrologer);
      if (!cancelled && !ok) {
        console.warn('[chat] join_session failed (will keep retrying via socket reconnects)');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [socket, isConnected, threadIdParam, activeSessionId, joinSessionRoom, userRole, activeThread]);

  // Wire socket events.
  useEffect(() => {
    if (!socket) return;
    if (!threadIdParam) return;

    const onReceive = (msg: BackendMessage) => {
      if (!msg) return;
      if (msg.threadId && String(msg.threadId) !== String(threadIdParam)) return;
      const ui = adaptMessage(msg, userId);
      setMessages((prev) => {
        if (prev.some((p) => p.id === ui.id)) return prev;
        return [...prev, ui];
      });
    };

    const onAstrologerJoined = (sessionData: { threadId?: string } | null | undefined) => {
      if (!sessionData) return;
      if (sessionData.threadId && String(sessionData.threadId) !== String(threadIdParam)) return;
      setSessionStatus('active');
      setMessages((prev) => [
        ...prev,
        {
          id: `astro-joined-${Date.now()}`,
          text: 'Astrologer has joined the session',
          sender: 'system',
          timestamp: new Date().toISOString(),
          isAutomated: false,
        },
      ]);
    };

    const onSessionEnded = (payload: { data?: { threadId?: string }; threadId?: string } | undefined) => {
      const ended = payload?.data || payload;
      if (ended?.threadId && String(ended.threadId) !== String(threadIdParam)) return;
      setSessionStatus('ended');
      setShowRating(true);
    };

    const onTyping = (payload: { isTyping?: boolean } | undefined) => {
      const next = Boolean(payload?.isTyping);
      setTypingFromOther(next);
      // Watchdog: peer's `typing:false` event can be lost (network drop, app
      // killed mid-typing). Auto-clear after 4s if no further activity.
      if (typingWatchdogRef.current) clearTimeout(typingWatchdogRef.current);
      if (next) {
        typingWatchdogRef.current = setTimeout(() => {
          setTypingFromOther(false);
          typingWatchdogRef.current = null;
        }, 4000);
      }
    };

    const onPujaScheduled = (payload: { pujaLive?: PujaLive } | undefined) => {
      if (payload?.pujaLive) setPujaLive(payload.pujaLive);
    };
    const onPujaReminder = (payload: { pujaLive?: PujaLive } | undefined) => {
      if (payload?.pujaLive) setPujaLive(payload.pujaLive);
      toast('🪔 Your puja is starting in 5 minutes — tap Join.', { icon: '🔔' });
    };

    socket.on('receive_message', onReceive);
    socket.on('astrologer_joined', onAstrologerJoined);
    socket.on('session_ended', onSessionEnded);
    socket.on('typing', onTyping);
    socket.on('pooja_live_scheduled', onPujaScheduled);
    socket.on('pooja_live_reminder', onPujaReminder);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('astrologer_joined', onAstrologerJoined);
      socket.off('session_ended', onSessionEnded);
      socket.off('typing', onTyping);
      socket.off('pooja_live_scheduled', onPujaScheduled);
      socket.off('pooja_live_reminder', onPujaReminder);
    };
  }, [socket, threadIdParam, userId]);

  // Keep the "joinable" window fresh while a puja live is scheduled.
  useEffect(() => {
    if (!pujaLive?.scheduledAt || pujaLive.status === 'completed' || pujaLive.status === 'cancelled') return;
    const id = window.setInterval(() => setPujaTick((n) => n + 1), 20000);
    return () => window.clearInterval(id);
  }, [pujaLive?.scheduledAt, pujaLive?.status]);

  // load older history.
  const loadOlderHistory = useCallback(async () => {
    if (loadingOlderRef.current || !hasMoreHistory || !threadIdParam) return;
    let oldestTs: string | null = null;
    for (const m of messages) {
      if (!m.timestamp) continue;
      if (oldestTs === null || new Date(m.timestamp).getTime() < new Date(oldestTs).getTime()) {
        oldestTs = m.timestamp;
      }
    }
    if (!oldestTs) return;

    loadingOlderRef.current = true;
    setLoadingOlder(true);

    const el = messagesEndRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    try {
      const PAGE = 30;
      const older = await fetchMessages(threadIdParam, {
        lastTimeStamp: oldestTs,
        limit: PAGE,
      });
      if (older.length === 0) {
        setHasMoreHistory(false);
        return;
      }
      const adapted = older.map((m) => adaptMessage(m, userId));
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        return [...adapted.filter((m) => !existingIds.has(m.id)), ...prev];
      });
      setHasMoreHistory(older.length >= PAGE);

      requestAnimationFrame(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight + el.scrollTop;
        }
      });
    } catch (err) {
      console.warn('[chat] loadOlderHistory failed', err);
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [hasMoreHistory, threadIdParam, messages, userId]);

  // -------- send / retry message --------
  type SendOptions = {
    text?: string;
    messageType?: 'text' | 'image';
    fileLink?: string | null;
    replyMessage?: object | null;
    clientMessageId: string;
  };

  const emitSend = useCallback(
    (opts: SendOptions) => {
      if (!socket || !isConnected) return;
      if (!threadIdParam || !activeSessionId) return;
      const cid = opts.clientMessageId;

      // Ack-timeout watchdog. Without this, a missing server ack leaves the
      // optimistic bubble stuck at "sent" forever with no way to retry.
      let acked = false;
      const timeoutId = setTimeout(() => {
        if (acked) return;
        console.warn('[chat] send_message ack timed out for', cid);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === cid ? { ...m, deliveryStatus: 'failed' as const } : m
          )
        );
      }, 10_000);

      socket.emit(
        'send_message',
        {
          sessionId: activeSessionId,
          threadId: threadIdParam,
          sentBy: userId,
          message: opts.text || '',
          messageType: opts.messageType || 'text',
          fileLink: opts.fileLink || null,
          replyMessage: opts.replyMessage || null,
          voiceMessageDuration: 0,
        },
        (response: { success?: boolean; message?: string; data?: BackendMessage }) => {
          acked = true;
          clearTimeout(timeoutId);
          if (!response?.success) {
            console.warn('[chat] send_message failed:', response?.message);
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMessageId === cid ? { ...m, deliveryStatus: 'failed' as const } : m
              )
            );
          } else if (response?.data) {
            const saved = adaptMessage(response.data as BackendMessage, userId);
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMessageId === cid
                  ? { ...saved, clientMessageId: cid, deliveryStatus: 'delivered' as const }
                  : m
              )
            );
            // Refresh header wallet balance after each delivered message.
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('wallet-balance-refresh'));
            }
          }
        }
      );
    },
    [socket, isConnected, threadIdParam, activeSessionId, userId]
  );

  const buildReplyPayload = useCallback(
    (target: ReplyTarget | null) => {
      if (!target) return null;
      // Backend `replyMessage` expects: id, message, replyTo, replyBy, messageType, voiceMessageDuration.
      const replied = messages.find((m) => m.id === target.id);
      return {
        id: target.id,
        message: target.text,
        replyTo: replied?.sender === 'user' ? userId || '' : '',
        replyBy: userId || '',
        messageType: replied?.messageType || 'text',
        voiceMessageDuration: 0,
      };
    },
    [messages, userId]
  );

  const sendCurrentComposer = useCallback(async () => {
    if (!socket || !isConnected) return;
    if (!threadIdParam || !activeSessionId) return;
    if (sessionStatus === 'ended') return;
    if (isSending) return;

    const text = newMessage.trim();
    const images = pendingImages;
    if (!text && images.length === 0) return;

    const replyPayload = buildReplyPayload(replyTarget);

    // Pull state we care about, then reset composer optimistically.
    setIsSending(true);
    setNewMessage('');
    setReplyTarget(null);
    setPendingImages([]);
    isNearBottomRef.current = true;
    setShowJumpToBottom(false);
    // Stop the peer's "typing…" indicator immediately — otherwise it lingers
    // for up to the composer's 1.5s debounce after the message is in flight.
    if (socket && isConnected && threadIdParam) {
      socket.emit('typing', { threadId: threadIdParam, isTyping: false });
      lastTypingRef.current = 0;
    }

    try {
      // Image messages first — caption attaches to the first image only.
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const cid = `client-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
          const optimistic: UIMessage = {
            id: cid,
            clientMessageId: cid,
            text: i === 0 ? text : '',
            sender: 'user',
            timestamp: new Date().toISOString(),
            messageType: 'image',
            fileLink: img.previewUrl,
            replyMessage: i === 0 ? replyPayload : null,
            deliveryStatus: 'sent',
            // Keep the File around so a failed upload can be retried without
            // losing the photo.
            pendingFile: img.file,
          };
          setMessages((prev) => [...prev, optimistic]);

          const result = await uploadChatFile(img.file);
          if (!result?.fileLink) {
            // Don't revoke the blob URL on failure — the user can still see
            // their photo in the bubble and retry the send.
            setMessages((prev) =>
              prev.map((m) => (m.clientMessageId === cid ? { ...m, deliveryStatus: 'failed' } : m))
            );
            continue;
          }

          // Patch optimistic with real fileLink so the bubble shows the persisted URL,
          // and drop the File ref now that the photo lives on the server.
          setMessages((prev) =>
            prev.map((m) =>
              m.clientMessageId === cid
                ? { ...m, fileLink: result.fileLink, pendingFile: undefined }
                : m
            )
          );
          URL.revokeObjectURL(img.previewUrl);

          emitSend({
            text: i === 0 ? text : '',
            messageType: 'image',
            fileLink: result.fileLink,
            replyMessage: i === 0 ? replyPayload : null,
            clientMessageId: cid,
          });
        }
      } else if (text) {
        const cid = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimistic: UIMessage = {
          id: cid,
          clientMessageId: cid,
          text,
          sender: 'user',
          timestamp: new Date().toISOString(),
          messageType: 'text',
          replyMessage: replyPayload,
          deliveryStatus: 'sent',
        };
        setMessages((prev) => [...prev, optimistic]);
        emitSend({
          text,
          messageType: 'text',
          fileLink: null,
          replyMessage: replyPayload,
          clientMessageId: cid,
        });
      }
    } finally {
      setIsSending(false);
    }
  }, [
    socket,
    isConnected,
    threadIdParam,
    activeSessionId,
    sessionStatus,
    isSending,
    newMessage,
    pendingImages,
    replyTarget,
    buildReplyPayload,
    emitSend,
  ]);

  const retryMessage = useCallback(
    async (clientId: string) => {
      const target = messages.find((m) => m.clientMessageId === clientId);
      if (!target) return;
      if (!socket || !isConnected) return;
      if (sessionStatus === 'ended') return;

      setMessages((prev) =>
        prev.map((m) => (m.clientMessageId === clientId ? { ...m, deliveryStatus: 'sent' } : m))
      );

      // Image message that never made it past the upload step → re-upload first.
      if (target.messageType === 'image' && target.pendingFile) {
        const result = await uploadChatFile(target.pendingFile);
        if (!result?.fileLink) {
          setMessages((prev) =>
            prev.map((m) =>
              m.clientMessageId === clientId ? { ...m, deliveryStatus: 'failed' } : m
            )
          );
          return;
        }
        const oldPreview = target.fileLink;
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientId
              ? { ...m, fileLink: result.fileLink, pendingFile: undefined }
              : m
          )
        );
        if (oldPreview && oldPreview.startsWith('blob:')) URL.revokeObjectURL(oldPreview);
        emitSend({
          text: target.text,
          messageType: 'image',
          fileLink: result.fileLink,
          replyMessage: (target.replyMessage as object | null) || null,
          clientMessageId: clientId,
        });
        return;
      }

      emitSend({
        text: target.text,
        messageType: target.messageType === 'image' ? 'image' : 'text',
        fileLink: target.fileLink || null,
        replyMessage: (target.replyMessage as object | null) || null,
        clientMessageId: clientId,
      });
    },
    [messages, socket, isConnected, sessionStatus, emitSend]
  );

  // typing throttle
  const lastTypingRef = useRef<number>(0);
  const handleTyping = useCallback(() => {
    if (!socket || !isConnected || !threadIdParam) return;
    const now = Date.now();
    if (now - lastTypingRef.current < 1500) return;
    lastTypingRef.current = now;
    socket.emit('typing', { threadId: threadIdParam, isTyping: true });
  }, [socket, isConnected, threadIdParam]);

  const handleStopTyping = useCallback(() => {
    if (!socket || !isConnected || !threadIdParam) return;
    socket.emit('typing', { threadId: threadIdParam, isTyping: false });
  }, [socket, isConnected, threadIdParam]);

  // -------- end session --------
  const requestEndSession = useCallback(() => setShowEndConfirm(true), []);
  const cancelEndSession = useCallback(() => setShowEndConfirm(false), []);

  const confirmEndSession = useCallback(async () => {
    if (!threadIdParam || !activeSessionId) return;
    if (endingSession) return;
    setShowEndConfirm(false);
    setEndingSession(true);
    try {
      if (socket && isConnected) {
        await new Promise<void>((resolve) => {
          socket.emit(
            'end_session',
            {
              threadId: threadIdParam,
              sessionId: activeSessionId,
              role: 'user',
              reason: 'user_ended',
            },
            () => resolve()
          );
          setTimeout(resolve, 4000);
        });
      } else {
        await apiDeclineSession(threadIdParam, activeSessionId);
      }
      setSessionStatus('ended');
      setShowRating(true);
    } catch (err) {
      console.warn('[chat] end session failed', err);
    } finally {
      setEndingSession(false);
    }
  }, [threadIdParam, activeSessionId, endingSession, socket, isConnected]);

  // -------- best-effort session cleanup when the user closes the tab --------
  // Socket.IO emits during `beforeunload` aren't guaranteed to flush, so we
  // also fire a same-origin sendBeacon to /api/chat/session/decline. Cookies
  // are HttpOnly and same-origin, so the proxy still picks up auth.
  useEffect(() => {
    if (!threadIdParam || !activeSessionId) return;
    if (sessionStatus === 'ended') return;
    const handler = () => {
      try {
        if (socket && isConnected) {
          socket.emit('end_session', {
            threadId: threadIdParam,
            sessionId: activeSessionId,
            role: 'user',
            reason: 'tab_closed',
          });
        }
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const body = new Blob(
            [JSON.stringify({ threadId: threadIdParam, sessionId: activeSessionId })],
            { type: 'application/json' }
          );
          navigator.sendBeacon('/api/chat/session/decline', body);
        }
      } catch {
        // best-effort — never block unload
      }
    };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
    };
  }, [socket, isConnected, threadIdParam, activeSessionId, sessionStatus]);

  // -------- mark thread as read --------
  useEffect(() => {
    if (!socket || !isConnected) return;
    if (!threadIdParam || !activeSessionId) return;
    if (sessionStatus === 'ended') return;
    socket.emit('read_message', { threadId: threadIdParam, sessionId: activeSessionId });
    setThreads((prev) =>
      prev.map((t) =>
        t.threadId === threadIdParam ? { ...t, userUnreadCount: 0 } : t
      )
    );
  }, [socket, isConnected, threadIdParam, activeSessionId, messages.length, sessionStatus]);

  // -------- session timer --------
  useEffect(() => {
    if (sessionStatus !== 'active') {
      setElapsedSecs(0);
      sessionStartedAtRef.current = null;
      return;
    }
    if (sessionStartedAtRef.current === null) {
      sessionStartedAtRef.current = Date.now();
    }
    const tick = () => {
      const start = sessionStartedAtRef.current;
      if (start === null) return;
      setElapsedSecs(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sessionStatus]);

  const sessionDurationLabel = useMemo(() => {
    if (sessionStatus !== 'active') return null;
    const m = Math.floor(elapsedSecs / 60);
    const s = elapsedSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [sessionStatus, elapsedSecs]);

  // -------- wallet balance --------
  const refreshBalance = useCallback(async () => {
    if (userRole === 'friend') return;
    setBalanceLoading(true);
    try {
      const b = await fetchWalletBalance();
      setWalletBalance(typeof b === 'number' ? b : null);
    } catch (err) {
      console.warn('[chat] balance fetch failed', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (!authed || userRole === 'friend') return;
    refreshBalance();
  }, [authed, userRole, refreshBalance]);

  useEffect(() => {
    if (sessionStatus !== 'active' || userRole === 'friend') return;
    const id = window.setInterval(() => refreshBalance(), 30_000);
    return () => window.clearInterval(id);
  }, [sessionStatus, userRole, refreshBalance]);

  const insufficientBalance = useMemo(() => {
    if (userRole === 'friend') return false;
    if (typeof walletBalance !== 'number') return false;
    return walletBalance < DEFAULT_CHAT_RPM * 2;
  }, [walletBalance, userRole]);

  // -------- composer handlers --------
  const handleReplyToMessage = useCallback(
    (m: UIMessage) => {
      const isMine = m.sender === 'user';
      const peer = activeThread?.providerId.name;
      setReplyTarget({
        id: m.id,
        authorLabel: isMine ? 'You' : peer || 'Astrologer',
        text: m.messageType === 'image' ? '' : m.text,
        imageUrl: m.messageType === 'image' ? m.fileLink : undefined,
      });
    },
    [activeThread]
  );

  const handleClearReply = useCallback(() => setReplyTarget(null), []);

  const handleSelectImages = useCallback((files: File[]) => {
    setPendingImages((prev) => {
      const next: PendingImage[] = [...prev];
      for (const f of files) {
        next.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
        });
      }
      return next;
    });
  }, []);

  const handleRemovePending = useCallback((id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const handleRecharge = useCallback(() => router.push('/wallet'), [router]);

  // -------- puja live (Phase 2) --------
  const schedulePujaLive = useCallback(
    (scheduledAt: Date) =>
      new Promise<void>((resolve, reject) => {
        if (!socket || !threadIdParam || !activeSessionId) {
          reject(new Error('Not connected. Please wait a moment and retry.'));
          return;
        }
        socket.emit(
          'schedule_pooja_live',
          { threadId: threadIdParam, sessionId: activeSessionId, scheduledAt: scheduledAt.toISOString() },
          (resp: { success?: boolean; message?: string; data?: PujaLive }) => {
            if (resp?.success) {
              if (resp.data) setPujaLive(resp.data);
              resolve();
            } else {
              reject(new Error(resp?.message || 'Failed to schedule.'));
            }
          }
        );
      }),
    [socket, threadIdParam, activeSessionId]
  );

  const joinPujaLive = useCallback(async () => {
    if (!activeSessionId) return;
    try {
      const res = await fetch('/api/calling/pooja-live-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        credentials: 'include',
        body: JSON.stringify({ sessionId: activeSessionId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json?.data?.token) throw new Error(json?.message || 'Could not start the puja live.');
      const { token, wsURL, roomName } = json.data;
      const qs = new URLSearchParams({ room: roomName, token, ws: wsURL, thread: threadIdParam || '' });
      router.push(`/pooja/live?${qs.toString()}`);
    } catch (e: any) {
      toast.error(e?.message || 'Could not join the puja live.');
    }
  }, [activeSessionId, threadIdParam, router]);

  // Whether the Join button should be live (from 5 min before the scheduled time).
  const pujaJoinable = useMemo(() => {
    void pujaTick; // re-evaluate on tick
    if (!pujaLive?.scheduledAt) return false;
    if (pujaLive.status === 'completed' || pujaLive.status === 'cancelled') return false;
    return Date.now() >= new Date(pujaLive.scheduledAt).getTime() - 5 * 60 * 1000;
  }, [pujaLive, pujaTick]);

  // -------- lightbox --------
  const galleryImages = useMemo(() => {
    return messages
      .filter((m) => m.messageType === 'image' && !!m.fileLink)
      .map((m) => ({
        id: m.id,
        url: m.fileLink || '',
        caption: m.text || undefined,
        senderName:
          m.sender === 'user' ? 'You' : activeThread?.providerId.name || 'Astrologer',
        timestamp: m.timestamp,
      }));
  }, [messages, activeThread]);

  const handleOpenImage = useCallback((messageId: string) => {
    setLightboxStartId(messageId);
    setLightboxOpen(true);
  }, []);

  const lightboxStartIndex = useMemo(() => {
    if (!lightboxStartId) return 0;
    const idx = galleryImages.findIndex((g) => g.id === lightboxStartId);
    return idx >= 0 ? idx : 0;
  }, [lightboxStartId, galleryImages]);

  // -------- action sheet --------
  const handleRequestActions = useCallback((m: UIMessage, isMine: boolean) => {
    setActionsTarget({
      id: m.id,
      text: m.text,
      isMine,
      isImage: m.messageType === 'image',
    });
  }, []);

  const handleActionReply = useCallback(
    (target: MessageActionsTarget) => {
      const m = messages.find((x) => x.id === target.id);
      if (m) handleReplyToMessage(m);
    },
    [messages, handleReplyToMessage]
  );

  const handleActionCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }, []);

  const handleActionDelete = useCallback((target: MessageActionsTarget) => {
    // Local-only hide — backend has no soft-delete contract.
    setMessages((prev) => prev.filter((m) => m.id !== target.id));
  }, []);

  // -------- post-session actions --------
  const handleRate = useCallback(() => setShowRating(true), []);

  const handleChatAgain = useCallback(async () => {
    if (!userId || !activeThread) return;
    if (chatAgainPending) return;
    setChatAgainPending(true);
    const providerId = activeThread.providerId._id;
    const providerName = activeThread.providerId.name || 'Astrologer';
    try {
      // 1. Check the astrologer's current status before opening a session so we
      //    can surface "offline" suggestions without burning a backend call.
      const cached =
        getCachedAstrologer(providerId) ||
        (await findOrFetchAstrologer(providerId).catch(() => null));
      const status = String(
        (cached as { status?: string } | null)?.status || ''
      ).toLowerCase();
      if (cached && status && status !== 'online') {
        setSuggestionModal({
          reason: status === 'busy' ? 'busy' : 'offline',
          name: providerName,
        });
        return;
      }

      // 2. Wallet pre-check — abort before hitting the backend if the user
      //    clearly can't sustain even a short session. Backend will also
      //    enforce, but blocking client-side avoids creating a session record
      //    that immediately ends from insufficient balance.
      if (userRole !== 'friend') {
        const latestBalance = await fetchWalletBalance().catch(() => null);
        const balance = typeof latestBalance === 'number' ? latestBalance : walletBalance;
        const rateGuess =
          Number((cached as { rpm?: number; chatRate?: number } | null)?.rpm) ||
          Number((cached as { chatRate?: number } | null)?.chatRate) ||
          DEFAULT_CHAT_RPM;
        const minNeeded = rateGuess * 2;
        if (typeof balance === 'number' && balance < minNeeded) {
          toast.error('Insufficient wallet balance. Please recharge to start a chat.');
          router.push('/wallet');
          return;
        }
      }

      // 3. Astrologer looks online (or status unknown) — try to create a session.
      const result = await createChatSession(userId, providerId);
      if (result.ok) {
        const qs = new URLSearchParams({
          threadId: result.data.threadId,
          sessionId: result.data.sessionId,
        });
        router.push(`/chat?${qs.toString()}`);
      } else {
        const msg = (result.error.message || '').toLowerCase();
        const isBusy =
          msg.includes('busy') ||
          msg.includes('decline') ||
          msg.includes('another session') ||
          msg.includes('in a session');
        const isOffline =
          msg.includes('offline') ||
          msg.includes('not online') ||
          msg.includes('not available') ||
          msg.includes('unavailable');
        if (isBusy || isOffline) {
          setSuggestionModal({
            reason: isBusy ? 'busy' : 'offline',
            name: providerName,
          });
        } else {
          console.warn('[chat] chat again failed:', result.error.message);
        }
      }
    } finally {
      setChatAgainPending(false);
    }
  }, [userId, activeThread, chatAgainPending, router]);

  const handleSendDakshina = useCallback(() => setShowDakshina(true), []);

  const fetchGifts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    const tryEndpoint = async (url: string, withAuth: boolean) => {
      const res = await fetch(url, {
        method: 'GET',
        headers: withAuth
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.gifts)
          ? json.gifts
          : Array.isArray(json)
            ? json
            : [];
      return list.length > 0 ? list : null;
    };

    const endpoints: Array<[string, boolean]> = [
      ['/api/calling/gift/get-gifts', true],
      [`${getApiBaseUrl()}/calling/api/gift/get-gifts`, true],
      [`${getApiBaseUrl()}/api/gift/get-gifts`, true],
      [`${getApiBaseUrl()}/gift/get-gifts`, true],
    ];

    for (const [url, withAuth] of endpoints) {
      try {
        const list = await tryEndpoint(url, withAuth);
        if (list) {
          const normalized = list
            .map((g: any) => ({ ...g, price: Math.round(Number(g.price) || 0) }))
            .sort((a: any, b: any) => a.price - b.price);
          setGifts(normalized);
          return;
        }
      } catch (err) {
        console.warn('[chat] fetchGifts failed for', url, err);
      }
    }
  }, []);

  const handleSendGift = useCallback(async (gift: any) => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (typeof gift._id === 'string' && gift._id.startsWith('preset_')) {
      fetchGifts();
      throw new Error('Offerings not loaded yet. Please try again.');
    }

    const receiverUserId = activeThread?.providerId?._id;
    if (!receiverUserId) {
      throw new Error('Astrologer not available.');
    }

    const price = Math.round(Number(gift.price) || 0);
    if (typeof walletBalance === 'number' && walletBalance < price) {
      throw new Error('Insufficient wallet balance. Please recharge your wallet.');
    }

    const response = await fetch(`/api/calling/gift/send-gift`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: gift._id,
        receiverUserId,
      }),
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to send Dakshina');
    }

    // Don't optimistically decrement — the brief flicker is worse than waiting
    // for the authoritative value from refreshBalance(). If the backend ever
    // returns a `newBalance` in the response, prefer that to skip the round trip.
    if (typeof data?.data?.newBalance === 'number') {
      setWalletBalance(data.data.newBalance);
    } else {
      refreshBalance();
    }
    return true;
  }, [activeThread, walletBalance, router, fetchGifts, refreshBalance]);

  // -------- selected session shape for child components --------
  const selectedSessionForHeader = useMemo(() => {
    if (!activeThread) return null;
    return {
      providerId: activeThread.providerId,
      userId: activeThread.userId,
      sessionId: activeThread.sessionId,
      status: sessionStatus,
    };
  }, [activeThread, sessionStatus]);

  const sidebarSessions = useMemo(
    () =>
      threads.map((t) => ({
        providerId: t.providerId,
        userId: t.userId,
        sessionId: t.sessionId,
        lastMessage: t.lastMessage,
        createdAt: t.createdAt,
        status: t.status,
        userUnreadCount: t.userUnreadCount,
        providerUnreadCount: t.providerUnreadCount,
      })),
    [threads]
  );

  const handleSelectSession = useCallback(
    (session: { sessionId: string }) => {
      const t = threads.find((tt) => tt.sessionId === session.sessionId);
      const qs = new URLSearchParams({ threadId: session.sessionId });
      if (t?.lastSessionId) qs.set('sessionId', t.lastSessionId);
      router.push(`/chat?${qs.toString()}`);
    },
    [router, threads]
  );

  // -------- render --------
  if (!authChecked) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-white"
        style={{ top: siteHeaderHeight }}
      >
        <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-white p-6"
        style={{ top: siteHeaderHeight }}
      >
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in to chat</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your conversations.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-xl bg-saffron-500 text-white font-medium hover:bg-saffron-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const showChatPanel = Boolean(threadIdParam);

  return (
    <div className="fixed inset-0 z-40 bg-white flex" style={{ top: siteHeaderHeight }}>
      {/* Sidebar — full width on mobile when no thread selected */}
      <div
        className={`${showChatPanel ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[340px] md:border-r md:border-saffron-100`}
      >
        <Sidebar
          sessions={sidebarSessions as never}
          selectedSession={
            activeThread
              ? ({
                  sessionId: activeThread.sessionId,
                  providerId: activeThread.providerId,
                  userId: activeThread.userId,
                  lastMessage: activeThread.lastMessage,
                  createdAt: activeThread.createdAt,
                  status: activeThread.status,
                } as never)
              : null
          }
          userRole={userRole}
          userBalance={walletBalance}
          balanceLoading={balanceLoading}
          loading={threadsLoading}
          error={threadsError}
          onSelectSession={handleSelectSession as never}
          onRefreshBalance={refreshBalance}
          onLoadMoreSessions={undefined}
          hasMoreSessions={false}
          loadingMore={false}
        />
      </div>

      {/* Chat panel */}
      <div
        className={`${showChatPanel ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full min-w-0`}
      >
        {!showChatPanel ? (
          <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-b from-saffron-50/40 to-white relative overflow-hidden">
            <div className="text-center px-6 relative z-10">
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-saffron-100/70" />
                <div className="absolute inset-2 rounded-full bg-white shadow-md ring-1 ring-saffron-100 flex items-center justify-center">
                  <span className="font-garamond text-4xl text-saffron-600 leading-none">ॐ</span>
                </div>
              </div>
              <h3 className="font-garamond text-2xl text-saffron-900 font-semibold mb-1.5">
                Pick a chat to begin
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Choose an astrologer from the list to continue your conversation.
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
              <span className="font-garamond text-[14rem] text-saffron-700 leading-none">ॐ</span>
            </div>
          </div>
        ) : !activeThread ? (
          <div className="flex-1 flex items-center justify-center bg-saffron-50/30">
            {messagesLoading ? (
              <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="text-center px-6">
                <p className="text-gray-700 font-medium mb-2">Conversation unavailable</p>
                <p className="text-sm text-gray-500 mb-4">
                  We couldn&apos;t load this thread. It may have ended or been removed.
                </p>
                <button
                  onClick={() => router.push('/chat')}
                  className="px-5 py-2.5 rounded-xl bg-saffron-500 text-white font-medium hover:bg-saffron-600"
                >
                  Back to chats
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <ChatHeader
              selectedSession={selectedSessionForHeader as never}
              userRole={userRole}
              insufficientBalance={insufficientBalance}
              endingSession={endingSession}
              onEndSession={requestEndSession}
              onContinueChat={handleChatAgain}
              sessionDuration={sessionDurationLabel}
              userBalance={walletBalance}
              peerTyping={typingFromOther}
            />

            {/* Pooja booking: connecting / accept strip */}
            {activeThread?.source === 'pooja' && sessionStatus !== 'active' && sessionStatus !== 'ended' && (
              userRole === 'friend' ? (
                <div className="flex items-center justify-between gap-2 bg-saffron-50 border-b border-saffron-100 px-3 py-2">
                  <span className="text-xs sm:text-sm text-saffron-800">🪔 New puja booking — accept to connect with the devotee.</span>
                  <button
                    onClick={() => { if (threadIdParam && activeSessionId) joinSessionRoom(threadIdParam, activeSessionId, true); }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-semibold"
                  >
                    Accept booking
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-saffron-50 border-b border-saffron-100 px-3 py-2">
                  <div className="w-3.5 h-3.5 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm text-saffron-800">Connecting astrologer… you&apos;ll be connected once the pandit accepts.</span>
                </div>
              )
            )}

            {/* Pooja: schedule / scheduled / join the private video puja */}
            {activeThread?.source === 'pooja' && sessionStatus === 'active' && (
              <div className="flex items-center justify-between gap-2 bg-emerald-50 border-b border-emerald-100 px-3 py-2">
                {pujaJoinable ? (
                  <>
                    <span className="text-xs sm:text-sm text-emerald-800 font-medium">🪔 Puja Live is ready to begin.</span>
                    <button onClick={joinPujaLive} className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold animate-pulse">
                      Join Puja Live
                    </button>
                  </>
                ) : pujaLive?.scheduledAt ? (
                  <>
                    <span className="text-xs sm:text-sm text-emerald-800">📅 Puja Live: {new Date(pujaLive.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <button onClick={() => setShowScheduleModal(true)} className="shrink-0 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-semibold hover:bg-emerald-100">
                      Reschedule
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm text-emerald-800">Ready for the puja? Schedule a live video session.</span>
                    <button onClick={() => setShowScheduleModal(true)} className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                      Schedule Puja Live
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Connection / balance banners */}
            <AnimatePresence>
              {!isConnected && sessionStatus !== 'ended' && (
                <motion.div
                  key="reconnect-banner"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs sm:text-sm px-3 py-2 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {lastConnectError
                        ? 'Cannot reach chat service — retrying…'
                        : 'Reconnecting to chat…'}
                    </span>
                  </div>
                </motion.div>
              )}
              {showReconnectedToast && sessionStatus !== 'ended' && (
                <motion.div
                  key="reconnected-banner"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-700 text-xs sm:text-sm px-3 py-1.5 flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Reconnected</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-h-0 relative">
              {loadingOlder && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-white/90 border border-saffron-100 px-3 py-1 rounded-full shadow-sm text-xs text-saffron-700 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
                  Loading older messages…
                </div>
              )}
              <ChatMessages
                ref={messagesEndRef}
                messages={messages}
                typingMessage={
                  typingFromOther
                    ? ({
                        id: 'typing',
                        text: '',
                        sender: 'astrologer',
                        timestamp: new Date().toISOString(),
                      } as UIMessage)
                    : null
                }
                userId={userId}
                userRole={userRole}
                selectedSession={
                  activeThread
                    ? {
                        userId: activeThread.userId,
                        providerId: activeThread.providerId,
                      }
                    : null
                }
                onReplyToMessage={handleReplyToMessage}
                onRetryMessage={retryMessage}
                onOpenImage={handleOpenImage}
                onRequestActions={handleRequestActions}
                sessionStatus={sessionStatus}
                onRate={handleRate}
                onSendDakshina={handleSendDakshina}
                onChatAgain={handleChatAgain}
              />


              {showJumpToBottom && (
                <button
                  onClick={scrollToBottom}
                  className="absolute right-3 bottom-3 z-20 w-10 h-10 rounded-full bg-white border border-saffron-100 shadow-md text-saffron-600 hover:bg-saffron-50 flex items-center justify-center"
                  title="Jump to latest"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
              )}
            </div>

            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={sendCurrentComposer}
              isDisabled={sessionStatus === 'ended' || !isConnected}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              replyTarget={replyTarget}
              onClearReply={handleClearReply}
              pendingImages={pendingImages}
              onSelectImages={handleSelectImages}
              onRemovePending={handleRemovePending}
              isInsufficient={insufficientBalance && sessionStatus === 'active'}
              onRecharge={handleRecharge}
              isSending={isSending}
            />

            {/* End-session confirmation modal */}
            <AnimatePresence>
              {showEndConfirm && (
                <motion.div
                  key="end-confirm-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
                  onClick={cancelEndSession}
                >
                  <motion.div
                    key="end-confirm-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5"
                  >
                    <h3 className="text-base font-semibold text-gray-900">End this session?</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your wallet will stop being charged. You can start a new session with this
                      astrologer anytime.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={cancelEndSession}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Keep chatting
                      </button>
                      <button
                        onClick={confirmEndSession}
                        disabled={endingSession}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                          endingSession
                            ? 'bg-red-300 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {endingSession ? 'Ending…' : 'End session'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={galleryImages.map(({ url, caption, senderName, timestamp }) => ({
          url,
          caption,
          senderName,
          timestamp,
        }))}
        startIndex={lightboxStartIndex}
        isOpen={lightboxOpen && galleryImages.length > 0}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Long-press / hover action sheet */}
      <MessageActionsSheet
        target={actionsTarget}
        onClose={() => setActionsTarget(null)}
        onReply={handleActionReply}
        onCopy={handleActionCopy}
        onDelete={handleActionDelete}
      />

      {/* Rating modal */}
      <RatingModal
        isOpen={showRating}
        onClose={() => {
          setShowRating(false);
          // Chat session is fully wrapped up — hard reload so the page (and
          // header wallet) reflects the post-chat state from scratch.
          if (sessionStatus === 'ended' && typeof window !== 'undefined') {
            window.location.href = '/chat';
          }
        }}
        onContinueChat={() => {
          setShowRating(false);
          handleChatAgain();
        }}
        onRatingSubmit={() => {
          // Backend has no rating endpoint exposed for chat; close after collecting locally.
          setShowRating(false);
          if (sessionStatus === 'ended' && typeof window !== 'undefined') {
            window.location.href = '/chat';
          }
        }}
      />

      {/* Schedule Puja Live modal */}
      <SchedulePujaLiveModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={schedulePujaLive}
      />

      {/* Offline / busy suggestion modal — shown when "Chat again" can't open
          a session because the astrologer is offline or busy. */}
      <OfflineAstrologerModal
        isOpen={suggestionModal !== null}
        onClose={() => setSuggestionModal(null)}
        offlineAstrologerName={suggestionModal?.name || 'Astrologer'}
        reason={suggestionModal?.reason || 'offline'}
      />

      {/* Dakshina modal */}
      <DakshinaModal
        isOpen={showDakshina}
        onClose={() => setShowDakshina(false)}
        onSend={handleSendGift}
        receiverName={activeThread?.providerId.name || 'Astrologer'}
        gifts={gifts}
        onFetchGifts={fetchGifts}
      />
    </div>
  );
}
