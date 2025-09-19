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
  onClearChat: () => void
  sessionDuration?: string | null
}

export default function ChatHeader({
  selectedSession,
  userRole,
  insufficientBalance,
  endingSession,
  onEndSession,
  onContinueChat,
  onClearChat,
  sessionDuration
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
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-orange-200">
      {/* Back Button + Avatar + Name + Status */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-orange-50 rounded-full transition-colors"
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
        <div className="relative">
          {participant?.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name || 'Avatar'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
              {avatarLetter}
            </div>
          )}

          {/* Online indicator */}
          {selectedSession.status === 'active' && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
          )}
        </div>

        {/* Name + Status */}
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-orange-800">
            {participant?.name ||
              `${userRole === 'friend' ? 'User' : 'Provider'} ${participant?._id?.slice(0, 8)}…`}
          </h3>
          <p className="text-xs text-orange-600">
            {selectedSession.status === 'active' ? 'online' : 'last seen recently'}
          </p>
        </div>
      </div>

      {/* Right-side Actions */}
      <div className="flex items-center gap-2">
        {/* Always show Clear Chat */}
        <button
          onClick={onClearChat}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          🗑️ Clear
        </button>

        {/* Active Session → End Session button */}
        {selectedSession.status === 'active' && (
          <button
            onClick={onEndSession}
            disabled={endingSession}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              endingSession
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
            }`}
          >
            {endingSession ? 'Ending...' : 'End Session'}
          </button>
        )}

        {/* Pending Session Indicator */}
        {selectedSession.status === 'pending' && (
          <div className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium border border-yellow-200">
            Waiting for provider...
          </div>
        )}

        {/* Ended Session → Continue Chat (non-friend users) */}
        {selectedSession.status === 'ended' && onContinueChat && userRole !== 'friend' && (
          <button
            onClick={onContinueChat}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 shadow-sm hover:shadow-md transition-colors"
          >
            Continue Chat
          </button>
        )}

        {/* Session Duration (for astrologer/friend role) */}
        {sessionDuration && (
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {sessionDuration}
          </div>
        )}
      </div>
    </div>
  )
}
