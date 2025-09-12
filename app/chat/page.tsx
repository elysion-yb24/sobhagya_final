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

  const socketRef = useRef<Socket | null>(null)
  const selectedSessionRef = useRef<Session | null>(selectedSession)
  const userIdRef = useRef<string | null>(userId)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Update refs
  useEffect(() => { selectedSessionRef.current = selectedSession }, [selectedSession])
  useEffect(() => { userIdRef.current = userId }, [userId])

  // Get userId and role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userDetails')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserId(user.id)
      const normalizedRole = user.role === 'friend' ? 'provider' : user.role
      setUserRole(normalizedRole)
    }
  }, [])

  // Initialize socket once
  useEffect(() => {
    if (!userId || !userRole) return
    if (socketRef.current) return

    const socket = io('http://localhost:7001', {
      query: { userId, usertype: userRole },
    })
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

    // Listen for new messages
    const handleReceiveMessage = (msg: any) => {
      if (selectedSessionRef.current && msg.sessionId === selectedSessionRef.current.sessionId) {
        setMessages(prev => [
          ...prev,
          {
            id: msg._id,
            text: msg.message,
            sender: msg.sentBy === userIdRef.current ? 'user' : 'astrologer',
            timestamp: new Date().toISOString(),
          }
        ])
      }
    }

    const handleUserJoined = (data: { userId: string, role: string, sessionId: string }) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setMessages(prev => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            text: `${data.role} has joined the chat`,
            sender: 'system',
            timestamp: new Date().toISOString()
          }
        ])
        toast.success(`${data.role} joined the chat`)
      }
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on('user_joined', handleUserJoined)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('user_joined', handleUserJoined)
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, userRole])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Load session from query param
  useEffect(() => {
    if(!searchParams) return ;
    const sessionIdFromUrl = searchParams.get('sessionId')
    if (sessionIdFromUrl && sessions.length > 0) {
      const foundSession = sessions.find(s => s.sessionId === sessionIdFromUrl)
      if (foundSession) {
        setSelectedSession(foundSession)

        socketRef.current?.emit(
          'get_messages',
          { sessionId: sessionIdFromUrl, limit: 50, skip: 0 },
          (res: any) => {
            let msgs: Message[] = []
            if (res.success) {
              msgs = (Array.isArray(res.data) ? res.data : Array.isArray(res.data?.messages) ? res.data.messages : []).map((m: any) => ({
                id: m._id,
                text: m.message,
                sender: m.sentBy === userId ? 'user' : 'astrologer',
                timestamp: m.createdAt
              }))
            }

            const systemMsg: Message = {
              id: 'system-join',
              text: `You have joined the chat. Waiting for astrologer... Estimated time: ~3 minutes`,
              sender: 'system',
              timestamp: new Date().toISOString()
            }

            setMessages([systemMsg, ...msgs].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
          }
        )
      }
    }
  }, [searchParams, sessions, userId])

  // Handle session select / continue
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

    const session = selectedSession

    socketRef.current.emit(
      'send_message',
      {
        message: newMessage,
        sessionId: session.sessionId,
        userId,
        sentBy: userId,
        providerId: session.providerId,
        messageType: 'text'
      },
      (res: any) => {
        if (!res.error) {
          setMessages(prev => [
            ...prev,
            {
              id: res.data._id,
              text: newMessage,
              sender: 'user',
              timestamp: new Date().toISOString(),
            }
          ])
          setNewMessage('')
        }
      }
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
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
                className={`p-3 cursor-pointer transition-colors border-b border-gray-100
                  ${selectedSession?.sessionId === session.sessionId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Provider: {session.providerId}</span>
                  <span className="text-sm text-gray-500 truncate max-w-xs">{session.lastMessage || 'No messages yet'}</span>
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
            <div className="p-4 border-b border-gray-200 bg-white flex items-center">
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Provider: {selectedSession.providerId}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages
                  .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'astrologer' ? 'justify-start' : 'justify-center'}`}
                  >
                    {msg.sender === 'system' ? (
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm text-center">{msg.text}</div>
                    ) : (
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                disabled={selectedSession.status !== 'active'}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
