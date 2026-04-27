'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

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
  onDeleteSession?: (session: Session) => void
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
  loadingMore = false,
  onDeleteSession
}: SidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null)
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

  const getChatUser = (session: Session): PopulatedUser | null => {
    if (!userRole) return null
    return userRole === 'user' ? session.providerId : session.userId
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return ''
    const now = new Date()
    const messageTime = new Date(timestamp)
    if (isNaN(messageTime.getTime())) return ''
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    }
    if (diffInHours < 48) {
      return 'Yesterday'
    }
    if (diffInHours < 24 * 7) {
      return messageTime.toLocaleDateString([], { weekday: 'short' })
    }
    return messageTime.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredSessions = sessions.filter(session => {
    const user = getChatUser(session)
    const searchText = (user?.name || '').toLowerCase()
    const lastMsg = (session.lastMessage || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return searchText.includes(query) || lastMsg.includes(query)
  })

  const handleMenuToggle = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenuSessionId(openMenuSessionId === sessionId ? null : sessionId)
  }

  const handleDeleteSession = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteSession) {
      onDeleteSession(session)
    }
    setOpenMenuSessionId(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-menu') && !target.closest('.menu-toggle-button')) {
        setOpenMenuSessionId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <aside className="w-full sm:w-85 md:w-96 bg-white flex flex-col border-r border-orange-100/50 h-screen overflow-hidden shadow-xl z-30">
      {/* Sidebar Header */}
      <div className="px-5 py-4 bg-white sticky top-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Chats</h2>
          <button 
            onClick={() => router.push('/call-with-astrologer')}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
            title="New Chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages or people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-200 text-sm placeholder:text-gray-500 transition-all duration-200"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Wallet (Optional row) */}
        {userRole !== 'friend' && (typeof userBalance === 'number' || balanceLoading) && (
          <div className="flex items-center justify-between px-3 py-2 bg-orange-50/50 rounded-lg border border-orange-100/50">
            <div className="flex items-center gap-2 text-orange-800">
               <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Balance</span>
               <span className="text-sm font-bold">{balanceLoading ? '...' : `₹${Math.max(0, Math.floor(userBalance ?? 0))}`}</span>
            </div>
            <button onClick={onRefreshBalance} className="text-[11px] font-bold text-orange-600 hover:underline uppercase tracking-wider">Refill</button>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-gray-50">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center space-y-4">
             <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm text-gray-500 font-medium animate-pulse">Loading conversations...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
               <svg className="w-10 h-10 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
               </svg>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-gray-900">No chats found</p>
              <p className="text-xs text-gray-500 leading-relaxed px-4">
                {searchQuery ? "We couldn't find any chats matching your search." : "Your conversation list is empty. Start your journey today!"}
              </p>
            </div>
          </div>
        ) : (
          filteredSessions.map(session => {
            const user = getChatUser(session)
            const isSelected = selectedSession?.sessionId === session.sessionId
            const unreadCount = (userRole === 'user' || userRole === 'friend') ? session.userUnreadCount : session.providerUnreadCount

            return (
              <div
                key={session.sessionId}
                onClick={() => onSelectSession(session)}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200 border-l-4 ${
                  isSelected ? 'bg-orange-50 border-orange-500 shadow-inner' : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full ring-2 ring-white shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {session.status === 'active' && (
                    <span className="absolute bottom-0 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-[15px] font-bold truncate ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                      {user?.name || 'User'}
                    </h3>
                    <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-2">
                      {formatTime(session.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${unreadCount && unreadCount > 0 ? 'text-gray-950 font-bold' : 'text-gray-500'}`}>
                      {session.lastMessage || 'No messages yet'}
                    </p>
                    {unreadCount && unreadCount > 0 ? (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount}
                      </span>
                    ) : (
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={(e) => handleMenuToggle(session.sessionId, e)}
                           className="menu-toggle-button p-1 hover:bg-gray-200 rounded-md transition-colors"
                         >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                         </button>
                         {openMenuSessionId === session.sessionId && (
                           <div className="dropdown-menu absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden">
                              <button
                                onClick={(e) => handleDeleteSession(session, e)}
                                className="w-full px-4 py-2 text-left text-xs text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear Chat
                              </button>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Load More */}
        {hasMoreSessions && (
          <div ref={loadMoreRef} className="p-6 flex items-center justify-center">
            {loadingMore ? (
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xs text-gray-400 font-medium">Scroll to load more</span>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
