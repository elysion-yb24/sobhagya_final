'use client';

// Native chat page wired directly to the chat-service REST + Socket.IO
// (replaces the previous iframe-into-chat.sobhagya.in approach which was
// blocked by X-Frame-Options / CSP and CORS for localhost).
//
// Layout:
//   /chat                           → thread list (sidebar full width on mobile)
//   /chat?threadId=...&sessionId=...→ active conversation (sidebar hidden on mobile)
//
// Realtime: uses the global Socket.IO connection from `SessionManagerProvider`
// (path `/chat-socket/socket.io/`). Backend events used:
//   - emit `join_session`     → join the thread room
//   - emit `send_message`     → server saves + broadcasts `receive_message`
//   - emit `end_session`      → server broadcasts `session_ended`
//   - emit `typing`
//   - listen `receive_message`, `astrologer_joined`, `session_ended`, `typing`

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
  type BackendMessage,
  type BackendThread,
  type ChatThreadView,
} from '../utils/chat-api';
import { useSessionManager } from '../components/astrologers/SessionManager';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';

// Default chat rate per minute used when the backend doesn't expose one on the
// thread payload. Matches `partner.chatRpm` default in chat-service.
const DEFAULT_CHAT_RPM = 5;

interface UIMessage {
  id: string;
  text: string;
  sender: 'user' | 'astrologer' | 'system';
  timestamp: string;
  messageType?: 'text' | 'voice' | 'image' | 'video' | 'file' | 'options' | 'informative' | 'call';
  fileLink?: string;
  sentByName?: string;
  sentByProfileImage?: string;
  isAutomated?: boolean;
  clientMessageId?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
  messageId?: string;
}

