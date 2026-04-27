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

export type CreateOrJoinResult =
  | { ok: true; threadId: string; sessionId: string }
  | { ok: false; message: string; status: number }

interface SessionManagerContextType {
  socket: Socket | null
  isConnected: boolean
  /** Last connection-error message surfaced by socket.io, or null. Lets the
   *  chat page show a useful message when the chat-service is fully down
   *  (CORS / firewall / 502) instead of an indefinite spinner. */
  lastConnectError: string | null
  /** Creates (or re-uses) a chat session with the given astrologer.
   *  On success returns `{ ok: true, threadId, sessionId }`.
   *  On failure returns `{ ok: false, message, status }` with the
   *  backend-supplied message (e.g. "Astrologer is busy"). */
  createOrJoinSession: (providerId: string) => Promise<CreateOrJoinResult>
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
  const [lastConnectError, setLastConnectError] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<any | null>(null)
  const [sessionStatus, setSessionStatus] = useState<'pending' | 'active' | 'ended' | null>(null)
  // `tokenVersion` is bumped whenever we detect the auth token has rotated, to
  // re-run the connection effect with a fresh `token` query param.
  const [tokenVersion, setTokenVersion] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const sessionUpdateCallbacks = useRef<Set<(sessionData: any) => void>>(new Set())
  const sessionStatusCallbacks = useRef<Set<(status: string, sessionId: string) => void>>(new Set())

  // Watch for auth-token rotation: storage events (other tabs) + a 60s poll
  // (same-tab updates don't fire `storage`). When the token changes we bump
  // `tokenVersion` which forces the connection effect below to re-run.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastToken = getAuthToken() || ''
    const check = () => {
      const t = getAuthToken() || ''
      if (t !== lastToken) {
        lastToken = t
        setTokenVersion((v) => v + 1)
      }
    }
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.toLowerCase().includes('token')) check()
    }
    window.addEventListener('storage', onStorage)
    const id = window.setInterval(check, 60_000)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(id)
    }
  }, [])

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
      setIsConnected(true);
      setLastConnectError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('[SessionManager] socket connect_error:', error?.message);
      setIsConnected(false);
      setLastConnectError(error?.message || 'Connection error');
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
    // Re-establish the socket when the auth token rotates so the chat-service
    // re-validates with the new JWT (avoids 401-after-refresh edge cases).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenVersion])

  // Creates (or reuses) a chat session via REST `POST /api/chat/create-session`.
  // The backend returns `{ thread, session }`. Our REST helper normalises that
  // to `{ threadId, sessionId }` which is what the rest of the UI needs.
  // Returns a discriminated union so the caller can show backend errors
  // (e.g. "Astrologer is busy", "Insufficient balance to start session").
  const createOrJoinSession = async (providerId: string): Promise<CreateOrJoinResult> => {
    const userDetails = getUserDetails()
    const userId = userDetails?.id || userDetails?._id
    if (!userId) {
      console.warn('[SessionManager] User not authenticated')
      return { ok: false, message: 'Please sign in to start a chat', status: 401 }
    }
    if (!providerId) {
      console.warn('[SessionManager] providerId is required')
      return { ok: false, message: 'Astrologer not selected', status: 400 }
    }

    let result: Awaited<ReturnType<typeof createChatSession>>
    try {
      result = await createChatSession(String(userId), String(providerId))
    } catch (err: any) {
      console.warn('[SessionManager] createOrJoinSession failed:', err)
      return { ok: false, message: err?.message || 'Failed to create chat session', status: 0 }
    }

    if (!result.ok) {
      return { ok: false, message: result.error.message, status: result.error.status }
    }

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

    // Join the socket room (best-effort — chat page also re-joins on mount).
    await joinSessionRoom(result.data.threadId, result.data.sessionId, false).catch(() => false)
    return { ok: true, threadId: result.data.threadId, sessionId: result.data.sessionId }
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
    lastConnectError,
    createOrJoinSession,
    joinSessionRoom,
    currentSession,
    sessionStatus,
    onSessionUpdate,
    onSessionStatusChange,
  }

  return <SessionManagerContext.Provider value={value}>{children}</SessionManagerContext.Provider>
}
