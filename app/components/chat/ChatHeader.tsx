'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface PopulatedUser {
  _id: string
  name?: string
  avatar?: string
}

interface Session {
  providerId: PopulatedUser
  sessionId: string
  status: 'active' | 'ended' | 'pending'
  userId?: PopulatedUser
}

interface ChatHeaderProps {
  selectedSession: Session
  userRole: string | null
  insufficientBalance: boolean
  endingSession: boolean
  onEndSession: () => void
  onContinueChat?: () => void
  sessionDuration?: string | null
  userBalance?: number | null
  peerTyping?: boolean
}

export default function ChatHeader({
  selectedSession,
  userRole,
  insufficientBalance,
  endingSession,
  onEndSession,
  onContinueChat,
  sessionDuration,
  userBalance,
  peerTyping,
}: ChatHeaderProps) {
  const router = useRouter()

  const handleBackClick = () => {
    router.push('/chat')
  }

  const participant = userRole === 'friend' ? selectedSession.userId : selectedSession.providerId
  const avatarLetter = participant?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <header className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-white/95 backdrop-blur-md border-b border-orange-100/50 shadow-[0_2px_15px_-3px_rgba(247,148,29,0.07)] sticky top-0 z-50">
      {/* Participant Info */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        <button
          onClick={handleBackClick}
          className="p-1.5 hover:bg-orange-50 rounded-full transition-all duration-200 active:scale-90 group"
          title="Back"
        >
          <svg className="w-6 h-6 text-orange-600 group-hover:text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-full ring-2 ring-orange-50 overflow-hidden shadow-sm">
            {participant?.avatar ? (
              <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm">
                {avatarLetter}
              </div>
            )}
          </div>
          {selectedSession.status === 'active' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm md:text-[15px] font-bold text-gray-900 truncate tracking-tight">
            {participant?.name || 'Astrologer'}
          </h1>
          <div className="flex items-center gap-1.5">
            {peerTyping ? (
              <span className="text-[11px] md:text-xs font-semibold text-green-600 animate-pulse">typing...</span>
            ) : (
              <span className={`text-[11px] md:text-xs font-medium ${selectedSession.status === 'active' ? 'text-orange-500' : 'text-gray-400'}`}>
                {selectedSession.status === 'active' ? 'Online' : 'Last seen recently'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Timer Pill */}
        {sessionDuration && selectedSession.status === 'active' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 rounded-full border border-orange-100/50 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs md:text-sm font-bold font-mono text-orange-700">{sessionDuration}</span>
          </div>
        )}

        {/* Balance (User Role) */}
        {userRole !== 'friend' && typeof userBalance === 'number' && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${
            insufficientBalance ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
          }`}>
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs md:text-sm font-bold">₹{Math.floor(userBalance)}</span>
          </div>
        )}

        {/* Action Button */}
        {selectedSession.status === 'active' ? (
          <button
            onClick={onEndSession}
            disabled={endingSession}
            className="px-3 md:px-5 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-red-100 hover:shadow-red-200 transition-all duration-200 active:scale-95"
          >
            {endingSession ? 'Ending...' : 'End Chat'}
          </button>
        ) : selectedSession.status === 'ended' && onContinueChat && userRole !== 'friend' ? (
          <button
            onClick={onContinueChat}
            className="px-3 md:px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all duration-200 active:scale-95"
          >
            Continue
          </button>
        ) : selectedSession.status === 'pending' ? (
          <div className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-100 animate-pulse uppercase tracking-wider">
            Connecting...
          </div>
        ) : null}
      </div>
    </header>
  )
}