/** Normalise a backend message into the UI message shape. */
function adaptMessage(
  msg: BackendMessage,
  currentUserId: string | null
): UIMessage {
  const mine = currentUserId && String(msg.sentBy) === String(currentUserId);
  // Welcome / system info messages from the bot
  const isInfo = msg.messageType === 'info' || msg.messageType === 'informative';
  return {
    id: String(msg._id || msg.chatId),
    messageId: String(msg._id || msg.chatId),
    text: msg.message || '',
    sender: isInfo ? 'system' : mine ? 'user' : 'astrologer',
    timestamp: msg.createdAt,
    messageType: (msg.messageType as UIMessage['messageType']) || 'text',
    fileLink: msg.fileLink,
    isAutomated: isInfo,
    deliveryStatus: mine ? 'sent' : undefined,
  };
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected, lastConnectError, joinSessionRoom } = useSessionManager();

  const threadIdParam = searchParams?.get('threadId') || null;
  const sessionIdParam = searchParams?.get('sessionId') || null;

  // -------- auth gate (runs only on client) --------
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');

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
      const adapted = (backendThreads as BackendThread[]).map((t) =>
        adaptThread(t, userId)
      );
      setThreads(adapted);
    } catch (err: any) {
      console.warn('[chat] loadThreads failed', err);
      setThreadsError(err?.message || 'Failed to load conversations');
    } finally {
      setThreadsLoading(false);
    }
  }, [authed, userId]);

  useEffect(() => {
    if (authed) loadThreads();
  }, [authed, loadThreads]);

  // -------- active thread / session --------
  const [activeThread, setActiveThread] = useState<ChatThreadView | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionIdParam
  );
  const [sessionStatus, setSessionStatus] =
    useState<'active' | 'ended' | 'pending'>('active');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [endingSession, setEndingSession] = useState(false);
  const [typingFromOther, setTypingFromOther] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Live billing/timer state.
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const sessionStartedAtRef = useRef<number | null>(null);

  // Load-older-history state.
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const loadingOlderRef = useRef(false);

  // Smart auto-scroll state.
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const isNearBottomRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Reconnection toast (briefly shown when isConnected flips false → true).
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

  // Track whether the user is near the bottom of the message list. Used to
  // (a) decide if we should auto-scroll on new messages and (b) toggle the
  // floating "↓ Jump to latest" button.
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const near = distanceFromBottom < 80;
      isNearBottomRef.current = near;
      setShowJumpToBottom(!near && messages.length > 0);

      // Trigger load-older when user reaches the top.
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

  // Auto-scroll to bottom only when the user is already near the bottom OR
  // the most-recent message is the user's own. Prevents yanking the viewport
  // away when the user scrolls up to read older messages.
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

    const HISTORY_PAGE = 20;
    (async () => {
      const [thread, history] = await Promise.all([
        fetchThreadById(threadIdParam),
        fetchMessages(threadIdParam, { limit: HISTORY_PAGE }),
      ]);
      if (cancelled) return;

      if (thread) {
        const view = adaptThread(thread, userId);
        // Backend may not return userProfileImage/providerProfileImage; fill
        // from the embedded `user`/`provider` fields if present.
        const t = thread as any;
        if (t.user?.avatar) view.userId.avatar = t.user.avatar;
        if (t.user?.name) view.userId.name = t.user.name;
        if (t.provider?.avatar) view.providerId.avatar = t.provider.avatar;
        if (t.provider?.name) view.providerId.name = t.provider.name;
        setActiveThread(view);
        setSessionStatus(view.status);
        // If sessionIdParam not in URL, fall back to lastSessionId from thread
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

  // Join the socket room once we have a connected socket + thread + session.
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

  // Wire socket events scoped to the active threadId.
  useEffect(() => {
    if (!socket) return;
    if (!threadIdParam) return;

    const onReceive = (msg: BackendMessage) => {
      if (!msg) return;
      if (msg.threadId && String(msg.threadId) !== String(threadIdParam)) return;
      const ui = adaptMessage(msg, userId);
      setMessages((prev) => {
        // De-dupe by chatId / _id
        if (prev.some((p) => p.id === ui.id)) return prev;
        return [...prev, ui];
      });
    };

    const onAstrologerJoined = (sessionData: any) => {
      if (!sessionData) return;
      if (sessionData.threadId && String(sessionData.threadId) !== String(threadIdParam)) return;
      setSessionStatus('active');
      // Show a friendly system message in the transcript.
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

    const onSessionEnded = (payload: any) => {
      const ended = payload?.data || payload;
      if (ended?.threadId && String(ended.threadId) !== String(threadIdParam)) return;
      setSessionStatus('ended');
      setMessages((prev) => [
        ...prev,
        {
          id: `session-ended-${Date.now()}`,
          text: 'Session has ended',
          sender: 'system',
          timestamp: new Date().toISOString(),
        },
      ]);
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

  // -------- load older history (paginate up) --------
  const loadOlderHistory = useCallback(async () => {
    if (loadingOlderRef.current || !hasMoreHistory || !threadIdParam) return;
    // Pick the genuinely-oldest timestamp; messages can arrive out of order
    // (initial load is newest-first; live ones are appended in arrival order).
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
        // Prepend older without losing any existing messages.
        const existingIds = new Set(prev.map((m) => m.id));
        const merged = [
          ...adapted.filter((m) => !existingIds.has(m.id)),
          ...prev,
        ];
        return merged;
      });
      setHasMoreHistory(older.length >= PAGE);

      // Restore scroll position so the user stays anchored to the same
      // message they were reading before the prepend.
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
  // Inner emit keeps the same `clientMessageId` across original-send and
  // retry so the optimistic bubble flips between sent → delivered/failed
  // without ever creating a duplicate row in the list.
  const emitSend = useCallback(
    (text: string, clientId: string) => {
      if (!socket || !isConnected) return;
      if (!threadIdParam || !activeSessionId) return;
      socket.emit(
        'send_message',
        {
          sessionId: activeSessionId,
          threadId: threadIdParam,
          sentBy: userId,
          message: text,
          messageType: 'text',
          fileLink: null,
          replyMessage: null,
          voiceMessageDuration: 0,
        },
        (response: any) => {
          if (!response?.success) {
            console.warn('[chat] send_message failed:', response?.message);
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMessageId === clientId
                  ? { ...m, deliveryStatus: 'failed' as const }
                  : m
              )
            );
          } else if (response?.data) {
            const saved = adaptMessage(response.data as BackendMessage, userId);
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMessageId === clientId
                  ? { ...saved, clientMessageId: clientId, deliveryStatus: 'delivered' as const }
                  : m
              )
            );
          }
        }
      );
    },
    [socket, isConnected, threadIdParam, activeSessionId, userId]
  );

  const sendMessage = useCallback(() => {
    const text = newMessage.trim();
    if (!text) return;
    if (!socket || !isConnected) return;
    if (!threadIdParam || !activeSessionId) return;
    if (sessionStatus === 'ended') return;

    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: UIMessage = {
      id: clientId,
      clientMessageId: clientId,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'text',
      deliveryStatus: 'sent',
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    // Sending guarantees we want to see the new bubble.
    isNearBottomRef.current = true;
    setShowJumpToBottom(false);

    emitSend(text, clientId);
  }, [newMessage, socket, isConnected, threadIdParam, activeSessionId, sessionStatus, emitSend]);

  const retryMessage = useCallback(
    (clientId: string) => {
      const target = messages.find((m) => m.clientMessageId === clientId);
      if (!target || !target.text) return;
      if (!socket || !isConnected) return;
      if (sessionStatus === 'ended') return;
      // Flip status back to 'sent' (in-flight) before re-emitting.
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientId ? { ...m, deliveryStatus: 'sent' as const } : m
        )
      );
      emitSend(target.text, clientId);
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

  // -------- end session (with confirmation) --------
  const requestEndSession = useCallback(() => setShowEndConfirm(true), []);
  const cancelEndSession = useCallback(() => setShowEndConfirm(false), []);

  const confirmEndSession = useCallback(async () => {
    if (!threadIdParam || !activeSessionId) return;
    if (endingSession) return;
    setShowEndConfirm(false);
    setEndingSession(true);
    try {
      // Prefer socket emit so other side gets `session_ended` immediately.
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
          // Safety timeout
          setTimeout(resolve, 4000);
        });
      } else {
        // Fallback to REST decline
        await apiDeclineSession(threadIdParam, activeSessionId);
      }
      setSessionStatus('ended');
    } catch (err) {
      console.warn('[chat] end session failed', err);
    } finally {
      setEndingSession(false);
    }
  }, [threadIdParam, activeSessionId, endingSession, socket, isConnected]);

  // -------- mark thread as read --------
  // Tells the backend the user has seen all current messages and clears the
  // local unread badge so the sidebar reflects it immediately. Triggered when
  // the active thread is opened and whenever a new message arrives while the
  // user is focused on this thread.
  useEffect(() => {
    if (!socket || !isConnected) return;
    if (!threadIdParam || !activeSessionId) return;
    if (sessionStatus === 'ended') return;
    socket.emit('read_message', { threadId: threadIdParam, sessionId: activeSessionId });
    setThreads((prev) =>
      prev.map((t) =>
        t.threadId === threadIdParam
          ? { ...t, userUnreadCount: 0, providerUnreadCount: t.providerUnreadCount }
          : t
      )
    );
  }, [socket, isConnected, threadIdParam, activeSessionId, messages.length, sessionStatus]);

  // -------- session timer (mm:ss) --------
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

  // Periodic balance refresh while a paid session is active.
  useEffect(() => {
    if (sessionStatus !== 'active' || userRole === 'friend') return;
    const id = window.setInterval(() => {
      refreshBalance();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [sessionStatus, userRole, refreshBalance]);

  const insufficientBalance = useMemo(() => {
    if (userRole === 'friend') return false;
    if (typeof walletBalance !== 'number') return false;
    return walletBalance < DEFAULT_CHAT_RPM * 2;
  }, [walletBalance, userRole]);

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
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white" style={{ top: 64 }}>
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white p-6" style={{ top: 64 }}>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in to chat</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your conversations.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const showChatPanel = Boolean(threadIdParam);

  return (
    <div className="fixed inset-0 z-40 bg-white flex" style={{ top: 64 }}>
      {/* Sidebar — full width on mobile when no thread selected */}
      <div
        className={`${showChatPanel ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 md:border-r md:border-gray-200`}
      >
        <Sidebar
          sessions={sidebarSessions as any}
          selectedSession={
            activeThread
              ? ({
                  sessionId: activeThread.sessionId,
                  providerId: activeThread.providerId,
                  userId: activeThread.userId,
                  lastMessage: activeThread.lastMessage,
                  createdAt: activeThread.createdAt,
                  status: activeThread.status,
                } as any)
              : null
          }
          userRole={userRole}
          userBalance={walletBalance}
          balanceLoading={balanceLoading}
          loading={threadsLoading}
          error={threadsError}
          onSelectSession={handleSelectSession as any}
          onRefreshBalance={refreshBalance}
          onLoadMoreSessions={undefined}
          hasMoreSessions={false}
          loadingMore={false}
        />
      </div>

      {/* Chat panel */}
      <div className={`${showChatPanel ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full min-w-0`}>
        {!showChatPanel ? (
          <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">Choose a chat from the list to start messaging.</p>
            </div>
          </div>
        ) : !activeThread ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            {messagesLoading ? (
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="text-center px-6">
                <p className="text-gray-700 font-medium mb-2">Conversation unavailable</p>
                <p className="text-sm text-gray-500 mb-4">We couldn&apos;t load this thread. It may have ended or been removed.</p>
                <button
                  onClick={() => router.push('/chat')}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
                >
                  Back to chats
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <ChatHeader
              selectedSession={selectedSessionForHeader as any}
              userRole={userRole}
              insufficientBalance={insufficientBalance}
              endingSession={endingSession}
              onEndSession={requestEndSession}
              sessionDuration={sessionDurationLabel}
              userBalance={walletBalance}
              peerTyping={typingFromOther}
            />

            {/* Reconnect / connection-down banner. Sticky above messages. */}
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
                  <div className="bg-orange-50 border-b border-orange-200 text-orange-700 text-xs sm:text-sm px-3 py-2 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
                  <div className="bg-green-50 border-b border-green-200 text-green-700 text-xs sm:text-sm px-3 py-1.5 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reconnected</span>
                  </div>
                </motion.div>
              )}
              {insufficientBalance && sessionStatus === 'active' && (
                <motion.div
                  key="low-balance-banner"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs sm:text-sm px-3 py-2 flex items-center justify-between gap-2">
                    <span>Low balance — please recharge to keep this session running.</span>
                    <button
                      onClick={() => router.push('/payment')}
                      className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-xs font-medium hover:bg-amber-700"
                    >
                      Recharge
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-h-0 relative">
              {loadingOlder && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-white/90 border border-gray-200 px-3 py-1 rounded-full shadow-sm text-xs text-gray-600 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Loading older messages…
                </div>
              )}
              <ChatMessages
                ref={messagesEndRef as any}
                messages={messages as any}
                typingMessage={
                  typingFromOther
                    ? ({
                        id: 'typing',
                        text: '',
                        sender: 'astrologer',
                        timestamp: new Date().toISOString(),
                      } as any)
                    : null
                }
                userId={userId}
                userRole={userRole}
                selectedSession={
                  activeThread
                    ? ({
                        userId: activeThread.userId,
                        providerId: activeThread.providerId,
                      } as any)
                    : null
                }
                onReplyToMessage={() => {}}
                onRetryMessage={retryMessage}
                sessionStatus={sessionStatus}
              />
              {showJumpToBottom && (
                <button
                  onClick={scrollToBottom}
                  className="absolute right-3 bottom-3 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md text-orange-600 hover:bg-orange-50 flex items-center justify-center"
                  title="Jump to latest"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
            </div>

            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={sendMessage}
              isDisabled={sessionStatus === 'ended' || !isConnected}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
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
                      Your wallet will stop being charged. You can start a new session with this astrologer anytime.
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
    </div>
  );
}
