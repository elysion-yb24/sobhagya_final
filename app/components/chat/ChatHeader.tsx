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
  /** Wallet balance in rupees. `null` while still loading or for roles that
   *  shouldn't see it (e.g. astrologer view). */
  userBalance?: number | null
  /** Peer's typing state — drives the "typing…" subtext under the name. */
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

  // Pick the correct participant (friend sees user, astrologer sees provider)
  const participant =
    userRole === 'friend' ? selectedSession.userId : selectedSession.providerId

  const avatarLetter =
    participant?.name?.charAt(0)?.toUpperCase() ||
    participant?._id?.charAt(0)?.toUpperCase() ||
    '?'

  return (
    <div className="flex items-center justify-between px-3 md:px-4 py-3 bg-white border-b border-orange-200 shadow-sm">
      {/* Back Button + Avatar + Name + Status */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        {/* Back Button - Only show on mobile */}
        <button
          onClick={handleBackClick}
          className="md:hidden p-2 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0"
          title="Back to chat list"
        >
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {participant?.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name || 'Avatar'}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-xs md:text-sm">
              {avatarLetter}
            </div>
          )}

          {/* Online indicator */}
          {selectedSession.status === 'active' && (
            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500"></div>
            </div>
          )}
        </div>

        {/* Name + Status */}
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-sm md:text-base font-medium text-orange-800 truncate">
            {participant?.name ||
              `${userRole === 'friend' ? 'User' : 'Provider'} ${participant?._id?.slice(0, 8)}…`}
          </h3>
          <p className="text-xs text-orange-600 truncate">
            {peerTyping
              ? 'typing…'
              : selectedSession.status === 'active'
                ? 'online'
                : selectedSession.status === 'pending'
                  ? 'waiting…'
                  : 'last seen recently'}
          </p>
        </div>
      </div>

      {/* Right-side Actions */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Session Duration pill — visible for the regular user role too. */}
        {sessionDuration && selectedSession.status === 'active' && (
          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-700 bg-gray-100 px-2 md:px-3 py-1 rounded-full" title="Session duration">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono tabular-nums">{sessionDuration}</span>
          </div>
        )}

        {/* Wallet balance pill (user role only). Turns amber on low balance. */}
        {userRole !== 'friend' && typeof userBalance === 'number' && (
          <div
            className={`hidden sm:flex items-center gap-1 text-xs md:text-sm px-2 md:px-3 py-1 rounded-full border ${
              insufficientBalance
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}
            title="Wallet balance"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
            <span className="font-medium">₹{Math.max(0, Math.floor(userBalance))}</span>
          </div>
        )}

        {/* Active Session → End Session button */}
        {selectedSession.status === 'active' && (
          <button
            onClick={onEndSession}
            disabled={endingSession}
            className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              endingSession
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
            }`}
          >
            <span className="hidden md:inline">{endingSession ? 'Ending...' : 'End Session'}</span>
            <span className="md:hidden">{endingSession ? 'End...' : 'End'}</span>
          </button>
        )}

        {/* Pending Session Indicator */}
        {selectedSession.status === 'pending' && (
          <div className="px-2 md:px-3 py-1 md:py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium border border-yellow-200">
            <span className="hidden md:inline">Waiting for provider...</span>
            <span className="md:hidden">Waiting...</span>
          </div>
        )}

        {/* Ended Session → Continue Chat (non-friend users) */}
        {selectedSession.status === 'ended' && onContinueChat && userRole !== 'friend' && (
          <button
            onClick={onContinueChat}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 shadow-sm hover:shadow-md transition-colors"
          >
            <span className="hidden md:inline">Continue Chat</span>
            <span className="md:hidden">Continue</span>
          </button>
        )}
      </div>
    </div>
  )
}
