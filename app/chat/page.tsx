'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import RatingModal from '../components/ui/RatingModal';
import ReconnectionModal from '../components/ui/ReconnectionModal';
import { useSessionManager } from '../components/astrologers/SessionManager';
import {
  fetchThreads,
  fetchMessages,
  createChatSession,
  adaptThread,
  fetchChatServiceStatus,
  uploadChatFile,
  type BackendMessage,
} from '../utils/chat-api';

// -------------------- Types --------------------
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'astrologer' | 'system';
  timestamp: string;
  messageType?: 'text' | 'voice' | 'image' | 'video' | 'file' | 'options' | 'informative' | 'call';
  fileLink?: string;
  replyMessage?: {
    id: string;
    message: string;
    replyTo: string;
    replyBy: string;
    messageType: string;
    voiceMessageDuration?: number;
  };
  sentByName?: string;
  sentByProfileImage?: string;
  voiceMessageDuration?: number;
  messageId?: string;
  options?: Array<{
    optionId: string;
    optionText: string;
    nextFlow?: string;
    disabled?: boolean;
  }>;
  isAutomated?: boolean;
  clientMessageId?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
}

interface PopulatedUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface Session {
  providerId: PopulatedUser;
  userId: PopulatedUser;
  /** Historical name; stores the backend's `threadId` (persistent conversation key). */
  sessionId: string;
  /** Alias for `sessionId` to improve readability. */
  threadId?: string;
  /** Current live session document id (backend `session._id`). Needed for
   *  send_message, end_session socket events. May be null for ended threads. */
  lastSessionId?: string | null;
  lastMessage: string;
  createdAt: string;
  status: 'active' | 'ended' | 'pending';
  userUnreadCount?: number;
  providerUnreadCount?: number;
}

