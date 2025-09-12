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
}

interface Session {
  providerId: string
  sessionId: string
  lastMessage: string
  createdAt: string
  status: 'active' | 'ended' | 'pending'
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

    socket.on('receive_message', (msg: any) => {
      if (!selectedSessionRef.current || msg.sessionId !== selectedSessionRef.current.sessionId) return
      if (msg.sentBy === userIdRef.current) return
      setMessages(prev => [...prev, {
        id: msg._id,
        text: msg.message,
        sender: 'astrologer',
        timestamp: msg.createdAt || new Date().toISOString()
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
        toast.error('Session ended due to timeout')
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
            sender: m.sentBy === userId ? 'user' : 'astrologer',
            timestamp: m.createdAt
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

  // Countdown timer (frontend smooth countdown)
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
    socketRef.current.emit(
      'send_message',
      {
        message: newMessage,
        sessionId: selectedSession.sessionId,
        userId,
        sentBy: userId,
        providerId: selectedSession.providerId,
        messageType: 'text'
      },
      (res: any) => {
        if (!res.error) {
          setMessages(prev => [...prev, {
            id: res.data._id,
            text: newMessage,
            sender: 'user',
            timestamp: new Date().toISOString()
          }])
          setNewMessage('')
        }
      }
    )
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
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
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-400">
                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(session.status)}`}>
                    {session.status.toUpperCase()}
                  </span>
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
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(selectedSession.status)}`}>
                {selectedSession.status.toUpperCase()}
              </span>
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
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm text-center">{msg.text}</div>
                    ) : (
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex items-center space-x-2">
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
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                onClick={handleSendMessage}
                disabled={selectedSession.status !== 'active'}
              >
                Send
              </button>
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
