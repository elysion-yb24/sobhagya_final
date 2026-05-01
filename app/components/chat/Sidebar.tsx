'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Filter, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PresenceDot from './PresenceDot'

interface PopulatedUser {
  _id: string
  name: string
  avatar?: string
}

interface Session {
  providerId: PopulatedUser
  userId: PopulatedUser
  sessionId: string
  lastMessage: string
  lastMessageType?: string
  createdAt: string
  status: 'active' | 'ended' | 'pending'
  userUnreadCount?: number
  providerUnreadCount?: number
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
  onLoadMoreSessions?: () => void
  hasMoreSessions?: boolean
  loadingMore?: boolean
}

export default function Sidebar({
  sessions,
  selectedSession,
  userRole,
  userBalance,
  balanceLoading,
  loading,
  error,
  onSelectSession,
  onRefreshBalance,
  onLoadMoreSessions,
  hasMoreSessions = false,
  loadingMore = false,
}: SidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [mounted, setMounted] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreSessions && !loadingMore && onLoadMoreSessions) {
          onLoadMoreSessions()
        }
      },
      { threshold: 0.1 }
    )
    const node = loadMoreRef.current
    if (node) observer.observe(node)
    return () => {
      if (node) observer.unobserve(node)
    }
  }, [hasMoreSessions, loadingMore, onLoadMoreSessions])

  const filteredSessions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return sessions.filter((s) => {
      const peer = userRole === 'user' ? s.providerId : s.userId
      if (onlineOnly && s.status !== 'active') return false
      if (!q) return true
      return peer?.name?.toLowerCase().includes(q) || s.lastMessage?.toLowerCase().includes(q)
    })
  }, [sessions, searchQuery, onlineOnly, userRole])

  const totalUnread = useMemo(() => {
    return sessions.reduce((sum, s) => sum + (userRole === 'user' ? s.userUnreadCount || 0 : s.providerUnreadCount || 0), 0)
  }, [sessions, userRole])

  return (
    <aside className="w-full h-full bg-white flex flex-col relative overflow-hidden border-r border-saffron-100">
      {/* Sidebar Header */}
      <div className="px-4 pt-6 pb-4 bg-gradient-to-b from-saffron-50/50 to-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-garamond text-2xl font-bold text-saffron-900">Chats</h2>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-saffron-500 text-white text-[10px] font-bold shadow-sm">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <button 
            onClick={() => router.push('/call-with-astrologer')}
            className="p-2 rounded-full bg-saffron-100 text-saffron-700 hover:bg-saffron-200 transition active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-saffron-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-200 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
              onlineOnly
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-white text-gray-600 border-saffron-100 hover:border-saffron-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlineOnly ? 'bg-white' : 'bg-emerald-500'}`} />
            Online
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
             <div className="w-8 h-8 border-[3px] border-saffron-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-xs text-gray-400 font-medium italic">Aligning stars...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            onlineOnly={onlineOnly}
            onFindAstrologer={() => router.push('/call-with-astrologer')}
          />
        ) : (
          <div className="flex flex-col">
            {filteredSessions.map((session) => {
              const peer = userRole === 'user' ? session.providerId : session.userId
              const isSelected = selectedSession?.sessionId === session.sessionId
              const unreadCount = userRole === 'user' ? session.userUnreadCount || 0 : session.providerUnreadCount || 0
              const isOnline = session.status === 'active'

              return (
                <button
                  key={session.sessionId}
                  onClick={() => onSelectSession(session)}
                  className={`flex items-center gap-3 px-4 py-3.5 text-left transition relative ${
                    isSelected ? 'bg-saffron-50/80' : 'hover:bg-gray-50'
                  }`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-saffron-500" />}
                  
                  <div className="relative flex-shrink-0">
                    {/* Instagram-style gradient story-ring for online astrologers */}
                    <div
                      className={`p-[2px] rounded-full ${
                        isOnline
                          ? 'bg-gradient-to-tr from-saffron-500 via-amber-400 to-saffron-300 shadow-sm'
                          : 'bg-saffron-100'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white relative ring-2 ring-white">
                        {peer?.avatar ? (
                          <Image src={peer.avatar} alt={peer?.name || ''} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-saffron-200 to-saffron-400 flex items-center justify-center text-white font-bold text-lg">
                            {peer?.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <PresenceDot status={isOnline ? 'online' : 'offline'} size={12} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className={`text-[15px] truncate ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                        {peer?.name || 'User'}
                      </h3>
                      <span className={`text-[10px] tabular-nums whitespace-nowrap ${unreadCount > 0 ? 'text-saffron-600 font-bold' : 'text-gray-400'}`}>
                        {mounted ? formatSidebarTime(session.createdAt) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {session.lastMessageType === 'image' && '📷 Photo'}
                        {session.lastMessage || 'Start a conversation'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-saffron-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        <div ref={loadMoreRef} className="h-4" />
      </div>
    </aside>
  )
}

function formatSidebarTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 3600000
  if (diffH < 24) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  if (diffH < 48) return 'Yesterday'
  if (diffH < 168) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function EmptyState({
  searchQuery,
  onlineOnly,
  onFindAstrologer,
}: {
  searchQuery: string
  onlineOnly: boolean
  onFindAstrologer: () => void
}) {
  if (searchQuery || onlineOnly) {
    return (
      <div className="p-10 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-saffron-50 flex items-center justify-center">
          <Filter className="w-6 h-6 text-saffron-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">No matches</p>
          <p className="text-xs text-gray-500 mt-1">Try a different search or filter.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-10 text-center space-y-4">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-saffron-100 to-saffron-200 flex items-center justify-center shadow-inner">
        <span className="text-3xl">🪔</span>
      </div>
      <div className="space-y-1">
        <p className="font-garamond text-lg text-saffron-900 font-semibold">Begin your journey</p>
        <p className="text-xs text-gray-500 leading-relaxed px-4">
          Connect with a Sobhagya astrologer for guidance, blessings, and clarity.
        </p>
      </div>
      <button
        onClick={onFindAstrologer}
        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
      >
        Find an astrologer
      </button>
    </div>
  )
}
