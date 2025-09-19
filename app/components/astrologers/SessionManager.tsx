'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getUserDetails } from '../../utils/auth-utils'

interface SessionManagerContextType {
  socket: Socket | null
  isConnected: boolean
  createOrJoinSession: (providerId: string) => Promise<string | null>
  joinSessionRoom: (sessionId: string, providerId: string) => Promise<boolean>
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

    const newSocket = io('http://localhost:7001', {
      query: { userId, usertype: userRole },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => setIsConnected(true))
    newSocket.on('disconnect', () => setIsConnected(false))
    newSocket.on('connect_error', () => setIsConnected(false))

    // ✅ Session events
    newSocket.on('session_created', (data) => {
      setCurrentSession(data)
      setSessionStatus('pending')
      sessionUpdateCallbacks.current.forEach((cb) => cb(data))
    })

    newSocket.on('user_joined', (data) => {
      setCurrentSession((prev: any) => (prev ? { ...prev, ...data } : data))
      sessionUpdateCallbacks.current.forEach((cb) => cb(data))
    })

    newSocket.on('session_started', (data) => {
      setSessionStatus('active')
      sessionStatusCallbacks.current.forEach((cb) => cb('active', data.sessionId))
    })

    newSocket.on('session_ended', (data) => {
      setSessionStatus('ended')
      sessionStatusCallbacks.current.forEach((cb) => cb('ended', data.sessionId))
    })

    newSocket.on('session_resumed', (data) => {
      setSessionStatus('pending')
      sessionStatusCallbacks.current.forEach((cb) => cb('pending', data.sessionId))
    })

    newSocket.on('session_status_updated', (data) => {
      setSessionStatus(data.status)
      sessionStatusCallbacks.current.forEach((cb) => cb(data.status, data.sessionId))
    })

    setSocket(newSocket)
    socketRef.current = newSocket

    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  // ✅ One function to rule them all
  const createOrJoinSession = async (providerId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!socketRef.current || !isConnected) {
        console.error('Socket not connected')
        resolve(null)
        return
      }

      const userDetails = getUserDetails()
      const userId = userDetails?.id || userDetails?._id
      if (!userId) {
        console.error('User not authenticated')
        resolve(null)
        return
      }

      // 1️⃣ Check existing sessions first
      socketRef.current.emit('get_all_sessions', { userId, role: 'user' }, (resp: any) => {
        if (resp.success && resp.data?.sessions) {
          const existing = resp.data.sessions.find(
            (s: any) => s.providerId?._id === providerId && ['pending', 'active'].includes(s.status)
          )

          if (existing) {
            console.log('✅ Reusing existing session:', existing.sessionId)
            // Just join existing session room
            joinSessionRoom(existing.sessionId, providerId).then(() => resolve(existing.sessionId))
            return
          }
        }

        // 2️⃣ If not found, create new one
        console.log('⚡ Creating new session...')
        socketRef.current!.emit(
          'session_update',
          { userId, providerId, role: 'user' },
          (response: any) => {
            if (!response.error && response.data?.sessionId) {
              console.log('✅ New session created:', response.data.sessionId)
              resolve(response.data.sessionId)
            } else {
              console.error('❌ Session creation failed:', response.message)
              resolve(null)
            }
          }
        )
      })
    })
  }

  const joinSessionRoom = async (sessionId: string, providerId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socketRef.current || !isConnected) {
        resolve(false)
        return
      }

      const userDetails = getUserDetails()
      const userId = userDetails?.id || userDetails?._id
      if (!userId) {
        resolve(false)
        return
      }

      socketRef.current.emit(
        'session_update',
        { sessionId, userId, providerId, role: 'user' },
        (response: any) => resolve(!response.error)
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
