'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

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
  onToggleSidebar?: () => void
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
  onToggleSidebar,
  onLoadMoreSessions,
  hasMoreSessions = false,
  loadingMore = false
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreSessions && !loadingMore && onLoadMoreSessions) {
          onLoadMoreSessions()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [hasMoreSessions, loadingMore, onLoadMoreSessions])

  // ✅ Directly get user from populated fields
  const getChatUser = (session: Session): PopulatedUser | null => {
    if (!userRole) return null
    return userRole === 'user' ? session.providerId : session.userId
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[messageTime.getDay()]
    }
  }

  const filteredSessions = sessions.filter(session => {
    const user = getChatUser(session)
    const searchText = user?.name?.toLowerCase() || ''
    return (
      searchText.includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="w-80 bg-white flex flex-col border-r border-gray-200 h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-orange-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSidebar && onToggleSidebar()}
            className="p-2 hover:bg-orange-50 rounded-full"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Chats ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading chats…</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No chats available</div>
        ) : (
          <div>
            {filteredSessions.map(session => {
              const user = getChatUser(session)
              const isSelected = selectedSession?.sessionId === session.sessionId

              return (
                <div
                  key={session.sessionId}
                  onClick={() => onSelectSession(session)}
                  className={`group relative border-b border-orange-100 cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-orange-50' : 'hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Avatar */}
                    <div className="relative">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                          {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>

                    {/* Name + Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate text-sm text-gray-900">
                          {user?.name || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTime(session.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate text-gray-500 flex-1">
                          {session.lastMessage && session.lastMessage.trim() !== "" ?session.lastMessage : 'No messages yet'}
                        </p>
                        {(() => {
                          const unreadCount = (userRole === 'user' || userRole === 'friend') ? session.userUnreadCount : session.providerUnreadCount;
                          return unreadCount && unreadCount > 0 ? (
                            <div className="ml-2 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                              {unreadCount}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Load More Trigger */}
            {hasMoreSessions && (
              <div ref={loadMoreRef} className="p-4 text-center">
                {loadingMore ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading more...</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">Scroll to load more</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
