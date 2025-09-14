'use client'

import React, { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  text: string
  sender: 'user' | 'astrologer' | 'system'
  timestamp: string
  messageType?: 'text' | 'voice' | 'image' | 'video' | 'file' | 'options' | 'informative' | 'call'
  fileLink?: string
  replyMessage?: {
    id: string
    message: string
    replyTo: string
    replyBy: string
    messageType: string
    voiceMessageDuration?: number
  }
  sentByName?: string
  sentByProfileImage?: string
  voiceMessageDuration?: number
}

interface Session {
  providerId: string
  sessionId: string
  lastMessage: string
  createdAt: string
  status: 'active' | 'ended' | 'pending'
  rpm?: number
  initialBalance?: number
  remainingBalance?: number
  sessionCost?: number
  billingType?: 'per_minute' | 'per_message' | 'per_session'
  userUnreadCount?: number
  providerUnreadCount?: number
  messagesSentByUser?: number
  messagesSentByProvider?: number
  creditsUsed?: number
  messageCount?: number
  sessionData?: {
    lastActivity: string
    isTyping: boolean
    typingBy?: string
    connectionStatus: {
      userConnected: boolean
      providerConnected: boolean
    }
  }
}

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState<string>('')
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<{userConnected: boolean, providerConnected: boolean}>({userConnected: false, providerConnected: false})
  const [userBalance, setUserBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false)

  const socketRef = useRef<Socket | null>(null)
  const selectedSessionRef = useRef<Session | null>(selectedSession)
  const userIdRef = useRef<string | null>(userId)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => { selectedSessionRef.current = selectedSession }, [selectedSession])
  useEffect(() => { userIdRef.current = userId }, [userId])

  // Load user info
  useEffect(() => {
    const storedUser = localStorage.getItem('userDetails')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserId(user.id)
      setUserRole(user.role === 'friend' ? 'provider' : user.role)
    }
  }, [])

  // Fetch user balance when userId is available
  useEffect(() => {
    if (userId) {
      fetchUserBalance()
    }
  }, [userId])


  // Initialize socket
  useEffect(() => {
    if (!userId || !userRole || socketRef.current) return

    const socket = io('http://localhost:7001', { query: { userId, usertype: userRole } })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)

      socket.emit('get_all_sessions', { userId, role: userRole }, (response: any) => {
        if (response.success && response.data?.sessions) {
          setSessions(response.data.sessions)
          setError(null)
        } else {
          setSessions([])
          setError(response.message || 'Failed to fetch sessions')
        }
        setLoading(false)
      })
    })

    // ✅ Handle incoming messages (user/astrologer/system)
    socket.on('receive_message', (msg: any) => {
      if (!selectedSessionRef.current || msg.sessionId !== selectedSessionRef.current.sessionId) return

      let sender: Message['sender'] = 'astrologer'
      if (msg.isAutomated || msg.sentBy === 'system') {
        sender = 'system'
      } else if (msg.sentBy === userIdRef.current) {
        sender = 'user'
      }

      setMessages(prev => [...prev, {
        id: msg._id || `msg-${Date.now()}`,
        text: msg.message,
        sender,
        timestamp: msg.createdAt || new Date().toISOString(),
        messageType: msg.messageType || 'text',
        fileLink: msg.fileLink,
        replyMessage: msg.replyMessage,
        sentByName: msg.sentByName,
        sentByProfileImage: msg.sentByProfileImage,
        voiceMessageDuration: msg.voiceMessageDuration
      }])
    })

    socket.on('user_joined', (data: { userId: string, role: string, sessionId: string }) => {
      if (selectedSessionRef.current?.sessionId !== data.sessionId) return
      if (data.role === 'astrologer' && waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current)
        waitingTimerRef.current = null
      }
      const systemMsg: Message = {
        id: `system-${Date.now()}`,
        text: `${data.role} has joined the chat`,
        sender: 'system',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, systemMsg])
      toast.success(`${data.role} joined the chat`)
    })

    socket.on('session_tick', (data: { sessionId: string, remainingTime: number }) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setRemainingTime(data.remainingTime)
      }
    })

    socket.on('session_ended', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'ended' } : prev)
        toast.error(data.message || 'Session ended due to timeout')
        // Refresh balance after session ends
        if (userRole === 'user') {
          fetchUserBalance()
        }
      }
    })

    socket.on('session_created', (data: any) => {
      if (data.sessionId) {
        toast.success('Session created successfully')
      }
    })

    socket.on('session_started', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'active' } : prev)
        toast.success('Session started')
        // Refresh balance when session starts
        if (userRole === 'user') {
          fetchUserBalance()
        }
      }
    })

    socket.on('session_restarted', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'active' } : prev)
        toast.success('Session restarted')
      }
    })

    socket.on('low_balance_warning', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        toast.error(data.message || `Low balance: ${data.remainingMinutes} minutes remaining`)
        // Refresh balance when low balance warning is received
        if (userRole === 'user') {
          fetchUserBalance()
        }
      }
    })

    socket.on('user_left', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        const systemMsg: Message = {
          id: `system-${Date.now()}`,
          text: `${data.role} has left the chat`,
          sender: 'system',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, systemMsg])
      }
    })


    socket.on('connection_status', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setConnectionStatus(data.connectionStatus)
      }
    })


    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, userRole])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Load session from URL
  useEffect(() => {
    if (!searchParams || sessions.length === 0 || !userId) return
    const sessionIdFromUrl = searchParams.get('sessionId')
    if (!sessionIdFromUrl) return

    const foundSession = sessions.find(s => s.sessionId === sessionIdFromUrl)
    if (!foundSession) return

    setSelectedSession(foundSession)

    socketRef.current?.emit(
      'get_messages',
      { sessionId: sessionIdFromUrl, limit: 10, skip: 0 },
      (res: any) => {
        let msgs: Message[] = []
        if (res.success) {
          msgs = (Array.isArray(res.data) ? res.data : res.data?.messages || []).map((m: any) => ({
            id: m._id,
            text: m.message,
            sender: m.isAutomated || m.sentBy === 'system'
              ? 'system'
              : m.sentBy === userId
                ? 'user'
                : 'astrologer',
            timestamp: m.createdAt,
            messageType: m.messageType || 'text',
            fileLink: m.fileLink,
            replyMessage: m.replyMessage,
            sentByName: m.sentByName,
            sentByProfileImage: m.sentByProfileImage,
            voiceMessageDuration: m.voiceMessageDuration
          }))
        }

        const systemMsg: Message[] = (userRole === 'user') ? [{
          id: 'system-join',
          text: `You have joined the chat. Waiting for astrologer... Estimated time: ~3 minutes`,
          sender: 'system',
          timestamp: new Date().toISOString()
        }] : []

        setMessages([...systemMsg, ...msgs].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ))

        // Start waiting timer
        if (userRole === 'user') {
          if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current)
          waitingTimerRef.current = setTimeout(() => {
            if (selectedSessionRef.current?.status === 'pending') {
              socketRef.current?.emit(
                'session_update',
                { sessionId: selectedSessionRef.current.sessionId, status: 'ended' },
                (res: any) => {
                  if (!res.error) {
                    setSelectedSession(prev => prev ? { ...prev, status: 'ended' } : prev)
                    toast.error('Session ended as astrologer did not join in time.')
                  }
                }
              )
            }
          }, 3 * 60 * 1000)
        }
      }
    )
  }, [searchParams, sessions, userId])

  // Countdown timer
  useEffect(() => {
    if (remainingTime === null) return
    const interval = setInterval(() => {
      setRemainingTime(prev => prev !== null && prev > 0 ? prev - 1 : 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [remainingTime])

  const handleSelectSession = (session: Session) => {
    if (!socketRef.current || !userId) return
    socketRef.current.emit(
      "session_update",
      { sessionId: session.sessionId, userId, providerId: session.providerId },
      (res: any) => {
        if (!res.error && res.data) {
          setSelectedSession({ ...session, status: res.data.status })
          router.push(`/chat?sessionId=${session.sessionId}`)
        } else {
          setError(res.message)
        }
      }
    )
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession || !socketRef.current || !userId) return
    
    const messageData = {
      message: newMessage,
      sessionId: selectedSession.sessionId,
      userId,
      sentBy: userId,
      providerId: selectedSession.providerId,
      messageType: 'text' as const,
      tempFileKey: selectedFile ? 'temp-file-key' : undefined,
      replyMessage: replyToMessage ? {
        id: replyToMessage.id,
        message: replyToMessage.text,
        replyTo: replyToMessage.sender,
        replyBy: userId,
        messageType: replyToMessage.messageType || 'text',
        voiceMessageDuration: replyToMessage.voiceMessageDuration
      } : undefined,
      sentByName: 'User',
      sentByProfileImage: ''
    }

    socketRef.current.emit('send_message', messageData, (res: any) => {
      if (!res.error) {
        setMessages(prev => [...prev, {
          id: res.data._id,
          text: newMessage,
          sender: 'user',
          timestamp: new Date().toISOString(),
          messageType: 'text',
          replyMessage: replyToMessage ? {
            id: replyToMessage.id,
            message: replyToMessage.text,
            replyTo: replyToMessage.sender,
            replyBy: userId,
            messageType: replyToMessage.messageType || 'text',
            voiceMessageDuration: replyToMessage.voiceMessageDuration
          } : undefined
        }])
        setNewMessage('')
        setReplyToMessage(null)
        setSelectedFile(null)
      } else {
        toast.error(res.message || 'Failed to send message')
      }
    })
  }

  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current)
    }
  }, [])

  const statusBadge = (status: Session['status']) => ({
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    ended: 'bg-red-100 text-red-800'
  }[status])

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  const fetchUserBalance = async () => {
    if (!userId) return
    
    setBalanceLoading(true)
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      if (!token) {
        console.log('No auth token found')
        setBalanceLoading(false)
        return
      }

      const response = await fetch('/api/wallet-balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUserBalance(data.data.balance || 0)
          console.log('User balance fetched:', data.data.balance)
        }
      } else {
        console.error('Failed to fetch balance:', response.status)
      }
    } catch (error) {
      console.error('Error fetching user balance:', error)
    } finally {
      setBalanceLoading(false)
    }
  }


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowFileUpload(true)
    }
  }

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message)
  }



  const handleEndSession = () => {
    if (!selectedSession || !userId || !socketRef.current) return
    
    socketRef.current.emit('end_session', {
      sessionId: selectedSession.sessionId,
      userId
    }, (response: any) => {
      if (response.error) {
        toast.error(response.message || 'Failed to end session')
      } else {
        
        if (userRole === 'user') {
          fetchUserBalance()
        }
      }
    })
  }

  const renderMessageContent = (message: Message) => {
    if (message.messageType === 'image' && message.fileLink) {
      return (
        <div>
          <img src={message.fileLink} alt="Shared image" className="max-w-xs rounded-lg" />
          {message.text && <p className="text-sm mt-2">{message.text}</p>}
        </div>
      )
    }
    
    if (message.messageType === 'voice' && message.fileLink) {
      return (
        <div>
          <audio controls className="w-full">
            <source src={message.fileLink} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          {message.voiceMessageDuration && (
            <p className="text-xs text-gray-500 mt-1">
              Duration: {Math.floor(message.voiceMessageDuration / 60)}:{(message.voiceMessageDuration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      )
    }
    
    if (message.messageType === 'file' && message.fileLink) {
      return (
        <div>
          <a href={message.fileLink} download className="text-blue-500 hover:underline">
            📎 Download File
          </a>
          {message.text && <p className="text-sm mt-2">{message.text}</p>}
        </div>
      )
    }
    
    return <p className="text-sm">{message.text}</p>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
            {userRole === 'user' && (
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="text-sm text-gray-600">Wallet Balance</div>
                    <div className="text-lg font-bold text-green-600">
                      {balanceLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        `₹${userBalance !== null ? userBalance.toFixed(2) : '0.00'}`
                      )}
                    </div>
                  </div>
                  <button
                    onClick={fetchUserBalance}
                    disabled={balanceLoading}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    title="Refresh Balance"
                  >
                    🔄
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-gray-500">Loading chats...</p>
          ) : error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : sessions.length === 0 ? (
            <p className="p-4 text-gray-500">No chats available</p>
          ) : (
            sessions.map(session => (
              <div
                key={session.sessionId}
                onClick={() => handleSelectSession(session)}
                className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-100 transition-colors
                  ${selectedSession?.sessionId === session.sessionId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {session.providerId.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">Provider: {session.providerId}</span>
                    <span className="text-sm text-gray-500 truncate max-w-xs">{session.lastMessage || 'No messages yet'}</span>
                    {session.rpm && session.rpm > 0 && (
                      <span className="text-xs text-blue-600">₹{session.rpm}/min</span>
                    )}
                    {session.remainingBalance !== undefined && (
                      <span className="text-xs text-green-600">Balance: ₹{session.remainingBalance}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-400">
                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center space-x-1">
                    {session.userUnreadCount && session.userUnreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {session.userUnreadCount}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(session.status)}`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedSession.providerId.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Provider: {selectedSession.providerId}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedSession.status === 'active'
                      ? remainingTime !== null
                        ? `Time left: ${formatTime(remainingTime)}`
                        : 'Online'
                      : selectedSession.status.toUpperCase()
                    }
                  </p>
                  {selectedSession.rpm && selectedSession.rpm > 0 && (
                    <p className="text-xs text-blue-600">Rate: ₹{selectedSession.rpm}/min</p>
                  )}
                  {selectedSession.remainingBalance !== undefined && (
                    <p className="text-xs text-green-600">Balance: ₹{selectedSession.remainingBalance}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(selectedSession.status)}`}>
                  {selectedSession.status.toUpperCase()}
                </span>
                {selectedSession.status === 'active' && (
                  <button
                    onClick={handleEndSession}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    End
                  </button>
                )}
              </div>
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.sender === 'user'
                      ? 'justify-end'
                      : msg.sender === 'astrologer'
                        ? 'justify-start'
                        : 'justify-center'}`}
                  >
                    {msg.sender === 'system' ? (
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm text-center">
                        {msg.text}
                      </div>
                    ) : (
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'}`}>
                        {msg.replyMessage && (
                          <div className={`text-xs p-2 rounded mb-2 ${msg.sender === 'user' ? 'bg-blue-400' : 'bg-gray-300'}`}>
                            <p className="font-medium">Replying to {msg.replyMessage.replyBy === userId ? 'you' : 'astrologer'}</p>
                            <p className="truncate">{msg.replyMessage.message}</p>
                          </div>
                        )}
                        {renderMessageContent(msg)}
                        <div className="flex justify-between items-center mt-1">
                          <p className={`text-xs ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {msg.sender !== 'user' && (
                            <button
                              onClick={() => handleReplyToMessage(msg)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              {replyToMessage && (
                <div className="mb-2 p-2 bg-gray-100 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Replying to:</p>
                    <p className="text-sm truncate">{replyToMessage.text}</p>
                  </div>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {selectedFile && (
                <div className="mb-2 p-2 bg-blue-100 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-600">Selected file:</p>
                    <p className="text-sm">{selectedFile.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  📎
                </label>
                
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  disabled={selectedSession.status !== 'active'}
                />
                
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                  onClick={handleSendMessage}
                  disabled={selectedSession.status !== 'active' || (!newMessage.trim() && !selectedFile)}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
