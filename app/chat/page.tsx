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
  sessionId: string;
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

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchUserBalance();
    }, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!socket || !isConnected || !userId || !userRole) return;

    const loadSessions = (append: boolean = false) => {
      socket.emit('get_all_sessions', {
        userId,
        role: userRole,

      }, (response: any) => {
        if (response.success && response.data?.sessions) {
          if (append) {
            setSessions(prev => [...prev, ...response.data.sessions]);
          } else {
            setSessions(response.data.sessions);
          }
          setHasMoreSessions(response.data.hasMore || false);
        } else {
          toast.error(response.message || 'Failed to fetch sessions');
        }
      });
    };

    loadSessions();
  }, [socket, isConnected, userId, userRole]);

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
      if (msg.sessionId !== selectedSessionRef.current?.sessionId) return;

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

    // Handle typing indicator
    socket.on('typing', (data: any) => {
      if (data.sessionId !== selectedSessionRef.current?.sessionId) return;

      setTypingMessage({
        id: 'typing',
        text: 'typing...',
        sender: 'astrologer',
        timestamp: new Date().toISOString(),
        messageType: 'text'
      });


      // Clear typing indicator after 2 seconds (more responsive like WhatsApp)
      setTimeout(() => {
        setTypingMessage(null);
      }, 2000);
    });

    // ✅ FIX: Handle session status updates
    socket.on('session_started', (data: any) => {
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

    socket.on('session_ended', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
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
        localStorage.removeItem(`session_${data.sessionId}_start`);
      }

      // Update session in sidebar
      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, status: 'ended' }
          : session
      ));
    });

    socket.on('session_resumed', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        const newStatus = data.data?.status || 'pending';
        setSelectedSession(prev => prev ? { ...prev, status: newStatus } : prev);
    
        if (newStatus === 'active') {
          toast.success('Session resumed and astrologer is online!');
        } else {
          toast('Session resumed, waiting for astrologer...', { icon: '⏳' });
          // Don't add waiting message here - let it be handled by sessionStatus
        }
        fetchUserBalance();
      }
    
    
      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, status: data.data?.status || 'pending' }
          : session
      ));
    });
    

    socket.on('session_status_updated', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: data.status } : prev);
        if (data.status === 'pending') {
          toast('Session is pending, waiting for astrologer to join', { icon: 'ℹ️' });
        }
      }


      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, status: data.status }
          : session
      ));
    });

   
    socket.on('unread_count_updated', (data: any) => {
      if (data.sessionId) {
        setSessions(prev => prev.map(session =>
          session.sessionId === data.sessionId
            ? {
              ...session,
              userUnreadCount: data.userUnreadCount || 0,
              providerUnreadCount: data.providerUnreadCount || 0
            }
            : session
        ));
      }
    });

    
    socket.on('messages_marked_read', (data: any) => {
      if (data.sessionId) {
        setSessions(prev => prev.map(session =>
          session.sessionId === data.sessionId
            ? {
              ...session,
              userUnreadCount: data.userUnreadCount || 0,
              providerUnreadCount: data.providerUnreadCount || 0
            }
            : session
        ));
        
        // Update message status to read if it's the current session
        if (selectedSessionRef.current?.sessionId === data.sessionId && data.readBy !== userId) {
          setMessages(prev => prev.map(msg => {
            if (msg.sender === 'user' && msg.deliveryStatus !== 'read') {
              return { ...msg, deliveryStatus: 'read' };
            }
            return msg;
          }));
        }
      }
    });

   
    socket.on('session_deleted', (data: any) => {
      if (data.sessionId) {
        console.log('Session deleted from backend:', data.sessionId);
        
      
        setSessions(prev => prev.filter(s => s.sessionId !== data.sessionId));
        
       
        if (selectedSession?.sessionId === data.sessionId) {
          setSelectedSession(null);
          setMessages([]);
          
          
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('sessionId');
          window.history.replaceState({}, '', newUrl.toString());
          
          toast.success('Session has been deleted');
        }
      }
    });

   
    socket.on('automated_flow_started', (data: any) => {
      console.log('Automated flow started for session:', data.sessionId);
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setAutomatedFlowCompleted(false);
      }
    });

    socket.on('automated_flow_completed', (data: any) => {
      console.log('Automated flow completed for session:', data.sessionId);

      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setAutomatedFlowCompleted(true);
      }
    });
    // Listen for session created events
    socket.on('session_created', (data: any) => {
      console.log('Session created:', data);
      if (data.sessionId) {
        // Add the new session to the sessions list
        setSessions(prev => {
          const existingSession = prev.find(s => s.sessionId === data.sessionId);
          if (!existingSession) {
            return [...prev, {
              sessionId: data.sessionId,
              providerId: data.data?.providerId || { _id: data.sessionId, name: 'Astrologer', avatar: undefined },
              userId: data.data?.userId || { _id: userId || 'temp-user', name: 'User', avatar: undefined },
              lastMessage: 'Session created',
              createdAt: new Date().toISOString(),
              status: 'pending' as const,
              userUnreadCount: 0,
              providerUnreadCount: 0
            }];
          }
          return prev;
        });

        router.push(`/chat?sessionId=${data.sessionId}`);
        if (userId) {
          socket.emit('start_automated_flow', {
            sessionId: data.sessionId,
            userId,
            providerId: data.data?.providerId?._id || data.sessionId,
            flowType: 'PENDING_SESSION_FLOW'
          });
        }
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('session_started');
      socket.off('session_ended');
      socket.off('session_resumed');
      socket.off('session_status_updated');
      socket.off('unread_count_updated');
      socket.off('messages_marked_read');
      socket.off('automated_flow_started');
      socket.off('automated_flow_completed');
      socket.off('session_created');
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

  // ✅ Check for ongoing automated flow when messages change
  useEffect(() => {
    if (selectedSession && messages.length > 0) {
      // Small delay to ensure the flow check happens after messages are fully loaded
      const timer = setTimeout(() => {
        checkAndContinueAutomatedFlow(selectedSession);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [messages, selectedSession]);

  useEffect(() => {
    if (!searchParams || sessions.length === 0) return;
    const sessionIdFromUrl = searchParams.get('sessionId');


    if (!sessionIdFromUrl) {
      setSelectedSession(null);
      setMessages([]);
      setShowRating(false);
      setAutomatedFlowCompleted(false);
      return;
    }

    // Check if user left and returned to session
    const lastSession = localStorage.getItem('lastActiveSessionId');
    const sessionLeftTimestamp = localStorage.getItem('sessionLeftTimestamp');
    
    if (lastSession === sessionIdFromUrl && sessionLeftTimestamp) {
      const leftTime = parseInt(sessionLeftTimestamp);
      const timeDiff = Date.now() - leftTime;
      // If user left less than 30 minutes ago, show return dialog
      if (timeDiff < 30 * 60 * 1000) {
        setSessionLeftDialogOpen(true);
        localStorage.removeItem('sessionLeftTimestamp');
      }
    }

    const foundSession = sessions.find(s => s.sessionId === sessionIdFromUrl);
    if (foundSession) {
      setSelectedSession(foundSession);
      setMessages([]);

      // Immediately reset unread count in UI when session is opened from URL
      const unreadCount = (userRole === 'user' || userRole === 'friend') ? foundSession.userUnreadCount : foundSession.providerUnreadCount;
      if (unreadCount && unreadCount > 0) {
        setSessions(prev => prev.map(s =>
          s.sessionId === foundSession.sessionId
            ? {
              ...s,
              userUnreadCount: (userRole === 'user' || userRole === 'friend') ? 0 : s.userUnreadCount,
              providerUnreadCount: userRole === 'provider' ? 0 : s.providerUnreadCount
            }
            : s
        ));
      }

      if (socket && isConnected && userId) {
        joinRoom(foundSession.sessionId, foundSession.providerId._id);
        loadMessages(foundSession.sessionId);

        // Mark messages as read when session is opened from URL
        if (unreadCount && unreadCount > 0) {
          markMessagesAsRead(foundSession.sessionId);
        }
      }

      setHasRated(false);


      if (foundSession.status === 'ended' && userRole !== 'friend') {
        console.log('Session ended from URL, showing rating modal');
        setShowRating(true);
      }
    } else {
      // Session not found in sessions list, create a new session
      // This happens when clicking chat button from astrologers page
      console.log('Session not found in sessions list, creating new session for:', sessionIdFromUrl);

      if (socket && isConnected && userId) {
        // Create a new session using session_update
        socket.emit('session_update', {
          sessionId: sessionIdFromUrl,
          userId: userId,
          role: userRole,
          providerId: sessionIdFromUrl
        }, (response: any) => {
          if (response?.error) {
            console.error('Failed to create session:', response.message);
            toast.error('Failed to create chat session');
          } else {
            console.log('Session created successfully:', response);

            // Create a temporary session object for display
            const tempSession = {
              sessionId: sessionIdFromUrl,
              providerId: { _id: sessionIdFromUrl, name: 'Astrologer', avatar: undefined },
              userId: { _id: userId || 'temp-user', name: 'User', avatar: undefined },
              lastMessage: 'Session created',
              createdAt: new Date().toISOString(),
              status: 'pending' as const,
              userUnreadCount: 0,
              providerUnreadCount: 0
            };

            setSelectedSession(tempSession);
            setMessages([]);
            router.push(`/chat?sessionId=${sessionIdFromUrl}`);

            // Join the room and load messages
            joinRoom(sessionIdFromUrl, sessionIdFromUrl);
            loadMessages(sessionIdFromUrl);

            // // Start automated flow for pending session
            // socket.emit('start_automated_flow', {
            //   sessionId: sessionIdFromUrl,
            //   userId: userId,
            //   providerId: sessionIdFromUrl,
            //   flowType: 'PENDING_SESSION_FLOW'
            // });
          }
        });
      }

      setHasRated(false);
    }
  }, [searchParams, sessions, socket, isConnected, userId, hasRated]);

  // -------------------- Handlers --------------------

  const loadMessages = (sessionId: string) => {
    if (!socket || !isConnected) return;
    socket.emit('get_messages', { sessionId, limit: 10, skip: 0, userId }, (response: any) => {
      if (response?.success && response.data?.messages) {
        const formattedMessages = response.data.messages.map((msg: any) => {
          // ✅ FIX: Better sender detection for loaded messages
          let sender: 'user' | 'astrologer' | 'system' = 'astrologer';

          const sentById = msg.sentBy; // For loaded messages, sentBy is at top level

          if (msg.sentBy === 'system' || msg.isAutomated || msg.sentByName === 'Support Bot' || msg.sentByName === 'Sobhagya') {
            sender = 'system';
          } else {
            const currentUserId = String(userId);

            if (String(sentById) === currentUserId) {
              sender = 'user';
            } else {
              sender = 'astrologer';
            }
          }

          return {
            id: msg._id || `msg-${Date.now()}`,
            text: msg.message,
            sender,
            timestamp: msg.createdAt || new Date().toISOString(),
            messageType: msg.messageType || 'text',
            fileLink: msg.fileLink,
            sentByName: msg.sentByName,
            sentByProfileImage: msg.sentByProfileImage,
            messageId: msg.messageId,
            options: msg.options || [],
            isAutomated: msg.isAutomated || false,
            deliveryStatus: sender === 'user' ? 'delivered' : undefined
          };
        });
        setMessages(formattedMessages);

        // ✅ Check for ongoing automated flow after messages are loaded
        if (selectedSession) {
          setTimeout(() => {
            checkAndContinueAutomatedFlow(selectedSession);
          }, 500); // Small delay to ensure messages are set
        }
      }
    });
  };

  const markMessagesAsRead = (sessionId: string) => {
    if (!socket || !isConnected || !userId) return;

    // Find the session to get the correct IDs
    const session = sessions.find(s => s.sessionId === sessionId);
    if (!session) return;

    // Emit read_message event to mark messages as read
    socket.emit('read_message', {
      readBy: userId,
      providerId: session.providerId._id,
      userId: session.userId._id,
      sessionId: sessionId
    }, (response: any) => {
      if (response?.error) {
        console.error('Failed to mark messages as read:', response.message);
      } else {
        console.log('Messages marked as read successfully');
        // Update the session's unread count to 0 based on user role
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

    if (socket && isConnected && userId) {
      joinRoom(session.sessionId, session.providerId._id);
      loadMessages(session.sessionId);

      // Mark messages as read when user clicks on session
      if (unreadCount && unreadCount > 0) {
        markMessagesAsRead(session.sessionId);
      }

      // Start automated flow for pending sessions
      if (session.status === 'pending' && (userRole === 'user' || userRole === 'friend')) {
        socket.emit('start_automated_flow', {
          sessionId: session.sessionId,
          userId: userId,
          providerId: session.providerId._id,
          flowType: 'PENDING_SESSION_FLOW'
        });
      }

      // ✅ Check for ongoing automated flow after a short delay
      setTimeout(() => {
        checkAndContinueAutomatedFlow(session);
      }, 1500);
    }

    // Reset rating state for new session
    setHasRated(false);

    // Show rating modal if session is ended and user hasn't rated yet (only for non-friend users)
    if (session.status === 'ended' && userRole !== 'friend') {
      console.log('Session ended, showing rating modal');
      setShowRating(true);
    }
  };

  // ✅ NEW: Check if session needs automated flow continuation
  const checkAndContinueAutomatedFlow = (session: Session) => {
    if (!socket || !isConnected || !userId || !(userRole === 'user' || userRole === 'friend')) {
      return;
    }

    // Check if the last message in the session is from the bot/system and has options
    // This indicates an ongoing automated flow that needs continuation
    const lastMessage = messages[messages.length - 1];
    const hasOngoingFlow = lastMessage &&
      (lastMessage.sender === 'system' || lastMessage.isAutomated) &&
      lastMessage.options &&
      lastMessage.options.length > 0;

    if (hasOngoingFlow) {
      console.log('🔄 Detected ongoing automated flow, restarting...');
      socket.emit('start_automated_flow', {
        sessionId: session.sessionId,
        userId: userId,
        providerId: session.providerId._id
        // Let backend determine correct flowType from session state
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession || !socket || !userId || isSubmitting) return;
    
    setIsSubmitting(true);

    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    const clientMessageId = `temp-${Date.now()}`;

    // Add optimistic message immediately for instant feedback
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

    // Check if we're in an automated flow waiting for user input
    const lastBotMessage = [...messages].reverse().find(m => 
      (m.isAutomated || m.sender === 'system') && 
      m.messageId && 
      (!m.options || m.options.length === 0) &&
      m.messageType !== 'options'
    );

    // If there's an automated message without options, it's waiting for text input
    if (lastBotMessage && lastBotMessage.messageId) {
      // Send as user_response for automated flow
      socket.emit('user_response', {
        sessionId: selectedSession.sessionId,
        selectedOptionId: messageToSend, // Backend expects this parameter name
        messageId: lastBotMessage.messageId,
        userId: userId
      }, (response: any) => {
        setIsSubmitting(false);
        if (response?.error) {
          toast.error('Failed to send message');
          setNewMessage(messageToSend);
          setMessages(prev => prev.filter(m => m.clientMessageId !== clientMessageId));
        } else {
          // Update delivery status to delivered
          setMessages(prev => prev.map(m => 
            m.clientMessageId === clientMessageId 
              ? { ...m, deliveryStatus: 'delivered' }
              : m
          ));
        }
      });
    } else {
      // Send as regular message (no messageId to prevent double processing)
      socket.emit(
        'send_message',
        {
          message: messageToSend,
          sessionId: selectedSession.sessionId,
          sentBy: userId,
          messageType: 'text',
          clientMessageId
          // Deliberately NOT sending messageId to prevent backend double processing
        },
      (response: any) => {
        setIsSubmitting(false);
        if (response?.error) {
          toast.error('Failed to send message');
          setNewMessage(messageToSend); // restore input if failed
          // Remove optimistic message on error
          setMessages(prev => prev.filter(m => m.clientMessageId !== clientMessageId));
        } else {
          // Update delivery status to delivered
          setMessages(prev => prev.map(m => 
            m.clientMessageId === clientMessageId 
              ? { ...m, deliveryStatus: 'delivered' }
              : m
          ));
        }
      }
    );
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!selectedSession || !socket || !userId) return;
    socket.emit('typing', {
      sessionId: selectedSession.sessionId,
      userId: userId,
      from: 'User'
    });
  };

  const handleStopTyping = () => {
    if (!selectedSession || !socket || !userId) return;
    socket.emit('stop_typing', {
      sessionId: selectedSession.sessionId,
      userId: userId
    });
  };

  // ✅ NEW: Handle option selection
  const handleOptionSelect = (optionId: string, messageId: string) => {
    if (!selectedSession || !socket || !userId) return;

    // Find the option text for optimistic update
    const optionMessage = messages.find(m => m.messageId === messageId);
    const selectedOption = optionMessage?.options?.find(o => o.optionId === optionId);
    
    let optimisticClientMessageId = '';
    
    if (selectedOption) {
      // Add optimistic user message immediately
      optimisticClientMessageId = `opt-${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticClientMessageId,
        text: selectedOption.optionText,
        sender: 'user',
        timestamp: new Date().toISOString(),
        messageType: 'text',
        clientMessageId: optimisticClientMessageId,
        deliveryStatus: 'sent'
      };
      setMessages(prev => [...prev, optimisticMessage]);
    }

    // Send option selection to server using the correct event name
    socket.emit('user_response', {
      sessionId: selectedSession.sessionId,
      selectedOptionId: optionId,
      messageId: messageId,
      userId: userId
    }, (response: any) => {
      if (response?.error) {
        console.error('Failed to process option selection:', response.message);
        toast.error('Failed to process selection');
        // Remove optimistic message on error using the stored ID
        if (selectedOption && optimisticClientMessageId) {
          setMessages(prev => prev.filter(m => m.clientMessageId !== optimisticClientMessageId));
        }
      } else {
        console.log('Option selection processed successfully');
        // Update delivery status to delivered
        if (optimisticClientMessageId) {
          setMessages(prev => prev.map(m => 
            m.clientMessageId === optimisticClientMessageId 
              ? { ...m, deliveryStatus: 'delivered' }
              : m
          ));
        }
      }
    });
  };

  const handleEndSession = () => setShowEndSessionDialog(true);

  const confirmEndSession = () => {
    if (!selectedSession || !socket || !userId) return;
    socket.emit('end_session', { sessionId: selectedSession.sessionId, userId });
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
            loading={!isConnected}
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