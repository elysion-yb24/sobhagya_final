'use client'

import React, { forwardRef, useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Reply, AlertCircle } from 'lucide-react'
import ReplyPreview from './ReplyPreview'
import SessionEndedCard from './SessionEndedCard'
import Avatar from './Avatar'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'astrologer' | 'system'
  timestamp: string
  messageType?: 'text' | 'voice' | 'image' | 'video' | 'file' | 'options' | 'informative' | 'info' | 'call'
  fileLink?: string
  replyMessage?: {
    id?: string
    message?: string
    replyTo?: string
    replyBy?: string
    messageType?: string
    voiceMessageDuration?: number
  } | null
  sentByName?: string
  sentByProfileImage?: string
  voiceMessageDuration?: number
  messageId?: string
  options?: Array<{
    optionId: string
    optionText: string
    nextFlow?: string
    disabled?: boolean
  }>
  isAutomated?: boolean
  clientMessageId?: string
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed'
}

interface ChatMessagesProps {
  messages: Message[]
  typingMessage?: Message | null
  userId: string | null
  userRole?: string | null
  selectedSession?: {
    userId?: { _id: string; name?: string; avatar?: string } | string | null
    providerId?: { _id: string; name?: string; avatar?: string } | string | null
  } | null
  onReplyToMessage?: (message: Message) => void
  onOptionSelect?: (optionId: string, messageId: string) => void
  onRetryMessage?: (clientMessageId: string) => void
  onOpenImage?: (messageId: string) => void
  onRequestActions?: (message: Message, isMine: boolean) => void
  unreadCount?: number
  sessionStatus?: 'active' | 'ended' | 'pending'
  onRate?: () => void
  onSendDakshina?: () => void
  onChatAgain?: () => void
}

const CHAT_BG_PATTERN =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23F7941D' stroke-opacity='0.06'%3E%3Cpath d='M80 14 L86 74 L146 80 L86 86 L80 146 L74 86 L14 80 L74 74 Z'/%3E%3Ccircle cx='80' cy='80' r='22'/%3E%3Ccircle cx='80' cy='80' r='34'/%3E%3C/g%3E%3C/svg%3E\")"

const CHAT_BG_STYLE: React.CSSProperties = {
  backgroundColor: '#FDF8F0',
  backgroundImage: `${CHAT_BG_PATTERN}, linear-gradient(180deg, rgba(253, 248, 240, 0.85) 0%, rgba(255, 248, 232, 0.5) 100%)`,
  backgroundRepeat: 'repeat',
  backgroundSize: '160px 160px',
  backgroundAttachment: 'fixed',
}

const formatBubbleTime = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

const formatDateLabel = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' })
  return d.toLocaleDateString([], {
    day: 'numeric',
    month: 'long',
    year: now.getFullYear() === d.getFullYear() ? undefined : 'numeric',
  })
}

