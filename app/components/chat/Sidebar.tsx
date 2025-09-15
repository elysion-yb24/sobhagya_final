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

interface SidebarProps {
  sessions: Session[]
  selectedSession: Session | null
  userRole: string | null
  userBalance: number | null
  balanceLoading: boolean
  loading: boolean
  error: string | null
  onSelectSession: (session: Session) => void
  onRefreshBalance: () => void
}

const statusBadge = (status: Session['status']) => ({
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  ended: 'bg-red-100 text-red-800'
}[status])

export default function Sidebar({
  sessions,
  selectedSession,
  userRole,
  userBalance,
  balanceLoading,
  loading,
  error,
  onSelectSession,
  onRefreshBalance
}: SidebarProps) {
  return (
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
                  onClick={onRefreshBalance}
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
              onClick={() => onSelectSession(session)}
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
                  {/* {session.remainingBalance !== undefined && (
                    <span className="text-xs text-green-600">Balance: ₹{session.remainingBalance}</span>
                  )} */}
                  {session.sessionData?.consultationDetails && (
                    <span className="text-xs text-purple-600">
                      {session.sessionData.consultationDetails.consultationFor === 'self' ? 'Self' : 'Someone Else'}
                    </span>
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
  )
}
