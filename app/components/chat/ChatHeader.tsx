'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreVertical, X, Wallet, LogOut } from 'lucide-react'
import PresenceDot from './PresenceDot'
import Avatar from './Avatar'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBack = () => router.push('/chat')

  const participant = userRole === 'friend' ? selectedSession.userId : selectedSession.providerId
  const presence: 'online' | 'busy' | 'offline' =
    selectedSession.status === 'active' ? 'online' : selectedSession.status === 'pending' ? 'busy' : 'offline'

  const statusText =
    peerTyping && selectedSession.status === 'active'
      ? 'typing…'
      : selectedSession.status === 'active'
      ? 'online'
      : selectedSession.status === 'pending'
      ? 'connecting…'
      : 'last seen recently'

  // close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  return (
    <header className="flex items-center gap-2 px-2 sm:px-4 h-14 sm:h-16 bg-white/95 backdrop-blur-xl border-b border-saffron-100/70 shadow-[0_2px_15px_-3px_rgba(247,148,29,0.08)] sticky top-0 z-30">
      {/* Back */}
      <button
        onClick={handleBack}
        className="p-2 -ml-1 rounded-full text-saffron-700 hover:bg-saffron-50 active:scale-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-300"
        aria-label="Back to chats"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Avatar + identity */}
      <button
        onClick={() => router.push('/call-with-astrologer')}
        className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 -ml-1 px-1 py-1 rounded-lg hover:bg-saffron-50/60 transition text-left"
      >
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-saffron-100 shadow-sm relative">
            <Avatar
              src={participant?.avatar}
              name={participant?.name}
              fallbackClassName="w-full h-full bg-gradient-to-br from-saffron-300 to-saffron-500 flex items-center justify-center text-white font-semibold"
            />
          </div>
          <span className="absolute bottom-0 right-0">
            <PresenceDot status={presence} size={11} />
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="font-garamond text-lg sm:text-xl font-bold text-gray-900 truncate leading-tight">
            {participant?.name || 'Astrologer'}
          </h1>
          <span
            className={`text-[11px] font-bold uppercase tracking-widest truncate ${
              peerTyping
                ? 'text-emerald-600 animate-pulse'
                : selectedSession.status === 'active'
                ? 'text-emerald-500'
                : 'text-gray-400'
            }`}
          >
            {statusText}
          </span>
        </div>
      </button>

      {/* Right cluster */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {mounted && sessionDuration && selectedSession.status === 'active' && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tabular-nums border shadow-sm ${
              insufficientBalance
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-saffron-50 text-saffron-700 border-saffron-100'
            }`}
            title="Session duration"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                insufficientBalance ? 'bg-red-500' : 'bg-saffron-500'
              } animate-pulse`}
            />
            {sessionDuration}
          </div>
        )}

        {selectedSession.status === 'active' ? (
          <button
            onClick={onEndSession}
            disabled={endingSession}
            className="hidden sm:inline-flex px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-xs font-bold rounded-full shadow-sm shadow-red-200 active:scale-95 transition"
          >
            {endingSession ? 'Ending…' : 'End'}
          </button>
        ) : selectedSession.status === 'ended' && onContinueChat && userRole !== 'friend' ? (
          <button
            onClick={onContinueChat}
            className="hidden sm:inline-flex px-3 py-1.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-xs font-bold rounded-full shadow-sm shadow-saffron-200 active:scale-95 transition"
          >
            Chat again
          </button>
        ) : null}

        {/* Overflow */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full text-gray-600 hover:bg-saffron-50 active:scale-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-300"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-saffron-100 overflow-hidden z-50 animate-in">
              {selectedSession.status === 'active' && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onEndSession()
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 font-semibold hover:bg-red-50 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  End session
                </button>
              )}
              {selectedSession.status === 'ended' && onContinueChat && userRole !== 'friend' && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onContinueChat()
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-saffron-700 font-semibold hover:bg-saffron-50 transition"
                >
                  Chat again
                </button>
              )}
              {userRole !== 'friend' && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.push('/wallet')
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-saffron-50 transition flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-saffron-500" />
                  Recharge wallet
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/chat')
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-saffron-50 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Back to chats
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
