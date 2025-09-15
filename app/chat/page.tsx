'use client'

import React, { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Sidebar from '../components/chat/Sidebar'
import ChatHeader from '../components/chat/ChatHeader'
import ChatMessages from '../components/chat/ChatMessages'
import ChatInput from '../components/chat/ChatInput'

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
  isAutomated?: boolean
  messageId?: string
  options?: Array<{
    optionId: string
    optionText: string
  }>
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
    consultationDetails?: {
      consultationFor: 'self' | 'someone_else'
      personDetails: {
        name?: string
        age?: string
        placeOfBirth?: string
        timeOfBirth?: string
        timeOfBirthType?: 'exact' | 'approximate' | 'unknown'
      }
      userProfileDetails: {
        name?: string
        age?: string
        placeOfBirth?: string
        timeOfBirth?: string
      }
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
  
  // New wallet states
  const [sessionDuration, setSessionDuration] = useState<number>(0)
  const [sessionCost, setSessionCost] = useState<number>(0)
  const [initialBalance, setInitialBalance] = useState<number>(0)
  const [insufficientBalance, setInsufficientBalance] = useState<boolean>(false)
  const [endingSession, setEndingSession] = useState<boolean>(false)
  const [showEndSessionDialog, setShowEndSessionDialog] = useState<boolean>(false)

  // Consultation flow states
  const [consultationFlowActive, setConsultationFlowActive] = useState<boolean>(false)
  const [waitingForAstrologer, setWaitingForAstrologer] = useState<boolean>(false)
  const [lastMessageWithOptions, setLastMessageWithOptions] = useState<Message | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const selectedSessionRef = useRef<Session | null>(selectedSession)
  const userIdRef = useRef<string | null>(userId)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartTimeRef = useRef<Date | null>(null)

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

    socket.on('receive_message', (msg: any) => {
      console.log('[Socket] Received message:', msg);
    
      if (!selectedSessionRef.current || msg.sessionId !== selectedSessionRef.current.sessionId) return;
    
      let sender: Message['sender'] = 'astrologer';
      if (msg.isAutomated || msg.sentBy === 'system') sender = 'system';
      else if (msg.sentBy === userIdRef.current) sender = 'user';
    
      const newMessage: Message = {
        id: msg._id || `msg-${Date.now()}`,
        text: msg.message || '', // fallback if missing
        sender,
        timestamp: msg.createdAt || new Date().toISOString(),
        messageType: msg.messageType || 'text',
        fileLink: msg.fileLink,
        replyMessage: msg.replyMessage,
        sentByName: msg.sentByName,
        sentByProfileImage: msg.sentByProfileImage,
        voiceMessageDuration: msg.voiceMessageDuration,
        isAutomated: msg.isAutomated || false,
        messageId: msg.messageId,
        options: msg.options || [] 
      };
    
      setMessages(prev => [...prev, newMessage]);
    
      // Track last message with options for automated flow
      if (msg.messageType === 'options' && Array.isArray(msg.options) && msg.options.length > 0) {
        console.log('[Socket] Automated message with options:', msg.options);
        setLastMessageWithOptions(newMessage);
        setConsultationFlowActive(true);
      } else if (msg.isAutomated && (!msg.options || msg.options.length === 0)) {
        setLastMessageWithOptions(null);
      }
    });
    
    

    socket.on('user_joined', (data: { userId: string, role: string, sessionId: string }) => {
      if (selectedSessionRef.current?.sessionId !== data.sessionId) return
      if (data.role === 'astrologer' && waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current)
        waitingTimerRef.current = null
        setWaitingForAstrologer(false)
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

    // ✅ Updated session tick handler with cost calculation
    socket.on('session_tick', (data: { sessionId: string, remainingTime: number }) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setRemainingTime(data.remainingTime)
        
        // Update session duration and cost
        if (sessionStartTimeRef.current) {
          const currentDuration = Math.floor((new Date().getTime() - sessionStartTimeRef.current.getTime()) / 1000)
          setSessionDuration(currentDuration)
          
          if (selectedSessionRef.current?.rpm) {
            const cost = (currentDuration / 60) * selectedSessionRef.current.rpm
            setSessionCost(cost)
          }
        }
      }
    })

    // ✅ Updated session ended handler with payment result
    socket.on('session_ended', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'ended' } : prev)
        
        // Show payment result with detailed information
        if (data.paymentResult) {
          if (data.paymentResult.success) {
            toast.success(`Session ended successfully! Final cost: ₹${data.finalCost?.toFixed(2) || '0.00'}, Duration: ${data.sessionDuration || 0}s`)
          } else {
            toast.error(`Session ended but payment failed: ${data.paymentResult.message}`)
          }
        } else {
          toast.error(data.message || 'Session ended due to timeout')
        }
        
        // Reset session tracking
        sessionStartTimeRef.current = null
        setSessionDuration(0)
        setSessionCost(0)
        setConsultationFlowActive(false)
        setWaitingForAstrologer(false)
        setLastMessageWithOptions(null)
        setEndingSession(false)
        setShowEndSessionDialog(false)
        
        // Refresh balance after session ends
        if (userRole === 'user') {
          fetchUserBalance()
        }
      }
      
      // ✅ Update sessions list in real-time
      setSessions(prev => prev.map(session => 
        session.sessionId === data.sessionId 
          ? { ...session, status: 'ended' }
          : session
      ))
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
        
        // Start session tracking
        sessionStartTimeRef.current = new Date()
        setInitialBalance(data.data?.remainingBalance || 0)
        
        // Refresh balance when session starts
        if (userRole === 'user') {
          fetchUserBalance()
        }
      }
      
      // ✅ Update sessions list in real-time
      setSessions(prev => prev.map(session => 
        session.sessionId === data.sessionId 
          ? { ...session, status: 'active' }
          : session
      ))
    })

    socket.on('session_restarted', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'active' } : prev)
        toast.success('Session restarted')
      }
      
      // ✅ Update sessions list in real-time
      setSessions(prev => prev.map(session => 
        session.sessionId === data.sessionId 
          ? { ...session, status: 'active' }
          : session
      ))
    })

    // ✅ Handle general session status updates
    socket.on('session_status_updated', (data: any) => {
      if (data.sessionId && data.status) {
        // Update sessions list
        setSessions(prev => prev.map(session => 
          session.sessionId === data.sessionId 
            ? { ...session, status: data.status }
            : session
        ))
        
        // Update selected session if it's the same session
        if (selectedSessionRef.current?.sessionId === data.sessionId) {
          setSelectedSession(prev => prev ? { ...prev, status: data.status } : prev)
        }
      }
    })

    // ✅ Handle low balance warning
    socket.on('low_balance_warning', (data: any) => {
      if (selectedSessionRef.current?.sessionId === data.sessionId) {
        toast.error(data.message || `Low balance: ${data.remainingMinutes} minutes remaining`)
        setUserBalance(data.remainingBalance)
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
            voiceMessageDuration: m.voiceMessageDuration,
            isAutomated: m.isAutomated || false,
            messageId: m.messageId,
            options: m.options
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

  // Session duration timer
  useEffect(() => {
    if (selectedSession?.status === 'active' && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date()
    }
    
    if (selectedSession?.status !== 'active') {
      sessionStartTimeRef.current = null
      setSessionDuration(0)
      setSessionCost(0)
    }
  }, [selectedSession?.status])

  const handleSelectSession = async (session: Session) => {
    if (!socketRef.current || !userId) return
    
    // Check balance before starting session (for users only)
    if (userRole === 'user') {
      const hasBalance = await checkBalanceBeforeSession()
      if (!hasBalance) return
    }
    
    socketRef.current.emit(
      "session_update",
      { 
        sessionId: session.sessionId, 
        userId, 
        providerId: session.providerId,
        providerRpm: 10 
      },
      (res: any) => {
        if (!res.error && res.data) {
          const updatedSession = { ...session, status: res.data.status }
          setSelectedSession(updatedSession)
          
          // ✅ Update sessions list in real-time
          setSessions(prev => prev.map(s => 
            s.sessionId === session.sessionId 
              ? { ...s, status: res.data.status }
              : s
          ))
          
          router.push(`/chat?sessionId=${session.sessionId}`),
          {shallow: true}
          
        } else {
          setError(res.message)
          toast.error(res.message || 'Failed to start session')
        }
      }
    )
  }

  const checkBalanceBeforeSession = async (): Promise<boolean> => {
    try {
      const balance = await fetchUserBalance()
      if (balance < 10) { // Minimum balance check (1 minute worth)
        toast.error('Insufficient balance to start chat session. Please top up your wallet.')
        return false
      }
      return true
    } catch (error) {
      console.error('Error checking balance:', error)
      toast.error('Unable to check balance. Please try again.')
      return false
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession || !socketRef.current || !userId) return
    
    // Check for insufficient balance before sending
    if (insufficientBalance) {
      toast.error("Insufficient balance to send message")
      return
    }
    
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
        // Handle insufficient balance error
        if (res.message?.includes('Insufficient balance')) {
          setInsufficientBalance(true)
          toast.error("Insufficient balance to send message")
        } else {
          toast.error(res.message || 'Failed to send message')
        }
      }
    })
  }

  const handleOptionSelect = (optionId: string, messageId: string) => {
    if (!selectedSession || !socketRef.current || !userId) return

    const messageData = {
      message: optionId,
      sessionId: selectedSession.sessionId,
      userId,
      sentBy: userId,
      providerId: selectedSession.providerId,
      messageType: 'text' as const,
      messageId: messageId, // Pass the messageId for automated flow handling
      sentByName: 'User',
      sentByProfileImage: '',
      
    }

    socketRef.current.emit('send_message', messageData, (res: any) => {
      if (!res.error) {
        // Add user's selection to messages
        setMessages(prev => [...prev, {
          id: res.data._id,
          text: optionId,
          sender: 'user',
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }])
      } else {
        toast.error(res.message || 'Failed to send selection')
      }
    })
  }

  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current)
    }
  }, [])


  const fetchUserBalance = async (): Promise<number> => {
    if (!userId) return 0
    
    setBalanceLoading(true)
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      if (!token) {
        console.log('No auth token found')
        setBalanceLoading(false)
        return 0
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
          const balance = data.data.balance || 0
          setUserBalance(balance)
          console.log('User balance fetched:', balance)
          setBalanceLoading(false)
          return balance
        }
      } else {
        console.error('Failed to fetch balance:', response.status)
      }
    } catch (error) {
      console.error('Error fetching user balance:', error)
    } finally {
      setBalanceLoading(false)
    }
    return 0
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
    
    // Show confirmation dialog with session details
    setShowEndSessionDialog(true)
  }

  const confirmEndSession = () => {
    if (!selectedSession || !userId || !socketRef.current) return
    
    setEndingSession(true)
    setShowEndSessionDialog(false)
    
    socketRef.current.emit('end_session', {
      sessionId: selectedSession.sessionId,
      userId
    }, (response: any) => {
      setEndingSession(false)
      
      if (response.error) {
        toast.error(response.message || 'Failed to end session')
      } else {
        // The session_ended event will handle the success message with payment details
        console.log('Session end request sent successfully')
      }
    })
  }

  const cancelEndSession = () => {
    setShowEndSessionDialog(false)
  }


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sessions={sessions}
        selectedSession={selectedSession}
        userRole={userRole}
        userBalance={userBalance}
        balanceLoading={balanceLoading}
        loading={loading}
        error={error}
        onSelectSession={handleSelectSession}
        onRefreshBalance={fetchUserBalance}
      />

      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            <ChatHeader
              selectedSession={selectedSession}
              userRole={userRole}
              userBalance={userBalance}
              remainingTime={remainingTime}
              sessionCost={sessionCost}
              sessionDuration={sessionDuration}
              consultationFlowActive={consultationFlowActive}
              waitingForAstrologer={waitingForAstrologer}
              insufficientBalance={insufficientBalance}
              endingSession={endingSession}
              onEndSession={handleEndSession}
            />

            <ChatMessages
              ref={chatContainerRef}
              messages={messages}
              userId={userId}
              onReplyToMessage={handleReplyToMessage}
              onOptionSelect={handleOptionSelect}
            />

            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              replyToMessage={replyToMessage}
              setReplyToMessage={setReplyToMessage}
              showFileUpload={showFileUpload}
              setShowFileUpload={setShowFileUpload}
              selectedSessionStatus={selectedSession.status}
              insufficientBalance={insufficientBalance}
              onSendMessage={handleSendMessage}
              onFileSelect={handleFileSelect}
              automatedFlowActive={consultationFlowActive}
              waitingForAstrologer={waitingForAstrologer}
              lastMessageWithOptions={lastMessageWithOptions}
              onOptionSelect={handleOptionSelect}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* End Session Confirmation Dialog */}
      {showEndSessionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              End Session Confirmation
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Session Duration:</span>
                <span className="font-medium">
                  {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Session Cost:</span>
                <span className="font-medium text-orange-600">
                  ₹{sessionCost.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-medium text-green-600">
                  ₹{userBalance?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              {sessionCost > 0 && userBalance !== null && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Balance After Payment:</span>
                  <span className={`font-medium ${(userBalance - sessionCost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(userBalance - sessionCost).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelEndSession}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
