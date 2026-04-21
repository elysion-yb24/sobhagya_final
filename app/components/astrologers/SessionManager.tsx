'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getUserDetails, getAuthToken } from '../../utils/auth-utils'
import { createChatSession } from '../../utils/chat-api'
import { getChatSocketUrl } from '../../config/api'

export interface CreateSessionInfo {
  threadId: string
  sessionId: string
}

interface SessionManagerContextType {
  socket: Socket | null
  isConnected: boolean
  /** Creates (or re-uses) a chat session with the given astrologer.
   *  Returns both the threadId (persistent conversation key) and the
   *  sessionId (current live session doc id). */
  createOrJoinSession: (providerId: string) => Promise<CreateSessionInfo | null>
  /** Joins the socket room for the given thread. Backend needs both
   *  threadId and sessionId. */
  joinSessionRoom: (threadId: string, sessionId: string, isAstrologer?: boolean) => Promise<boolean>
  currentSession: any | null
  sessionStatus: 'pending' | 'active' | 'ended' | null
  onSessionUpdate: (callback: (sessionData: any) => void) => void
  onSessionStatusChange: (callback: (status: string, sessionId: string) => void) => void
}

const SessionManagerContext = createContext<SessionManagerContextType | null>(null)

export const useSessionManager = () => {
  const context = useContext(SessionManagerContext)
  if (!context) {
    throw new Error('useSessionManager must be used within a SessionManagerProvider')
  }
  return context
}

interface SessionManagerProviderProps {
  children: React.ReactNode
}

export const SessionManagerProvider: React.FC<SessionManagerProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentSession, setCurrentSession] = useState<any | null>(null)
  const [sessionStatus, setSessionStatus] = useState<'pending' | 'active' | 'ended' | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const sessionUpdateCallbacks = useRef<Set<(sessionData: any) => void>>(new Set())
  const sessionStatusCallbacks = useRef<Set<(status: string, sessionId: string) => void>>(new Set())

  useEffect(() => {
    const userDetails = getUserDetails()
    const userId = userDetails?.id || userDetails?._id
    const userRole = userDetails?.role || 'user'

    if (!userId) return

    const token = getAuthToken();
    const chatSocketUrl = getChatSocketUrl();
    const newSocket = io(chatSocketUrl, {
      path: '/chat-socket/socket.io/',
      query: {
        userId,
        usertype: userRole,
        token: token || ''
      },
      transports: ['websocket', 'polling'],
      secure: true,
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 20,
    })

    newSocket.on('connect', () => {
      console.log('✅ [SessionManager] Socket connected successfully:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ [SessionManager] Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [SessionManager] Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Backend (chat-service/chatSocketNew.js) only emits these events:
    //   - `receive_message`, `typing`, `astrologer_joined`, `session_ended`
    // (The older rich set of `session_created`, `session_resumed`,
    //  `session_status_updated`, etc. is NOT emitted by the current backend.)
    newSocket.on('astrologer_joined', (sessionData: any) => {
      const sid = sessionData?._id || sessionData?.sessionId
      setCurrentSession((prev: any) => (prev ? { ...prev, ...sessionData } : sessionData))
      setSessionStatus('active')
      sessionStatusCallbacks.current.forEach((cb) => cb('active', sid))
      sessionUpdateCallbacks.current.forEach((cb) => cb(sessionData))
    })

    newSocket.on('session_ended', (payload: any) => {
      const ended = payload?.data || payload
      const sid = ended?._id || ended?.sessionId || payload?.sessionId
      setSessionStatus('ended')
      sessionStatusCallbacks.current.forEach((cb) => cb('ended', sid))
    })

    setSocket(newSocket)
    socketRef.current = newSocket

    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  // Creates (or reuses) a chat session via REST `POST /api/chat/create-session`.
  // The backend returns `{ thread, session }`. Our REST helper normalises that
  // to `{ threadId, sessionId }` which is what the rest of the UI needs.
  const createOrJoinSession = async (providerId: string): Promise<CreateSessionInfo | null> => {
    const userDetails = getUserDetails()
    const userId = userDetails?.id || userDetails?._id
    if (!userId) {
      console.error('[SessionManager] User not authenticated')
      return null
    }
    if (!providerId) {
      console.error('[SessionManager] providerId is required')
      return null
    }

    try {
      const result = await createChatSession(String(userId), String(providerId))
      if (!result) return null

      // Wait up to ~3s for the socket to be connected before joining.
      // Without this, clicks that race the initial socket handshake silently
      // fail to join the room and the user never receives `receive_message`.
      if (!socketRef.current?.connected) {
        await new Promise<void>((resolve) => {
          const start = Date.now()
          const tick = () => {
            if (socketRef.current?.connected || Date.now() - start > 3000) return resolve()
            setTimeout(tick, 100)
          }
          tick()
        })
      }

      // Join the socket room and wait for the ack so the caller doesn't
      // navigate to /chat before the room is joined.
      await joinSessionRoom(result.threadId, result.sessionId, false).catch(() => false)
      return { threadId: result.threadId, sessionId: result.sessionId }
    } catch (err) {
      console.error('[SessionManager] createOrJoinSession failed:', err)
      return null
    }
  }

  /** Joins the socket room for `threadId`. Backend event: `join_session`. */
  const joinSessionRoom = async (
    threadId: string,
    sessionId: string,
    isAstrologer: boolean = false
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socketRef.current || !isConnected) {
        resolve(false)
        return
      }
      if (!threadId || !sessionId) {
        console.warn('[SessionManager] joinSessionRoom missing threadId/sessionId', { threadId, sessionId })
        resolve(false)
        return
      }

      // Timeout protection — backend should ack within a few seconds.
      const timeout = setTimeout(() => resolve(false), 8000)

      socketRef.current.emit(
        'join_session',
        { threadId, sessionId, isAstrologer },
        (response: any) => {
          clearTimeout(timeout)
          resolve(Boolean(response?.success))
        }
      )
    })
  }

  const onSessionUpdate = (callback: (sessionData: any) => void) => {
    sessionUpdateCallbacks.current.add(callback)
    return () => sessionUpdateCallbacks.current.delete(callback)
  }

  const onSessionStatusChange = (callback: (status: string, sessionId: string) => void) => {
    sessionStatusCallbacks.current.add(callback)
    return () => sessionStatusCallbacks.current.delete(callback)
  }

  const value: SessionManagerContextType = {
    socket,
    isConnected,
    createOrJoinSession,
    joinSessionRoom,
    currentSession,
    sessionStatus,
    onSessionUpdate,
    onSessionStatusChange,
  }

  return <SessionManagerContext.Provider value={value}>{children}</SessionManagerContext.Provider>
}
