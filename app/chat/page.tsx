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
import { getUserDetails, isAuthenticated } from '../utils/auth-utils';
import { fetchWalletBalance } from '../utils/production-api';
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
} from '../utils/chat-api';
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
import SessionEndedCard from '../components/chat/SessionEndedCard';
import RatingModal from '../components/ui/RatingModal';
import DakshinaModal from '../components/calling/ui/DakshinaModal';

const DEFAULT_CHAT_RPM = 5;

// Default in-app dakshina gift menu — backend currently has no chat-side gift fetch,
// so we surface a sensible local set to keep the post-session flow working without
// touching the backend. Pricing aligns with the calling-side dakshina tiers.
const DEFAULT_DAKSHINA_GIFTS = [
  { _id: 'd-11', name: 'Diya', icon: 'diya', price: 11 },
  { _id: 'd-21', name: 'Lotus', icon: 'lotus', price: 21 },
  { _id: 'd-51', name: 'Namaste', icon: 'namaste', price: 51 },
  { _id: 'd-101', name: 'Nakshatra', icon: 'nakshatra', price: 101 },
  { _id: 'd-251', name: 'Trishul', icon: 'trishul', price: 251 },
  { _id: 'd-501', name: 'Om', icon: 'om', price: 501 },
];

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
  const [chatAgainPending, setChatAgainPending] = useState(false);

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
  const wasConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (!wasConnectedRef.current && isConnected) {
      setShowReconnectedToast(true);
      const t = setTimeout(() => setShowReconnectedToast(false), 1500);
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
        if (!sessionIdParam && view.lastSessionId) {
          setActiveSessionId(view.lastSessionId);
        }
      } else {
        setActiveThread(null);
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
      const ok = await joinSessionRoom(threadIdParam, activeSessionId, false);
      if (!cancelled && !ok) {
        console.warn('[chat] join_session failed (will keep retrying via socket reconnects)');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [socket, isConnected, threadIdParam, activeSessionId, joinSessionRoom]);

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
      setTypingFromOther(Boolean(payload?.isTyping));
    };

    socket.on('receive_message', onReceive);
    socket.on('astrologer_joined', onAstrologerJoined);
    socket.on('session_ended', onSessionEnded);
    socket.on('typing', onTyping);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('astrologer_joined', onAstrologerJoined);
      socket.off('session_ended', onSessionEnded);
      socket.off('typing', onTyping);
    };
  }, [socket, threadIdParam, userId]);

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
          };
          setMessages((prev) => [...prev, optimistic]);

          const result = await uploadChatFile(img.file);
          if (!result?.fileLink) {
            setMessages((prev) =>
              prev.map((m) => (m.clientMessageId === cid ? { ...m, deliveryStatus: 'failed' } : m))
            );
            URL.revokeObjectURL(img.previewUrl);
            continue;
          }

          // Patch optimistic with real fileLink so the bubble shows the persisted URL.
          setMessages((prev) =>
            prev.map((m) => (m.clientMessageId === cid ? { ...m, fileLink: result.fileLink } : m))
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
    (clientId: string) => {
      const target = messages.find((m) => m.clientMessageId === clientId);
      if (!target) return;
      if (!socket || !isConnected) return;
      if (sessionStatus === 'ended') return;
      setMessages((prev) =>
        prev.map((m) => (m.clientMessageId === clientId ? { ...m, deliveryStatus: 'sent' } : m))
      );
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

  const handleRecharge = useCallback(() => router.push('/payment'), [router]);

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
    try {
      const result = await createChatSession(userId, activeThread.providerId._id);
      if (result.ok) {
        const qs = new URLSearchParams({
          threadId: result.data.threadId,
          sessionId: result.data.sessionId,
        });
        router.push(`/chat?${qs.toString()}`);
      } else {
        console.warn('[chat] chat again failed:', result.error.message);
      }
    } finally {
      setChatAgainPending(false);
    }
  }, [userId, activeThread, chatAgainPending, router]);

  const handleSendDakshina = useCallback(() => setShowDakshina(true), []);

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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white shadow-md flex items-center justify-center text-3xl">
                🕉️
              </div>
              <h3 className="font-garamond text-xl text-saffron-900 font-semibold mb-1">
                Pick a chat to begin
              </h3>
              <p className="text-sm text-gray-500">
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
        onClose={() => setShowRating(false)}
        onContinueChat={() => {
          setShowRating(false);
          handleChatAgain();
        }}
        onRatingSubmit={() => {
          // Backend has no rating endpoint exposed for chat; close after collecting locally.
          setShowRating(false);
        }}
      />

      {/* Dakshina modal */}
      <DakshinaModal
        isOpen={showDakshina}
        onClose={() => setShowDakshina(false)}
        onSend={() => setShowDakshina(false)}
        receiverName={activeThread?.providerId.name || 'Astrologer'}
        gifts={DEFAULT_DAKSHINA_GIFTS}
      />
    </div>
  );
}
