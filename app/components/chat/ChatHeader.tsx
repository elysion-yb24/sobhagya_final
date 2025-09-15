'use client'

import React from 'react'

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

interface ChatHeaderProps {
  selectedSession: Session
  userRole: string | null
  userBalance: number | null
  remainingTime: number | null
  sessionCost: number
  sessionDuration: number
  consultationFlowActive: boolean
  waitingForAstrologer: boolean
  insufficientBalance: boolean
  endingSession: boolean
  onEndSession: () => void
}

const statusBadge = (status: Session['status']) => ({
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  ended: 'bg-red-100 text-red-800'
}[status])

const formatTime = (secs: number) =>
  `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export default function ChatHeader({
  selectedSession,
  userRole,
  userBalance,
  remainingTime,
  sessionCost,
  sessionDuration,
  consultationFlowActive,
  waitingForAstrologer,
  insufficientBalance,
  endingSession,
  onEndSession
}: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
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
            {consultationFlowActive && (
              <p className="text-xs text-purple-600">🔮 Consultation Flow Active</p>
            )}
            {waitingForAstrologer && (
              <p className="text-xs text-orange-600">⏳ Waiting for Astrologer...</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Wallet Balance Display */}
          {userBalance !== null && userRole === 'user' && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Balance</div>
              <div className="text-lg font-semibold text-green-600">
                ₹{userBalance.toFixed(2)}
              </div>
            </div>
          )}
          
          {/* Session Cost Display */}
          {selectedSession.status === 'active' && sessionCost > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Session Cost</div>
              <div className="text-lg font-semibold text-orange-600">
                ₹{sessionCost.toFixed(2)}
              </div>
            </div>
          )}
          
          {/* Session Duration Display */}
          {selectedSession.status === 'active' && sessionDuration > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatDuration(sessionDuration)}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(selectedSession.status)}`}>
              {selectedSession.status.toUpperCase()}
            </span>
            {selectedSession.status === 'active' && (
              <button
                onClick={onEndSession}
                disabled={endingSession}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  endingSession
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {endingSession ? 'Ending...' : 'End'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Insufficient Balance Warning */}
      {insufficientBalance && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
          <p className="text-sm text-red-800">
            ❌ Insufficient balance! You cannot send messages. Please top up your wallet.
          </p>
        </div>
      )}

      {/* Consultation Flow Status */}
      {consultationFlowActive && (
        <div className="mt-2 p-2 bg-purple-100 border border-purple-300 rounded-md">
          <p className="text-sm text-purple-800">
            🔮 Consultation flow is active. Please follow the prompts to complete your consultation setup.
          </p>
        </div>
      )}
    </div>
  )
}