// -------------------- Component --------------------
export default function ChatPage() {
  // States
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState<boolean>(false);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [showRating, setShowRating] = useState<boolean>(false);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>('00:00:00');
  // Mobile-first: sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Open sidebar on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [sessionsPage, setSessionsPage] = useState<number>(1);
  const [hasMoreSessions, setHasMoreSessions] = useState<boolean>(true);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState<boolean>(false);
  const [showReconnectionModal, setShowReconnectionModal] = useState<boolean>(false);
  const [wasDisconnected, setWasDisconnected] = useState<boolean>(false);
  const [lastActiveSession, setLastActiveSession] = useState<Session | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [automatedFlowCompleted, setAutomatedFlowCompleted] = useState<boolean>(false);
  const [sessionLeftDialogOpen, setSessionLeftDialogOpen] = useState<boolean>(false);
  const [threadsLoading, setThreadsLoading] = useState<boolean>(true);

  // Refs
  const selectedSessionRef = useRef<Session | null>(selectedSession);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const sentMessageIds = useRef<Set<string>>(new Set());

  // Router / Query
  const router = useRouter();
  const searchParams = useSearchParams();

  // Socket from context
  const { socket, isConnected, joinSessionRoom: joinRoom } = useSessionManager();

  // -------------------- Effects --------------------

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    const storedUser = localStorage.getItem('userDetails');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      setUserRole(user.role);
    }

    // Check for reconnection on page load
    const lastSession = localStorage.getItem('lastActiveSession');
    const wasDisconnectedFlag = localStorage.getItem('wasDisconnected') === 'true';

    if (lastSession && wasDisconnectedFlag) {
      try {
        const sessionData = JSON.parse(lastSession);
        setLastActiveSession(sessionData);
        setWasDisconnected(true);
        console.log('Page load - found disconnected session:', sessionData.sessionId);
      } catch (error) {
        console.error('Error parsing last active session:', error);
        localStorage.removeItem('lastActiveSession');
        localStorage.removeItem('wasDisconnected');
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserBalance();
    }
  }, [userId]);

  // Probe the chat backend once — surface outages so users don't sit on a
  // spinner waiting for threads that will never load.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { ok } = await fetchChatServiceStatus();
      if (cancelled) return;
      if (!ok) {
        toast.error('Chat service is temporarily unavailable. Please try again shortly.');
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchUserBalance();
    }, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  // Load chat threads via REST (backend has no `get_all_sessions` socket event).
  // `GET /api/chat/threads` returns the raw backend thread docs; we adapt each
  // into the `Session` shape the UI already uses.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    setThreadsLoading(true);
    (async () => {
      try {
        const { threads, hasMore } = await fetchThreads({ limit: 20 });
        if (cancelled) return;
        const adapted: Session[] = threads.map((t) => {
          const view = adaptThread(t, userId);
          return {
            providerId: view.providerId,
            userId: view.userId,
            sessionId: view.sessionId,
            threadId: view.threadId,
            lastSessionId: view.lastSessionId,
            lastMessage: view.lastMessage,
            createdAt: view.createdAt,
            status: view.status,
            userUnreadCount: view.userUnreadCount,
            providerUnreadCount: view.providerUnreadCount,
          };
        });
        setSessions(adapted);
        setHasMoreSessions(hasMore);
        setSessionsPage(1);
      } catch (err) {
        console.error('[chat] Failed to fetch threads:', err);
        if (!cancelled) toast.error('Failed to fetch chats');
      } finally {
        if (!cancelled) setThreadsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      if (selectedSession && selectedSession.status === 'active') {
        console.log('Setting wasDisconnected to true for session:', selectedSession.sessionId);
        setWasDisconnected(true);
        setLastActiveSession(selectedSession);

        localStorage.setItem('lastActiveSession', JSON.stringify(selectedSession));
        localStorage.setItem('wasDisconnected', 'true');
      }
    });

    // Handle socket reconnection
    socket.on('connect', () => {
      console.log('Socket reconnected');
      const storedDisconnected = localStorage.getItem('wasDisconnected') === 'true';
      const storedSession = localStorage.getItem('lastActiveSession');

      console.log('Reconnection check - wasDisconnected:', wasDisconnected, 'storedDisconnected:', storedDisconnected);
      console.log('Current selectedSession:', selectedSession?.sessionId, 'storedSession:', storedSession ? JSON.parse(storedSession).sessionId : 'none');

      if ((wasDisconnected || storedDisconnected) && (lastActiveSession || storedSession)) {
        const sessionToCheck = lastActiveSession || (storedSession ? JSON.parse(storedSession) : null);

        // Check if we're still on the same session
        if (selectedSession?.sessionId === sessionToCheck?.sessionId) {
          console.log('Showing reconnection modal for session:', selectedSession?.sessionId);
          setShowReconnectionModal(true);
        }
        setWasDisconnected(false);
        localStorage.removeItem('wasDisconnected');
        localStorage.removeItem('lastActiveSession');
      }
    });

    // Handle incoming messages
    socket.on('receive_message', (msg: any) => {
      // The frontend's sessionId is actually a threadId from get_all_sessions
      const currentSessionId = selectedSessionRef.current?.sessionId;
      const msgThreadId = msg.threadId?.toString() || msg._doc?.threadId?.toString();
      const msgSessionId = msg.sessionId?.toString() || msg._doc?.sessionId?.toString();
      if (currentSessionId && msgThreadId !== currentSessionId && msgSessionId !== currentSessionId) return;

      // ✅ FIX: Check if this is a duplicate message from sender
      if (msg.clientMessageId && sentMessageIds.current.has(msg.clientMessageId)) {
        return; // Skip duplicate message
      }

      // Add client message ID to sent messages set
      if (msg.clientMessageId) {
        sentMessageIds.current.add(msg.clientMessageId);
      }

      // ✅ FIX: Correct sender detection - check _doc.sentBy
      let sender: 'user' | 'astrologer' | 'system' = 'astrologer';

      // Get the actual sentBy value from the correct location
      const sentById = msg._doc?.sentBy || msg.sentBy;

      if (msg.sentBy === 'system' || msg.isAutomated || msg.sentByName === 'Support Bot' || msg.sentByName === 'Sobhagya') {
        sender = 'system';
      } else {
        // Convert both to strings for comparison
        const currentUserId = String(userId);

        if (String(sentById) === currentUserId) {
          sender = 'user';
        } else {
          sender = 'astrologer';
        }
      }

      const newMsg: Message = {
        id: msg._doc?._id || msg._id || msg.clientMessageId || `msg-${Date.now()}`,
        text: msg.message,
        sender,
        timestamp: msg._doc?.createdAt || msg.createdAt || new Date().toISOString(),
        messageType: msg.messageType || 'text',
        fileLink: msg.fileLink,
        sentByName: msg.sentByName,
        sentByProfileImage: msg.sentByProfileImage,
        messageId: msg.messageId,
        options: msg.options || [],
        isAutomated: msg.isAutomated || false,
        clientMessageId: msg.clientMessageId,
        deliveryStatus: sender === 'user' ? 'delivered' : undefined
      };

      setMessages(prev => [...prev, newMsg]);

      // Clear typing indicator when new message arrives
      setTypingMessage(null);

      // Show validation errors as toast notifications
      if (msg.messageId === 'INVALID_INPUT') {
        if (msg.message?.includes('inappropriate details')) {
          toast.error('You have entered inappropriate details, please try again.');
        } else if (msg.message?.includes('Invalid choice')) {
          toast.error('Invalid choice, please select a valid option.');
        } else {
          toast.error('Please check your input and try again.');
        }
      }
    });

    // Handle typing indicator.
    // Backend emits just `{ isTyping }` scoped to the thread room.
    socket.on('typing', (data: any) => {
      if (!selectedSessionRef.current) return;
      if (data && data.isTyping === false) {
        setTypingMessage(null);
        return;
      }

      setTypingMessage({
        id: 'typing',
        text: 'typing...',
        sender: 'astrologer',
        timestamp: new Date().toISOString(),
        messageType: 'text'
      });

      setTimeout(() => setTypingMessage(null), 2000);
    });

    socket.on('session_ended', (data: any) => {
      // Backend sends { success, data: endedSession, message }
      // endedSession has threadId which matches frontend's sessionId
      const endedSession = data.data || data;
      const matchId = endedSession?.threadId?.toString() || data.sessionId || endedSession?._id?.toString();
      const currentSessionId = selectedSessionRef.current?.sessionId;

      if (currentSessionId && (currentSessionId === matchId || currentSessionId === data.sessionId)) {
        setSelectedSession(prev => prev ? { ...prev, status: 'ended' } : prev);
        setShowRating(true);
        toast.success('Session ended');
        fetchUserBalance();

        // Clear session duration timer for friend role users
        if (userRole === 'friend') {
          setSessionStartTime(null);
          setSessionDuration('00:00:00');
        }

        // Clear session start time from localStorage
        localStorage.removeItem(`session_${currentSessionId}_start`);
      }

      // Update session in sidebar
      setSessions(prev => prev.map(session =>
        (session.sessionId === matchId || session.sessionId === data.sessionId)
          ? { ...session, status: 'ended' }
          : session
      ));
    });

    socket.on('astrologer_joined', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'active' } : prev);
        const astrologerName = selectedSessionRef.current?.providerId?.name || 'Astrologer';
        toast.success(`${astrologerName} has joined! Session started`);
        const joinMsg: Message = {
          id: `provider-joined-${Date.now()}`,
          text: `🎉 ${astrologerName} has joined the session! You can now start your consultation.`,
          sender: 'system',
          timestamp: new Date().toISOString(),
          messageType: 'informative',
          isAutomated: true
        };
        setMessages(prev => [...prev, joinMsg]);
        fetchUserBalance();

        // Reset session duration timer for friend role users
        if (userRole === 'friend') {
          setSessionStartTime(new Date());
          setSessionDuration('00:00:00');
        }
      }

      // Update session in sidebar
      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, status: 'active' }
          : session
      ));
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('astrologer_joined');
      socket.off('session_ended');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, [socket, userId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      // Check if user is near bottom before auto-scrolling (like WhatsApp)
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
        // Smooth scroll to bottom
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  // Separate effect for typing message to always scroll
  useEffect(() => {
    if (typingMessage && chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [typingMessage]);

  // Session duration timer for friend role users
  useEffect(() => {
    if (userRole !== 'friend' || !selectedSession) {
      setSessionStartTime(null);
      setSessionDuration('00:00:00');
      return;
    }

    // Set session start time when session becomes active
    if (selectedSession.status === 'active' && !sessionStartTime) {
      setSessionStartTime(new Date());
    }

    // Clear session start time when session ends
    if (selectedSession.status === 'ended' && sessionStartTime) {
      setSessionStartTime(null);
      setSessionDuration('00:00:00');
    }
  }, [selectedSession, userRole, sessionStartTime]);

  // Update session duration every second
  useEffect(() => {
    if (!sessionStartTime || userRole !== 'friend' || !selectedSession || selectedSession.status !== 'active') {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setSessionDuration(formattedDuration);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, userRole, selectedSession]);

  // Show rating modal when session becomes ended (only for non-friend users)
  useEffect(() => {
    if (selectedSession && selectedSession.status === 'ended' && !hasRated && !showRating && userRole !== 'friend') {
      console.log('Session status changed to ended, showing rating modal');
      setShowRating(true);
    }
  }, [selectedSession, hasRated, showRating, userRole]);

  // Ensure we join the socket room whenever socket connects (or the selected
  // session gains a live session id). Without this, selecting a chat before
  // the socket finishes connecting means the user never receives `receive_message`.
  useEffect(() => {
    if (!socket || !isConnected || !userId) return;
    if (!selectedSession || !selectedSession.lastSessionId) return;
    joinRoom(selectedSession.sessionId, selectedSession.lastSessionId, false);
  }, [socket, isConnected, userId, selectedSession?.sessionId, selectedSession?.lastSessionId]);

  // Reset unread count when a session is selected
  useEffect(() => {
    if (selectedSession && userRole) {
      const unreadCount = (userRole === 'user' || userRole === 'friend') ? selectedSession.userUnreadCount : selectedSession.providerUnreadCount;
      if (unreadCount && unreadCount > 0) {
        // Reset unread count immediately when session is selected
        setSessions(prev => prev.map(s =>
          s.sessionId === selectedSession.sessionId
            ? {
              ...s,
              userUnreadCount: (userRole === 'user' || userRole === 'friend') ? 0 : s.userUnreadCount,
              providerUnreadCount: userRole === 'provider' ? 0 : s.providerUnreadCount
            }
            : s
        ));
      }
    }
  }, [selectedSession, userRole]);

  // Show reconnection modal when session is selected and we have a last active session
  useEffect(() => {
    if (selectedSession && lastActiveSession &&
      selectedSession.sessionId === lastActiveSession.sessionId &&
      lastActiveSession.status === 'active') {
      console.log('Showing reconnection modal - session match found');
      setShowReconnectionModal(true);
    }
  }, [selectedSession, lastActiveSession]);

  // Additional check for stored disconnected session when session is selected
  useEffect(() => {
    if (selectedSession && !showReconnectionModal) {
      const storedSession = localStorage.getItem('lastActiveSession');
      const wasDisconnectedFlag = localStorage.getItem('wasDisconnected') === 'true';

      if (storedSession && wasDisconnectedFlag) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (selectedSession.sessionId === sessionData.sessionId && sessionData.status === 'active') {
            console.log('Showing reconnection modal - stored session match found');
            setShowReconnectionModal(true);
            setLastActiveSession(sessionData);
            setWasDisconnected(true);
          }
        } catch (error) {
          console.error('Error parsing stored session:', error);
        }
      }
    }
  }, [selectedSession, showReconnectionModal]);

  // Check for page refresh scenario - if user refreshes while in an active session
  useEffect(() => {
    if (selectedSession && selectedSession.status === 'active' && !wasDisconnected) {
      // Check if this might be a page refresh scenario
      const sessionStartTime = localStorage.getItem(`session_${selectedSession.sessionId}_start`);
      if (sessionStartTime) {
        const timeDiff = Date.now() - parseInt(sessionStartTime);
        // If more than 5 minutes have passed, consider it a reconnection scenario
        if (timeDiff > 5 * 60 * 1000) {
          setLastActiveSession(selectedSession);
          setShowReconnectionModal(true);
        }
      } else {
        // Store session start time
        localStorage.setItem(`session_${selectedSession.sessionId}_start`, Date.now().toString());
      }
    }
  }, [selectedSession, wasDisconnected]);

  // Sync the URL (threadId / sessionId query params) with the selected session.
  // Astrologer card navigates with `?threadId=<tid>&sessionId=<live sid>`.
  // Sidebar navigates with `?sessionId=<tid>` (legacy naming — sessionId is the threadId).
  useEffect(() => {
    const threadParam = searchParams?.get('threadId') ?? null;
    const sessionParam = searchParams?.get('sessionId') ?? null;
    const threadIdFromUrl = threadParam || sessionParam;
    // sessionParam is a live session id only when threadId is explicitly present.
    const explicitSessionId = threadParam ? sessionParam : null;

    if (!threadIdFromUrl) {
      // No session in URL — clear current selection.
      if (selectedSession) {
        setSelectedSession(null);
        setMessages([]);
        setShowRating(false);
        setAutomatedFlowCompleted(false);
      }
      return;
    }

    // Wait until the threads list finishes loading before trying to match.
    if (sessions.length === 0) return;

    const foundSession = sessions.find(s => s.sessionId === threadIdFromUrl);
    if (foundSession) {
      // If the URL carries a fresh sessionId (e.g. just-created via
      // createChatSession on the astrologer card), prefer it over whatever
      // the REST threads list returned (which may be stale).
      const resolved: Session = explicitSessionId && explicitSessionId !== threadIdFromUrl
        ? { ...foundSession, lastSessionId: explicitSessionId, status: 'active' }
        : foundSession;

      // Skip if we're already viewing this thread with the same live session.
      if (
        selectedSession &&
        selectedSession.sessionId === resolved.sessionId &&
        selectedSession.lastSessionId === resolved.lastSessionId
      ) {
        return;
      }

      setSelectedSession(resolved);
      setMessages([]);

      const unreadCount = (userRole === 'user' || userRole === 'friend') ? resolved.userUnreadCount : resolved.providerUnreadCount;
      if (unreadCount && unreadCount > 0) {
        setSessions(prev => prev.map(s =>
          s.sessionId === resolved.sessionId
            ? {
              ...s,
              userUnreadCount: (userRole === 'user' || userRole === 'friend') ? 0 : s.userUnreadCount,
              providerUnreadCount: userRole === 'provider' ? 0 : s.providerUnreadCount
            }
            : s
        ));
      }

      // Always load messages via REST.
      loadMessages(resolved.sessionId);

      // Join the room if we have a live session id.
      const liveSid = resolved.lastSessionId;
      if (socket && isConnected && userId && liveSid) {
        joinRoom(resolved.sessionId, liveSid, false);
        if (unreadCount && unreadCount > 0) {
          markMessagesAsRead(resolved.sessionId);
        }
      }

      setHasRated(false);
      if (resolved.status === 'ended' && userRole !== 'friend') {
        setShowRating(true);
      }
    } else {
      // Thread not in our list — probably just created by the astrologer card
      // flow before the threads REST call completes. We'll pick it up on the
      // next list refresh. Don't emit any legacy `session_update` event here;
      // the backend doesn't implement it.
      console.log('[chat] Thread not in sessions list yet, waiting for refresh:', threadIdFromUrl);
      setHasRated(false);
    }
  }, [searchParams, sessions, userId, hasRated, socket, isConnected, userRole]);

  // ... (rest of the code remains the same)
  // thread doc's `_id`. The REST endpoint returns descending-sorted messages,
  // so we reverse them for chronological display.
  const loadMessages = async (threadId: string) => {
    if (!threadId) return;
    try {
      const raw = await fetchMessages(threadId, { limit: 20 });
      const ordered = raw.slice().reverse(); // oldest first
      const currentUserId = String(userId || '');

      const formattedMessages: Message[] = ordered.map((msg) => {
        let sender: 'user' | 'astrologer' | 'system' = 'astrologer';
        if (msg.messageType === 'info' || (msg as any).isAutomated) {
          sender = 'system';
        } else if (String(msg.sentBy) === currentUserId) {
          sender = 'user';
        }
        const uiType: Message['messageType'] =
          msg.messageType === 'info' || msg.messageType === 'informative'
            ? 'informative'
            : (msg.messageType as Message['messageType']) || 'text';

        return {
          id: msg.chatId || msg._id || `msg-${Date.now()}-${Math.random()}`,
          text: msg.message || '',
          sender,
          timestamp: msg.createdAt || new Date().toISOString(),
          messageType: uiType,
          fileLink: msg.fileLink,
          voiceMessageDuration: msg.voiceMessageDuration,
          isAutomated: Boolean((msg as any).isAutomated),
          deliveryStatus: sender === 'user' ? 'delivered' : undefined,
        };
      });
      setMessages(formattedMessages);

      // ✅ Check for ongoing automated flow after messages are loaded
      if (selectedSession) {
        setTimeout(() => {
          checkAndContinueAutomatedFlow(selectedSession);
        }, 500); // Small delay to ensure messages are set
      }
    } catch (err) {
      console.error('[chat] loadMessages failed:', err);
    }
  };

  // Mark messages as read via backend socket `read_message` event.
  // Backend signature: { readBy, providerId, userId }. Argument name `sessionId`
  // here is a UI alias for threadId (kept for backwards compatibility).
  const markMessagesAsRead = (sessionId: string) => {
    if (!socket || !userId) return;

    const session = sessions.find(s => s.sessionId === sessionId);
    if (!session) return;

    socket.emit('read_message', {
      readBy: userId,
      providerId: session.providerId._id,
      userId: session.userId._id,
    }, (response: any) => {
      if (response?.error) {
        console.error('Failed to mark messages as read:', response.message);
      } else {
        setSessions(prev => prev.map(s =>
          s.sessionId === sessionId
            ? {
              ...s,
              userUnreadCount: (userRole === 'user' || userRole === 'friend') ? 0 : s.userUnreadCount,
              providerUnreadCount: userRole === 'provider' ? 0 : s.providerUnreadCount
            }
            : s
        ));
      }
    });
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    // Don't reset flow state - let backend handle continuation

    // Close sidebar on mobile after selecting session
    if (typeof window !== 'undefined' && window.innerWidth < 768) { // md breakpoint
      setSidebarOpen(false);
    }

    router.push(`/chat?sessionId=${session.sessionId}`);

    // Immediately reset unread count in UI when session is selected
    const unreadCount = (userRole === 'user' || userRole === 'friend') ? session.userUnreadCount : session.providerUnreadCount;
    if (unreadCount && unreadCount > 0) {
      setSessions(prev => prev.map(s =>
        s.sessionId === session.sessionId
          ? {
            ...s,
            userUnreadCount: (userRole === 'user' || userRole === 'friend') ? 0 : s.userUnreadCount,
            providerUnreadCount: userRole === 'provider' ? 0 : s.providerUnreadCount
          }
          : s
      ));
    }

    // Load messages via REST (no socket dependency).
    loadMessages(session.sessionId);

    // Join the socket room so we receive realtime `receive_message` events.
    // `joinRoom` needs both threadId (= session.sessionId) and the live
    // sessionId (= session.lastSessionId). If lastSessionId is missing the
    // thread is considered ended and there's nothing to join.
    if (socket && isConnected && userId && session.lastSessionId) {
      joinRoom(session.sessionId, session.lastSessionId, false);
      if (unreadCount && unreadCount > 0) {
        markMessagesAsRead(session.sessionId);
      }
    }

    setHasRated(false);
    if (session.status === 'ended' && userRole !== 'friend') {
      setShowRating(true);
    }
  };

  // Backend chat-service does NOT implement `start_automated_flow` /
  // `user_response` events, so the automated-flow branch is gone. We keep
  // `checkAndContinueAutomatedFlow` as a typed no-op so existing call sites
  // don't break at compile time.
  const checkAndContinueAutomatedFlow = (_session: Session) => { /* no-op */ };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession || !socket || !userId || isSubmitting) return;

    // Backend requires a live session to accept messages.
    const liveSessionId = selectedSession.lastSessionId;
    if (!liveSessionId) {
      toast.error('Session has ended. Start a new chat to continue.');
      return;
    }

    setIsSubmitting(true);

    const messageToSend = newMessage;
    setNewMessage('');

    const clientMessageId = `temp-${Date.now()}`;

    // Optimistic local echo.
    const optimisticMessage: Message = {
      id: clientMessageId,
      text: messageToSend,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'text',
      clientMessageId,
      deliveryStatus: 'sent'
    };
    setMessages(prev => [...prev, optimisticMessage]);
    // Track the clientMessageId so the echoed `receive_message` from the
    // server doesn't add a duplicate bubble.
    sentMessageIds.current.add(clientMessageId);

    socket.emit(
      'send_message',
      {
        sessionId: liveSessionId,
        threadId: selectedSession.sessionId,
        sentBy: userId,
        message: messageToSend,
        messageType: 'text',
        clientMessageId,
      },
      (response: any) => {
        setIsSubmitting(false);
        if (!response?.success) {
          toast.error(response?.message || 'Failed to send message');
          setNewMessage(messageToSend);
          setMessages(prev => prev.filter(m => m.clientMessageId !== clientMessageId));
          return;
        }
        setMessages(prev => prev.map(m =>
          m.clientMessageId === clientMessageId
            ? { ...m, deliveryStatus: 'delivered', id: response?.data?.chatId || m.id }
            : m
        ));
      }
    );
  };

  // Backend `typing` event signature: { threadId, isTyping }. Broadcast is
  // room-scoped so no extra identifiers are needed.
  const handleTyping = () => {
    if (!selectedSession || !socket || !userId) return;
    socket.emit('typing', { threadId: selectedSession.sessionId, isTyping: true });
  };

  const handleStopTyping = () => {
    if (!selectedSession || !socket || !userId) return;
    socket.emit('typing', { threadId: selectedSession.sessionId, isTyping: false });
  };

  // Option/menu selection is not supported by the current backend — leave
  // as a no-op so JSX callers (ChatMessages onOptionSelect) don't crash.
  const handleOptionSelect = (_optionId: string, _messageId: string) => { /* no-op */ };

  const handleFileUpload = async (file: File) => {
    if (!selectedSession || !socket || !userId) return;
    const liveSessionId = selectedSession.lastSessionId;
    if (!liveSessionId) {
      toast.error('Session has ended. Start a new chat to continue.');
      return;
    }

    const uploaded = await uploadChatFile(file);
    if (!uploaded?.fileLink) {
      toast.error('File upload failed');
      return;
    }

    let messageType: 'image' | 'video' | 'file' = 'file';
    if (file.type.startsWith('image/')) messageType = 'image';
    else if (file.type.startsWith('video/')) messageType = 'video';

    const clientMessageId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: clientMessageId,
      text: file.name,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType,
      fileLink: uploaded.fileLink,
      clientMessageId,
      deliveryStatus: 'sent',
    };
    setMessages((prev) => [...prev, optimistic]);
    sentMessageIds.current.add(clientMessageId);

    socket.emit(
      'send_message',
      {
        sessionId: liveSessionId,
        threadId: selectedSession.sessionId,
        sentBy: userId,
        message: file.name,
        messageType,
        fileLink: uploaded.fileLink,
        clientMessageId,
      },
      (response: any) => {
        if (!response?.success) {
          toast.error(response?.message || 'Failed to send file');
          setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
          return;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...m, deliveryStatus: 'delivered', id: response?.data?.chatId || m.id }
              : m
          )
        );
      }
    );
  };

  const handleEndSession = () => setShowEndSessionDialog(true);

  const confirmEndSession = () => {
    if (!selectedSession || !socket || !userId) return;
    socket.emit('end_session', {
      threadId: selectedSession.sessionId,
      sessionId: (selectedSession as any).lastSessionId || selectedSession.sessionId,
      role: userRole === 'friend' ? 'friend' : 'user',
      reason: 'user_ended'
    });
    setShowEndSessionDialog(false);
  };

  const handleRatingSubmit = (rating: number) => {
    setHasRated(true);
    setShowRating(true);
    toast.success('Thank you for your rating!');
  };

  const handleCloseRating = () => {
    setShowRating(false);
    // Reset hasRated to allow rating again if user reopens the session
    setHasRated(false);
  };

  const handleContinueChat = () => {
    if (!selectedSession || !socket || !userId) return;

    // Close the rating modal if it's open
    setShowRating(false);

    // Resume the session
    socket.emit('session_resume', {
      sessionId: selectedSession.sessionId,
      userId,
      providerId: selectedSession.providerId._id
    });
    setSelectedSession(prev => prev ? { ...prev, status: 'pending' } : prev);
    toast.success('Session resumed! Waiting for astrologer to join...');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const loadMoreSessions = () => {
    if (!socket || !isConnected || !userId || !userRole || loadingMoreSessions || !hasMoreSessions) return;

    setLoadingMoreSessions(true);
    const nextPage = sessionsPage + 1;

    socket.emit('get_all_sessions', {
      userId,
      role: userRole,
      page: nextPage,
      limit: 20
    }, (response: any) => {
      setLoadingMoreSessions(false);
      if (response.success && response.data?.sessions) {
        setSessions(prev => [...prev, ...response.data.sessions]);
        setSessionsPage(nextPage);
        setHasMoreSessions(response.data.hasMore || false);
      } else {
        toast.error(response.message || 'Failed to load more sessions');
      }
    });
  };

  const fetchUserBalance = async (): Promise<number> => {
    if (!userId) return 0;
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) return 0;
      const response = await fetch('/api/wallet-balance', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const balance = data.data.balance || 0;
          setUserBalance(balance);
          return balance;
        }
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
    return 0;
  };

  const handleDeleteSession = (session: Session) => {
    if (!socket || !userId || !userRole) return;

    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;

    // Use clear_chat event which handles both session_update and deletion
    socket.emit('clear_chat', {
      sessionId: session.sessionId,
      userId
    }, (response: any) => {
      if (response.success) {
        toast.success('Session deleted successfully');


        setSessions(prev => prev.filter(s => s.sessionId !== session.sessionId));

        // If this was the selected session, clear selection and update URL
        if (selectedSession?.sessionId === session.sessionId) {
          setSelectedSession(null);
          setMessages([]);

          // Remove sessionId from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('sessionId');
          window.history.replaceState({}, '', newUrl.toString());
        }
      } else {
        toast.error(response.message || 'Failed to delete session');
      }
    })
  }

  // Reconnection modal handlers
  const handleContinueSession = () => {
    setShowReconnectionModal(false);
    setLastActiveSession(null);
    // Continue with the current session - no additional action needed
    toast.success('Continuing where you left off...');
  };

  const handleRestartSession = () => {
    if (!selectedSession || !socket || !userId) return;

    setShowReconnectionModal(false);
    setLastActiveSession(null);

    // Clear the current session and start fresh
    setMessages([]);

    // Emit a restart session event to the server
    socket.emit('restart_session', {
      sessionId: selectedSession.sessionId,
      userId,
      providerId: selectedSession.providerId._id
    }, (response: any) => {
      if (response?.error) {
        console.error('Failed to restart session:', response.message);
        toast.error('Failed to restart session');
      } else {
        toast.success('Session restarted! Starting fresh...');
        // Reload messages for the fresh session
        loadMessages(selectedSession.sessionId);
      }
    });
  };

  const handleCloseReconnectionModal = () => {
    setShowReconnectionModal(false);
    setLastActiveSession(null);
  };


  const triggerReconnectionModal = () => {
    if (selectedSession) {
      console.log('Manually triggering reconnection modal');
      setLastActiveSession(selectedSession);
      setShowReconnectionModal(true);
    }
  };

  // Add to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerReconnectionModal = triggerReconnectionModal;
    }
  }, [selectedSession]);

  // Mobile swipe gesture to close sidebar
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!sidebarOpen) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Check for left swipe (to close sidebar)
      if (
        deltaX < -50 && // Swipe left at least 50px
        Math.abs(deltaY) < Math.abs(deltaX) && // More horizontal than vertical
        deltaTime < 300 // Quick swipe (less than 300ms)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  // -------------------- UI --------------------
  return (
    <div className="fixed inset-0 bg-white z-40 md:top-16 lg:top-20" style={{
      top: '64px', // Mobile header height
      WebkitOverflowScrolling: 'touch' // iOS smooth scrolling
    }}>
      <div className="flex h-full overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div className={`
          transition-all duration-300 ease-in-out overflow-hidden bg-white
          ${sidebarOpen
            ? 'w-full sm:w-80 md:w-80' // Mobile: full width, SM+: 320px
            : 'w-0'
          }
          ${sidebarOpen ? 'absolute md:relative z-50 md:z-auto' : 'relative'}
        `}
          style={{
            height: '100%'
          }}>
          <Sidebar
            sessions={sessions}
            selectedSession={selectedSession}
            userRole={userRole}
            userBalance={userBalance}
            balanceLoading={false}
            loading={threadsLoading}
            error={null}
            onSelectSession={handleSelectSession}
            onRefreshBalance={fetchUserBalance}
            onToggleSidebar={toggleSidebar}
            onLoadMoreSessions={loadMoreSessions}
            hasMoreSessions={hasMoreSessions}
            loadingMore={loadingMoreSessions}
            onDeleteSession={handleDeleteSession}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 min-w-0" style={{
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Mobile hamburger menu - always show on mobile */}
          <div className="md:hidden bg-white px-3 py-2 border-b border-gray-200 flex-shrink-0 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {selectedSession && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-semibold">
                      {typeof selectedSession.providerId !== 'string'
                        ? selectedSession.providerId?.name?.charAt(0) || 'A'
                        : 'A'
                      }
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {typeof selectedSession.providerId !== 'string'
                      ? selectedSession.providerId?.name || 'Astrologer'
                      : 'Astrologer'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {selectedSession ? (
            <>
              {/* ✅ Header shows User info if astrologer (friend role) */}
              <div className="flex-shrink-0">
                <ChatHeader
                  selectedSession={selectedSession}
                  userRole={userRole}
                  onEndSession={handleEndSession}
                  onContinueChat={handleContinueChat}
                  insufficientBalance={false}
                  endingSession={false}
                  sessionDuration={userRole === 'friend' ? sessionDuration : null}

                />
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-hidden relative">
                <ChatMessages
                  ref={chatContainerRef}
                  messages={messages}
                  typingMessage={typingMessage}
                  userId={userId}
                  userRole={userRole}
                  selectedSession={selectedSession}
                  sessionStatus={selectedSession.status}
                  automatedFlowCompleted={automatedFlowCompleted}
                  onReplyToMessage={() => { }}
                  onOptionSelect={handleOptionSelect}
                />

                {/* ✅ Rating only for users, not for astrologers (friend) */}
                {userRole !== 'friend' && (
                  <RatingModal
                    isOpen={showRating}
                    onRatingSubmit={handleRatingSubmit}
                    onContinueChat={handleContinueChat}
                    onClose={handleCloseRating}
                  />
                )}

                {/* Reconnection Modal */}
                <ReconnectionModal
                  isOpen={showReconnectionModal}
                  onContinue={handleContinueSession}
                  onRestart={handleRestartSession}
                  onClose={handleCloseReconnectionModal}
                  astrologerName={selectedSession?.providerId?.name || 'Astrologer'}
                />
              </div>

              {/* Show waiting loader if flow completed and session pending */}
              {selectedSession.status === 'pending' && automatedFlowCompleted && (
                <div className="flex-shrink-0 px-3 md:px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-orange-200">
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    <span className="text-orange-700 text-xs md:text-sm font-medium text-center">
                      Waiting for {typeof selectedSession.providerId !== 'string' ? selectedSession.providerId?.name || 'astrologer' : 'astrologer'} to join...
                    </span>
                  </div>
                </div>
              )}

              {/* ✅ Input disabled until session active for astrologers */}
              <div className="flex-shrink-0">
                <ChatInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  onStopTyping={handleStopTyping}
                  onFileUpload={handleFileUpload}
                  isDisabled={
                    isSubmitting ||
                    (userRole === 'friend' && selectedSession.status !== 'active') ||
                    selectedSession.status === 'ended' ||
                    (userBalance !== null && userBalance <= 0 && userRole !== 'friend')
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center overflow-hidden relative p-4">
              {/* Empty state with Sobhagya Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="opacity-5 md:opacity-10 blur-sm transform scale-75 md:scale-150">
                  <img
                    src="/sobhagya-logo.svg"
                    alt="Sobhagya Logo"
                    className="w-48 h-48 md:w-96 md:h-96 object-contain"
                  />
                </div>
              </div>

              <div className="text-center relative z-10 max-w-sm mx-auto">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-gray-700 text-lg md:text-xl font-semibold mb-2">
                  {userRole === 'friend' ? 'Waiting for User Requests' : 'Welcome to Sobhagya Chat'}
                </h3>
                <p className="text-gray-500 text-base md:text-lg font-medium mb-1">
                  {userRole === 'friend' ? 'Select a user to start consultation' : 'Start your consultation'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {userRole === 'friend' ? 'Manage your active consultations here' : 'Connect with our experienced astrologers'}
                </p>

                {/* Mobile action button */}
                <div className="md:hidden">
                  <button
                    onClick={toggleSidebar}
                    className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors active:scale-95"
                  >
                    View Chats
                  </button>
                </div>

                {/* Desktop hint */}
                <div className="hidden md:block mt-6 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-orange-600 text-sm">
                    Select a chat from the sidebar to start messaging
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* End session dialog - Mobile optimized */}
        {showEndSessionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm md:max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">End Session</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">Are you sure you want to end this session? This action cannot be undone.</p>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <button
                    onClick={() => setShowEndSessionDialog(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEndSession}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition-all font-medium"
                  >
                    End Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );

}