const URL_RE = /(https?:\/\/[^\s]+)/g
function renderTextWithLinks(text: string, isUser: boolean) {
  if (!text) return null
  const parts = text.split(URL_RE)
  return parts.map((part, i) => {
    if (URL_RE.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline ${isUser ? 'text-white/95 hover:text-white' : 'text-saffron-700 hover:text-saffron-800'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

const TypingIndicator = ({ avatar, name }: { avatar?: string; name?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="flex items-end gap-2 mb-3 justify-start"
  >
    <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0 relative bg-saffron-100">
      {avatar ? (
        <Avatar
          src={avatar}
          name={name || 'Astrologer'}
          fallbackClassName="w-full h-full flex items-center justify-center bg-saffron-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Image src="/sobhagya-logo.svg" alt="" width={18} height={18} />
        </div>
      )}
    </div>
    <div className="bg-white/95 px-3 py-2.5 rounded-2xl rounded-bl-md shadow-sm border border-saffron-100">
      <div className="flex items-center gap-1 h-3">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-saffron-400"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay }}
          />
        ))}
      </div>
    </div>
  </motion.div>
)

const MessageTicks = ({ status }: { status?: 'sent' | 'delivered' | 'read' | 'failed' }) => {
  if (!status) return null
  if (status === 'failed') {
    return <AlertCircle className="w-3.5 h-3.5 text-red-300" />
  }
  const isRead = status === 'read'
  return (
    <span
      className={`inline-flex items-center ${isRead ? 'text-sky-300' : 'text-white/70'}`}
      aria-label={status}
    >
      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
        <path
          d="M2 9l3.5 3.5L11 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {status !== 'sent' && (
          <path
            d="M7 9l3.5 3.5L16 7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  )
}

interface BubbleProps {
  message: Message
  showAvatar: boolean
  showTail: boolean
  showName: boolean
  peerAvatar?: string
  peerName?: string
  isMine: boolean
  onOptionSelect?: (optionId: string, messageId: string) => void
  selectedOptionId?: string
  onRetryMessage?: (clientMessageId: string) => void
  onOpenImage?: (messageId: string) => void
  onRequestActions?: (message: Message, isMine: boolean) => void
  onSwipeReply?: (message: Message) => void
}

const MessageBubble = React.memo(function MessageBubble({
  message,
  showAvatar,
  showTail,
  showName,
  peerAvatar,
  peerName,
  isMine,
  onOptionSelect,
  selectedOptionId,
  onRetryMessage,
  onOpenImage,
  onRequestActions,
  onSwipeReply,
}: BubbleProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const fireActions = useCallback(() => {
    if (!onRequestActions) return
    onRequestActions(message, isMine)
  }, [onRequestActions, message, isMine])

  const onTouchStart = useCallback(() => {
    longPressFired.current = false
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      fireActions()
    }, 450)
  }, [fireActions])

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!onRequestActions) return
      e.preventDefault()
      fireActions()
    },
    [fireActions, onRequestActions]
  )

  // System / informative pill
  if (
    message.sender === 'system' ||
    message.messageType === 'info' ||
    message.messageType === 'informative' ||
    message.isAutomated
  ) {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className="bg-white/90 backdrop-blur-sm text-saffron-800 text-[12px] font-medium px-4 py-1.5 rounded-full border border-saffron-100 shadow-sm text-center max-w-[88%] leading-relaxed">
          {message.isAutomated && <span className="mr-1.5">🪔</span>}
          {message.text}
        </div>
      </div>
    )
  }

  const isImage = message.messageType === 'image' && !!message.fileLink
  const reply = message.replyMessage

  const bubbleColors = isMine
    ? 'bg-gradient-to-br from-saffron-500 to-saffron-600 text-white shadow-md shadow-saffron-200'
    : 'bg-white text-gray-800 border border-saffron-100 shadow-sm'

  const tailRadius = isMine
    ? `rounded-2xl ${showTail ? 'rounded-tr-md' : ''}`
    : `rounded-2xl ${showTail ? 'rounded-tl-md' : ''}`

  return (
    <div className={`flex w-full mb-1 ${isMine ? 'justify-end' : 'justify-start'} group/row`}>
      <div className={`flex max-w-[85%] sm:max-w-[68%] gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isMine && (
          <div className="flex-shrink-0 w-7 self-end mb-1">
            {showAvatar && (
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm relative bg-saffron-100">
                <Avatar
                  src={peerAvatar}
                  name={peerName}
                  fallbackClassName="w-full h-full bg-gradient-to-br from-saffron-300 to-saffron-500 flex items-center justify-center text-white text-[11px] font-semibold"
                />
              </div>
            )}
          </div>
        )}

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            const dx = info.offset.x
            const triggered = isMine ? dx < -60 : dx > 60
            if (triggered && onSwipeReply) onSwipeReply(message)
          }}
          className={`relative ${isImage ? 'p-1' : 'px-3 py-2'} ${tailRadius} ${bubbleColors} cursor-pointer touch-pan-y`}
          onContextMenu={onContextMenu}
          onTouchStart={onTouchStart}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onTouchCancel={cancelLongPress}
        >
          {onRequestActions && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fireActions()
              }}
              className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 ${
                isMine ? '-left-9' : '-right-9'
              } w-7 h-7 rounded-full bg-white border border-saffron-100 shadow-sm text-saffron-600 items-center justify-center opacity-0 group-hover/row:opacity-100 transition`}
              aria-label="Message actions"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          )}

          {!isMine && showName && message.sentByName && (
            <div className="text-[11px] font-semibold text-saffron-700 mb-0.5 px-0.5">
              {message.sentByName}
            </div>
          )}

          {reply && reply.message && (
            <div className={`mb-1.5 ${isImage ? 'mx-1' : ''}`}>
              <ReplyPreview
                authorLabel="Reply"
                text={reply.message}
                tone={isMine ? 'user' : 'astrologer'}
                variant="bubble"
              />
            </div>
          )}

          {isImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (longPressFired.current) return
                onOpenImage?.(message.id)
              }}
              className="block w-[220px] sm:w-[260px] aspect-[4/3] rounded-xl overflow-hidden bg-saffron-100/50 relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.fileLink}
                alt={message.text || 'Photo'}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
              {message.deliveryStatus === 'sent' && isMine && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          )}

          {(!isImage || (message.text && message.text.trim())) && (
            <div
              className={`${isImage ? 'px-2 pt-2 pb-1' : ''} text-[14px] sm:text-[15px] leading-snug whitespace-pre-wrap break-words`}
            >
              {renderTextWithLinks(message.text, isMine)}
              <span className="inline-block w-[58px]" aria-hidden />
            </div>
          )}

          <div
            className={`absolute ${
              isImage
                ? 'bottom-2 right-2 bg-black/40 px-1.5 py-0.5 rounded-md text-white'
                : 'bottom-1 right-2'
            } flex items-center gap-1 leading-none select-none ${
              isImage ? '' : isMine ? 'text-white/80' : 'text-gray-400'
            }`}
          >
            <span className="text-[10px] font-medium tabular-nums">{formatBubbleTime(message.timestamp)}</span>
            {isMine && <MessageTicks status={message.deliveryStatus || 'sent'} />}
          </div>
        </motion.div>

        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} self-end`}>
          {message.options && message.options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.options.map((opt) => {
                const selected = selectedOptionId === opt.optionId
                return (
                  <button
                    key={opt.optionId}
                    disabled={opt.disabled || !!selectedOptionId}
                    onClick={() => onOptionSelect?.(opt.optionId, message.messageId!)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border shadow-sm active:scale-95 ${
                      selected
                        ? 'bg-saffron-500 text-white border-saffron-600'
                        : 'bg-white text-saffron-700 border-saffron-200 hover:bg-saffron-50'
                    }`}
                  >
                    {opt.optionText}
                  </button>
                )
              })}
            </div>
          )}

          {isMine && message.deliveryStatus === 'failed' && (
            <button
              onClick={() => onRetryMessage?.(message.clientMessageId!)}
              className="mt-1 text-red-500 text-[11px] font-bold hover:underline px-1"
            >
              Tap to retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

const DateSeparator = ({ label }: { label: string }) => (
  <div className="flex justify-center my-4">
    <div className="bg-white/90 backdrop-blur-sm text-saffron-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider border border-saffron-100">
      {label}
    </div>
  </div>
)

const UnreadDivider = ({ count }: { count: number }) => (
  <div className="flex items-center gap-2 my-3 text-saffron-700 px-2">
    <div className="flex-1 h-px bg-saffron-200" />
    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-saffron-50 border border-saffron-100">
      {count} unread message{count > 1 ? 's' : ''}
    </span>
    <div className="flex-1 h-px bg-saffron-200" />
  </div>
)

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(function ChatMessages(
  {
    messages,
    typingMessage,
    userRole,
    selectedSession,
    onReplyToMessage,
    onOptionSelect,
    onRetryMessage,
    onOpenImage,
    onRequestActions,
    unreadCount,
    sessionStatus,
    onRate,
    onSendDakshina,
    onChatAgain,
  },
  ref
) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const handleOptionSelect = (optionId: string, messageId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [messageId]: optionId }))
    onOptionSelect?.(optionId, messageId)
  }

  const peerObj =
    userRole === 'friend'
      ? typeof selectedSession?.userId === 'object'
        ? selectedSession?.userId
        : null
      : typeof selectedSession?.providerId === 'object'
      ? selectedSession?.providerId
      : null
  const peerAvatar = (peerObj as { avatar?: string } | null | undefined)?.avatar
  const peerName = (peerObj as { name?: string } | null | undefined)?.name

  const processedMessages = useMemo(() => {
    const filtered = messages.filter(
      (m) => m && (userRole !== 'friend' || (!m.isAutomated && m.sender !== 'system'))
    )
    return [...filtered].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [messages, userRole])

  const firstUnreadIdRef = useRef<string | null>(null)
  const hasInitializedRef = useRef(false)
  useEffect(() => {
    if (hasInitializedRef.current) return
    if (!unreadCount || unreadCount <= 0) return
    if (processedMessages.length === 0) return
    const peerMsgs = processedMessages.filter(
      (m) => m.sender === 'astrologer' || m.sender === 'system'
    )
    const target = peerMsgs[Math.max(0, peerMsgs.length - unreadCount)]
    if (target) firstUnreadIdRef.current = target.id
    hasInitializedRef.current = true
  }, [processedMessages, unreadCount])

  useEffect(() => {
    if (processedMessages.length === 0) {
      hasInitializedRef.current = false
      firstUnreadIdRef.current = null
    }
  }, [processedMessages.length])

  const handleSwipeReply = useCallback(
    (m: Message) => {
      onReplyToMessage?.(m)
    },
    [onReplyToMessage]
  )

  return (
    <div
      ref={ref}
      className="h-full overflow-y-auto px-2 sm:px-6 py-3 relative scroll-smooth overscroll-contain"
      style={CHAT_BG_STYLE}
    >
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] z-0">
        <Image src="/sobhagya-logo.svg" alt="" width={400} height={400} className="w-64 h-64 sm:w-96 sm:h-96" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col">
        {processedMessages.length === 0 && !typingMessage && <EmptyConversation peerName={peerName} />}

        <AnimatePresence initial={false}>
          {processedMessages.map((msg, idx) => {
            const prev = idx > 0 ? processedMessages[idx - 1] : null
            const next = idx < processedMessages.length - 1 ? processedMessages[idx + 1] : null

            const dateLabel = formatDateLabel(msg.timestamp)
            const prevDateLabel = prev ? formatDateLabel(prev.timestamp) : null
            const showDate = dateLabel !== prevDateLabel

            const isFirstInGroup = !prev || prev.sender !== msg.sender || showDate
            const isLastInGroup =
              !next || next.sender !== msg.sender || formatDateLabel(next.timestamp) !== dateLabel

            const showUnread = firstUnreadIdRef.current && firstUnreadIdRef.current === msg.id
            const isMine = msg.sender === 'user'

            return (
              <React.Fragment key={msg.id || msg.clientMessageId || idx}>
                {showDate && <DateSeparator label={dateLabel} />}
                {showUnread && unreadCount && unreadCount > 0 && <UnreadDivider count={unreadCount} />}
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={isLastInGroup ? 'mb-2.5' : 'mb-0.5'}
                >
                  <MessageBubble
                    message={msg}
                    showAvatar={isLastInGroup}
                    showTail={isFirstInGroup}
                    showName={isFirstInGroup && !isMine}
                    peerAvatar={peerAvatar}
                    peerName={peerName}
                    isMine={isMine}
                    onOptionSelect={handleOptionSelect}
                    selectedOptionId={selectedOptions[msg.messageId || '']}
                    onRetryMessage={onRetryMessage}
                    onOpenImage={onOpenImage}
                    onRequestActions={onRequestActions}
                    onSwipeReply={handleSwipeReply}
                  />
                </motion.div>
              </React.Fragment>
            )
          })}

          {typingMessage && <TypingIndicator key="typing" avatar={peerAvatar} name={peerName} />}
        </AnimatePresence>

        {sessionStatus === 'ended' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 mb-10"
          >
            <SessionEndedCard
              astrologerName={peerName || 'Astrologer'}
              astrologerAvatar={peerAvatar}
              onRate={onRate || (() => {})}
              onSendDakshina={onSendDakshina || (() => {})}
              onChatAgain={onChatAgain || (() => {})}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
})

function EmptyConversation({ peerName }: { peerName?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-saffron-100 to-saffron-200 flex items-center justify-center shadow-inner">
          <span className="text-3xl">🕉️</span>
        </div>
        <h3 className="font-garamond text-xl font-semibold text-saffron-900 mb-1">
          {peerName ? `Greet ${peerName.split(' ')[0]}` : 'Begin a sacred conversation'}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Share your concerns or questions. Your guide is ready to listen.
        </p>
      </div>
    </div>
  )
}

ChatMessages.displayName = 'ChatMessages'
export default ChatMessages
