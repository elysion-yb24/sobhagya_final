"use client";

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUserDetails } from '../utils/auth-utils';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderRole: 'user' | 'partner';
  timestamp: number;
  isSystemMessage?: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'message' | 'system' | 'join' | 'leave';
}

interface User {
  userId: string;
  userName: string;
  role: 'user' | 'partner';
  avatar?: string;
  status?: 'online' | 'offline';
  phoneNumber?: string;
  email?: string;
}

interface Astrologer {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  specializations?: string[];
  experience?: number;
  rating?: number;
  profileImage?: string;
  isOnline?: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  astrologerId?: string;
  messages?: Message[];
  isActive?: boolean;
  sessionStartTime?: number;
  sessionEndTime?: number;
}

interface CallHistory {
  _id: string;
  astrologerId: string;
  astrologerName: string;
  callType: 'audio' | 'video';
  duration?: number;
  timestamp: string;
  status: 'completed' | 'missed' | 'ongoing';
}

export default function ChatRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // User state
  const [user, setUser] = useState<User>({
    userId: '',
    userName: '',
    role: 'user',
    avatar: '',
    status: 'online'
  });
  
  // Room state
  const [roomId, setRoomId] = useState('room-1');
  const [joined, setJoined] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'notifications'>('chats');
  
  // Data states
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sessionTime, setSessionTime] = useState(300); // 5 minutes in seconds
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [astrologerJoined, setAstrologerJoined] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 3000);
  };

  // Load demo astrologers data
  const loadDemoAstrologers = () => {
    setLoading(true);
    
    // Demo astrologers data
    const demoAstrologers: Astrologer[] = [
      { _id: '1', name: 'Astrologer Sarah', phoneNumber: '+91 9876543210', email: 'sarah@sobhagya.com', specializations: ['Vedic Astrology', 'Numerology'], experience: 8, rating: 4.8, isOnline: true },
      { _id: '2', name: 'Astrologer Raj', phoneNumber: '+91 9876543211', email: 'raj@sobhagya.com', specializations: ['Tarot Reading', 'Palmistry'], experience: 12, rating: 4.9, isOnline: true },
      { _id: '3', name: 'Astrologer Priya', phoneNumber: '+91 9876543212', email: 'priya@sobhagya.com', specializations: ['Kundli Analysis', 'Marriage Compatibility'], experience: 6, rating: 4.7, isOnline: false },
      { _id: '4', name: 'Astrologer Amit', phoneNumber: '+91 9876543213', email: 'amit@sobhagya.com', specializations: ['Career Guidance', 'Business Astrology'], experience: 10, rating: 4.6, isOnline: true },
      { _id: '5', name: 'Astrologer Neha', phoneNumber: '+91 9876543214', email: 'neha@sobhagya.com', specializations: ['Gemstone Consultation', 'Vastu Shastra'], experience: 15, rating: 4.9, isOnline: true },
      { _id: '6', name: 'Astrologer Deepak', phoneNumber: '+91 9876543215', email: 'deepak@sobhagya.com', specializations: ['Horoscope Reading', 'Life Coaching'], experience: 9, rating: 4.5, isOnline: false },
      { _id: '7', name: 'Astrologer Meera', phoneNumber: '+91 9876543216', email: 'meera@sobhagya.com', specializations: ['Love Compatibility', 'Relationship Counseling'], experience: 7, rating: 4.8, isOnline: true }
    ];
    
    setAstrologers(demoAstrologers);
    
    // Create chat rooms from astrologers
    const rooms: ChatRoom[] = demoAstrologers.map((astro: Astrologer) => ({
      id: `room-${astro._id}`,
      name: astro.name || 'Demo Astrologer',
      lastMessage: astro.isOnline ? 'Online - Ready to chat' : 'Last seen recently',
      lastMessageTime: astro.isOnline ? 'Online' : '2 hours ago',
      astrologerId: astro._id,
      unreadCount: Math.floor(Math.random() * 3) // Random unread count for demo
    }));
    
    setChatRooms(rooms);
    setLoading(false);
  };

  // Load demo call history data
  const loadDemoCallHistory = () => {
    // Demo call history data
    const demoCallHistory: CallHistory[] = [
      {
        _id: '1',
        astrologerId: '1',
        astrologerName: 'Astrologer Sarah',
        callType: 'audio',
        duration: 120,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed'
      },
      {
        _id: '2',
        astrologerId: '2',
        astrologerName: 'Astrologer Raj',
        callType: 'video',
        duration: 300,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'completed'
      },
      {
        _id: '3',
        astrologerId: '4',
        astrologerName: 'Astrologer Amit',
        callType: 'audio',
        duration: 180,
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: 'missed'
      },
      {
        _id: '4',
        astrologerId: '5',
        astrologerName: 'Astrologer Neha',
        callType: 'video',
        duration: 420,
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        status: 'completed'
      },
      {
        _id: '5',
        astrologerId: '7',
        astrologerName: 'Astrologer Meera',
        callType: 'audio',
        duration: 90,
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        status: 'completed'
      }
    ];
    
    setCallHistory(demoCallHistory);
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io({
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from chat server');
    });

    // Handle new messages
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        // Check by ID first, then by content and timestamp if ID doesn't match
        const messageExists = prev.some(msg => 
          msg.id === message.id || 
          (msg.text === message.text && 
           msg.sender === message.sender && 
           Math.abs(msg.timestamp - message.timestamp) < 1000) // Within 1 second
        );
        if (messageExists) {
          return prev;
        }
        return [...prev, message];
      });
      // Increment unread count for chats tab
      if (activeTab !== 'chats') {
        setUnreadChatsCount(prev => prev + 1);
      }
    });

    // Handle message status updates
    newSocket.on('message_status_update', (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: data.status } : msg
      ));
    });

    // Handle room history
    newSocket.on('room_history', (history: Message[]) => {
      setMessages(history);
    });

    // Handle user joined
    newSocket.on('user_joined', (data: { userName: string; role: string; message: string }) => {
      addNotification(data.message);
      
      // Add join message to chat
      const joinMessage: Message = {
        id: `join-${Date.now()}`,
        text: `${data.userName} joins the chat`,
        sender: 'System',
        senderRole: 'user',
        timestamp: Date.now(),
        status: 'sent',
        type: 'join'
      };
      
      setMessages(prev => [...prev, joinMessage]);
      
      // If astrologer joins, update state
      if (data.role === 'partner') {
        setAstrologerJoined(true);
        stopSession(); // Stop session timer when astrologer joins
      }
    });

    // Handle user left
    newSocket.on('user_left', (data: { userName: string; message: string }) => {
      addNotification(data.message);
    });

    // Handle typing indicators
    newSocket.on('user_typing', (data: { userName: string; role: string }) => {
      setTypingUsers(prev => [...prev.filter(name => name !== data.userName), data.userName]);
    });

    newSocket.on('user_stopped_typing', (data: { userName: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.userName));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [activeTab]);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  // useEffect(() => {
  //   const messagesContainer = messagesEndRef.current?.parentElement;
  //   if (messagesContainer) {
  //     const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
  //     
  //     if (isNearBottom) {
  //       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }
  // }, [messages]);

  // Load demo data on mount
  useEffect(() => {
    loadDemoAstrologers();
    loadDemoCallHistory();
    
    // Preserve scroll position on refresh
    const savedScrollPosition = sessionStorage.getItem('chatScrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        const messagesContainer = document.querySelector('.overflow-y-auto');
        if (messagesContainer) {
          messagesContainer.scrollTop = parseInt(savedScrollPosition);
        }
      }, 100);
    }
  }, []);

  // Clear unread count when switching to chats tab
  useEffect(() => {
    if (activeTab === 'chats') {
      setUnreadChatsCount(0);
    }
  }, [activeTab]);

  // Save scroll position on scroll
  useEffect(() => {
    const messagesContainer = document.querySelector('.overflow-y-auto');
    if (messagesContainer) {
      const handleScroll = () => {
        sessionStorage.setItem('chatScrollPosition', messagesContainer.scrollTop.toString());
      };
      
      messagesContainer.addEventListener('scroll', handleScroll);
      
      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const joinRoom = () => {
    if (!user.userId || !user.userName) {
      alert('Please fill in all user details');
      return;
    }
    const url = `/chat-room/${roomId}?userId=${encodeURIComponent(user.userId)}&userName=${encodeURIComponent(user.userName)}&role=${encodeURIComponent(user.role)}`;
    window.open(url, '_blank');
    addNotification(`Opened chat in new tab: ${roomId}`);
  };

  const leaveRoom = () => {
    if (!socket) return;

    socket.emit('leave_room', {
      roomId,
      userId: user.userId,
      userName: user.userName
    });

    setJoined(false);
    setMessages([]);
    setTypingUsers([]);
    addNotification(`Left room: ${roomId}`);
  };

  const sendMessage = () => {
    if (!socket || !messageInput.trim() || !joined || isSending) return;

    setIsSending(true);
    const messageText = messageInput.trim();
    const messageId = `${Date.now()}-${Math.random()}`;
    
    // Clear input immediately to prevent double-sending
    setMessageInput('');
    
    // Add message to local state immediately with 'sending' status
    const newMessage: Message = {
      id: messageId,
      text: messageText,
      sender: user.userName,
      senderRole: user.role,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    // Add message to local state
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      // Save chat to room
      saveChatToRoom(roomId, updatedMessages);
      return updatedMessages;
    });

    // Emit message to socket
    socket.emit('send_message', {
      roomId,
      text: messageText,
      userId: user.userId,
      userName: user.userName,
      role: user.role,
      messageId: messageId
    });

    // Simulate message status progression
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      setIsSending(false); // Re-enable sending after message is processed
    }, 2000);
  };

  const handleTyping = () => {
    if (!socket || !joined) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit('typing_start', {
      roomId,
      userName: user.userName,
      role: user.role
    });

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit('typing_stop', {
        roomId,
        userName: user.userName
      });
    }, 1000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Message status indicator component
  const MessageStatus = ({ status, timestamp }: { status: string; timestamp: number }) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'sending':
          return (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-gray-400 rounded-full animate-spin"></div>
            </div>
          );
        case 'sent':
          return (
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        case 'delivered':
          return (
            <div className="flex items-center space-x-0.5">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          );
        case 'read':
          return (
            <div className="flex items-center space-x-0.5">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
        {getStatusIcon()}
      </div>
    );
  };

  // Typing indicator component with animated dots
  const TypingIndicator = ({ userName }: { userName: string }) => {
    return (
      <div className="flex justify-start">
        <div className="flex items-end space-x-2">
          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-xs text-orange-700">
            {getInitials(userName)}
          </div>
          <div className="bg-white border border-orange-200 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCallClick = (astrologerId: string, callType: 'audio' | 'video') => {
    // Store call details and redirect to call flow
    localStorage.setItem('selectedAstrologerId', astrologerId);
    localStorage.setItem('callType', callType);
    window.open(`/calls/call1?astrologerId=${astrologerId}`, '_blank');
  };

  // Session management
  const startSession = () => {
    setSessionTime(300); // 5 minutes
    setAstrologerJoined(false);
    
    // Add system message for session start
    const sessionMessage: Message = {
      id: `session-${Date.now()}`,
      text: 'Chat session started. Astrologer will join the chat soon.',
      sender: 'System',
      senderRole: 'user',
      timestamp: Date.now(),
      status: 'sent',
      type: 'system'
    };
    
    setMessages([sessionMessage]);
    
    // Start session timer
    const timer = setInterval(() => {
      setSessionTime(prev => {
        if (prev <= 60 && prev > 0) { // 1 minute warning
          setShowBalanceWarning(true);
        }
        if (prev <= 0) {
          // Session ended
          clearInterval(timer);
          const endMessage: Message = {
            id: `session-end-${Date.now()}`,
            text: 'Chat session has ended. Please recharge to continue.',
            sender: 'System',
            senderRole: 'user',
            timestamp: Date.now(),
            status: 'sent',
            type: 'system'
          };
          setMessages(prev => [...prev, endMessage]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setSessionTimer(timer);
  };

  const stopSession = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
    setShowBalanceWarning(false);
  };

  const handleRecharge = () => {
    stopSession();
    // Redirect to recharge page
    window.open('/wallet', '_blank');
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save chat to chat rooms
  const saveChatToRoom = (roomId: string, messages: Message[]) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          messages: messages,
          lastMessage: messages[messages.length - 1]?.text || 'No messages',
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: (room.unreadCount || 0) + 1
        };
      }
      return room;
    }));
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700">Connecting to chat server...</p>
        </div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex relative">
        {/* Sobhagya Logo Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-contain bg-no-repeat bg-center"
               style={{ backgroundImage: 'url(/sobhagya-logo.svg)' }}></div>
        </div>

        {/* Left Sidebar */}
        <div className="w-80 bg-white/95 backdrop-blur-md border-r border-amber-200 flex flex-col relative z-10 shadow-lg">
                  {/* User Profile Header */}
          <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(user.userName || 'User')}
              </div>
              <div>
                <h3 className="font-semibold text-white">{user.userName || 'User'}</h3>
                <p className="text-sm text-orange-100">{user.role === 'user' ? 'Customer' : 'Partner'}</p>
              </div>
            </div>
            <button className="text-orange-100 hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-orange-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Searching..."
              className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-orange-200">
          {(['chats', 'calls', 'notifications'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium capitalize relative ${
                activeTab === tab
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-orange-600'
              }`}
            >
              {tab}
              {tab === 'chats' && unreadChatsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadChatsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {activeTab === 'chats' && (
            <div className="h-full overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading astrologers...</p>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border-b border-orange-100 cursor-pointer hover:bg-orange-50 ${
                      roomId === room.id ? 'bg-orange-50 border-l-4 border-l-orange-600' : ''
                    }`}
                    onClick={() => setRoomId(room.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-semibold">
                        {getInitials(room.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{room.name}</h4>
                          <span className="text-xs text-gray-500">{room.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                      </div>
                      {room.unreadCount && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="h-full overflow-y-auto">
              {callHistory.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">No call history found</p>
                </div>
              ) : (
                callHistory.map((call) => (
                  <div key={call._id} className="p-4 border-b border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-semibold">
                          {getInitials(call.astrologerName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{call.astrologerName}</h4>
                          <p className="text-xs text-gray-500">{new Date(call.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCallClick(call.astrologerId, 'audio')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Audio Call"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCallClick(call.astrologerId, 'video')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Video Call"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${
                        call.status === 'completed' ? 'bg-green-100 text-green-700' :
                        call.status === 'missed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {call.status}
                      </span>
                      <span>{call.callType} call</span>
                      {call.duration && <span>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-4">
              <p className="text-sm text-gray-500 text-center">No notifications yet</p>
            </div>
          )}
        </div>

        {/* User Setup Form */}
        {!joined && (
          <div className="p-4 border-t border-orange-200 bg-orange-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Join Chat Room</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={user.userId}
                onChange={(e) => setUser(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="User ID"
              />
              <input
                type="text"
                value={user.userName}
                onChange={(e) => setUser(prev => ({ ...prev, userName: e.target.value }))}
                className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Your name"
              />
              <select
                value={user.role}
                onChange={(e) => setUser(prev => ({ ...prev, role: e.target.value as 'user' | 'partner' }))}
                className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="user">User</option>
                <option value="partner">Partner</option>
              </select>
              <button
                onClick={joinRoom}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 h-screen">
        {/* Chat Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(chatRooms.find(r => r.id === roomId)?.name || 'Chat')}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{chatRooms.find(r => r.id === roomId)?.name || 'Chat Room'}</h2>
                <p className="text-sm text-gray-500">
                  {connected ? 'Online' : 'Offline'} • {joined ? 'In room' : 'Not joined'}
                  {joined && sessionTime > 0 && !astrologerJoined && (
                    <span className="ml-2 text-amber-600 font-medium">
                      • Session: {formatSessionTime(sessionTime)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {joined && (
                <button
                  onClick={leaveRoom}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Leave Room
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-orange-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50/50 to-orange-100/50 p-4 min-h-0">
          {messages.length === 0 && joined ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Send a message to begin chatting</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                // Handle different message types
                if (message.type === 'system' || message.type === 'join' || message.type === 'leave') {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
                        {message.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex ${message.senderRole === user.role ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                      {message.senderRole !== user.role && (
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full flex items-center justify-center text-xs text-orange-700 flex-shrink-0">
                          {getInitials(message.sender)}
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.senderRole === user.role
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-white text-gray-900 border border-amber-200 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <div className={`flex items-center justify-end mt-1 ${
                          message.senderRole === user.role ? 'text-amber-100' : 'text-gray-500'
                        }`}>
                          {message.senderRole === user.role ? (
                            <MessageStatus status={message.status} timestamp={message.timestamp} />
                          ) : (
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicators with animated dots */}
              {typingUsers.length > 0 && (
                <TypingIndicator userName={typingUsers[0]} />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        {joined && (
          <div className="bg-white/90 backdrop-blur-sm border-t border-orange-200 p-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim() || isSending}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Balance Warning Popup */}
        {showBalanceWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Balance Running Low!</h3>
                <p className="text-gray-600 mb-4">
                  Your chat session will end in 1 minute. Please recharge your wallet to continue chatting.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRecharge}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-medium"
                  >
                    Recharge Now
                  </button>
                  <button
                    onClick={() => setShowBalanceWarning(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Continue
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
