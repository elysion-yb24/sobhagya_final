'use client'

import React, { forwardRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  text: string
  sender: 'user' | 'astrologer' | 'system'
  timestamp: string
  messageType?: 'text' | 'voice' | 'image' | 'video' | 'file' | 'options' | 'informative' | 'call'
  fileLink?: string
  replyMessage?: {
    id: string
    message: string
    replyTo: string
    replyBy: string
    messageType: string
    voiceMessageDuration?: number
  }
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
  internalIndex?: number
}

interface ChatMessagesProps {
  messages: Message[]
  typingMessage?: Message | null
  userId: string | null
  userRole?: string | null
  selectedSession?: {
    userId?: { _id: string; name?: string; avatar?: string } | string
    providerId: { _id: string; name?: string; avatar?: string } | string
  } | null
  onReplyToMessage: (message: Message) => void
  onOptionSelect?: (optionId: string, messageId: string) => void
  onRetryMessage?: (clientMessageId: string) => void
  remainingTime?: number
  sessionStatus?: 'active' | 'ended' | 'pending'
  automatedFlowCompleted?: boolean
}

/* ----------------------------------------------------------------------- */
/*                          Devotional chat wallpaper                       */
/* ----------------------------------------------------------------------- */

const CHAT_BG_PATTERN =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23F7941D' stroke-opacity='0.04'%3E%3Cpath d='M60 10 L65 55 L110 60 L65 65 L60 110 L55 65 L10 60 L55 55 Z'/%3E%3Ccircle cx='60' cy='60' r='15'/%3E%3C/g%3E%3C/svg%3E\")"

const CHAT_BG_STYLE: React.CSSProperties = {
  backgroundColor: '#FDF8F0',
  backgroundImage: `${CHAT_BG_PATTERN}, linear-gradient(180deg, rgba(253, 248, 240, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)`,
  backgroundRepeat: 'repeat',
  backgroundSize: '120px 120px',
  backgroundAttachment: 'fixed'
}

/* ----------------------------------------------------------------------- */
/*                              Sub components                              */
/* ----------------------------------------------------------------------- */

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-end gap-2 mb-4 justify-start ml-2"
    >
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-orange-50 shadow-sm">
        <Image src="/sobhagya-logo.svg" alt="Sobhagya" width={20} height={20} className="w-5 h-5 object-contain" />
      </div>
      <div className="bg-white text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm border border-orange-50">
        <div className="flex items-center gap-1.5 h-4">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-orange-300 rounded-full"
              animate={{ 
                y: [0, -4, 0],
                backgroundColor: ['#FDBA74', '#F97316', '#FDBA74']
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const MessageTicks = ({ status }: { status?: 'sent' | 'delivered' | 'read' | 'failed' }) => {
  if (!status) return null
  if (status === 'failed') {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" className="text-red-500 fill-red-50" />
        <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" className="text-red-500" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" className="text-red-500" />
      </svg>
    )
  }
  
  const isRead = status === 'read'
  const color = isRead ? '#4FC3F7' : 'currentColor'
  
  return (
    <div className={`flex items-center ${isRead ? 'text-[#4FC3F7]' : 'text-gray-400'}`}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
        {status !== 'sent' && (
          <polyline points="20 6 9 17 4 12" className="translate-x-1" />
        )}
      </svg>
    </div>
  )
}

const formatBubbleTime = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

/* ----------------------------------------------------------------------- */
/*                              MessageBubble                               */
/* ----------------------------------------------------------------------- */

const MessageBubble = ({
  message,
  showAvatar,
  showTail,
  onOptionSelect,
  selectedOptionId,
  onRetryMessage,
}: {
  message: Message
  showAvatar: boolean
  showTail: boolean
  onOptionSelect?: (optionId: string, messageId: string) => void
  selectedOptionId?: string
  onRetryMessage?: (clientMessageId: string) => void
}) => {
  const isUser = message.sender === 'user'
  
  // System / Info messages
  if (message.sender === 'system' || message.messageType === 'informative') {
    return (
      <div className="flex justify-center my-4 px-4">
        <div className="bg-orange-50/80 backdrop-blur-sm text-orange-800 text-[11px] sm:text-xs font-medium px-4 py-1.5 rounded-full border border-orange-100 shadow-sm text-center max-w-[85%] leading-relaxed">
          {message.text}
        </div>
      </div>
    )
  }

  const bubbleRadius = isUser 
    ? `rounded-2xl ${showTail ? 'rounded-tr-none' : ''}`
    : `rounded-2xl ${showTail ? 'rounded-tl-none' : ''}`

  return (
    <div className={`flex w-full mb-1 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Container */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 self-end mb-1">
            {showAvatar ? (
              message.isAutomated ? (
                <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center ring-2 ring-white shadow-sm overflow-hidden">
                  <Image src="/sobhagya-logo.svg" alt="S" width={20} height={20} />
                </div>
              ) : message.sentByProfileImage ? (
                <img src={message.sentByProfileImage} alt="" className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                  {(message.sentByName || 'A').charAt(0)}
                </div>
              )
            ) : null}
          </div>
        )}

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="relative group">
            {/* Message Tail SVG */}
            {showTail && (
              <div className={`absolute top-0 w-3 h-4 ${isUser ? '-right-2' : '-left-2'}`}>
                <svg viewBox="0 0 12 16" className={`w-full h-full ${isUser ? 'text-[#FEF3C7]' : 'text-white'}`} fill="currentColor">
                  {isUser ? (
                    <path d="M0 0 C0 0, 12 0, 12 0 C12 0, 12 16, 12 16 C12 16, 0 8, 0 0" />
                  ) : (
                    <path d="M12 0 C12 0, 0 0, 0 0 C0 0, 0 16, 0 16 C0 16, 12 8, 12 0" />
                  )
                  }
                </svg>
              </div>
            )}

            {/* Bubble Content */}
            <div className={`px-3 py-2 shadow-sm ${bubbleRadius} ${
              isUser 
                ? 'bg-[#FEF3C7] text-orange-950 border border-orange-100/50' 
                : 'bg-white text-gray-800 border border-orange-50'
            }`}>
              {/* Sender Name for non-user group messages */}
              {!isUser && showAvatar && message.sentByName && !message.isAutomated && (
                <div className="text-[11px] font-bold text-orange-600 mb-0.5 px-0.5">
                  {message.sentByName}
                </div>
              )}

              <div className="text-[14px] sm:text-[15px] leading-normal break-words whitespace-pre-wrap min-w-[50px]">
                {message.text}
                {/* Float time/ticks to bottom right */}
                <div className="h-4 float-right w-16 md:w-20"></div>
              </div>

              {/* Absolute positioned time and status */}
              <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 leading-none select-none ${isUser ? 'text-orange-700/60' : 'text-gray-400'}`}>
                <span className="text-[10px] sm:text-[11px] font-medium uppercase">
                  {formatBubbleTime(message.timestamp)}
                </span>
                {isUser && <MessageTicks status={message.deliveryStatus || 'sent'} />}
              </div>
            </div>
          </div>

          {/* Options for automated flows */}
          {message.options && message.options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.options.map((opt) => (
                <button
                  key={opt.optionId}
                  disabled={opt.disabled || !!selectedOptionId}
                  onClick={() => onOptionSelect?.(opt.optionId, message.messageId!)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border shadow-sm active:scale-95 ${
                    selectedOptionId === opt.optionId
                      ? 'bg-orange-500 text-white border-orange-600 shadow-orange-100'
                      : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {opt.optionText}
                </button>
              ))}
            </div>
          )}

          {/* Retry Button */}
          {isUser && message.deliveryStatus === 'failed' && (
            <button 
              onClick={() => onRetryMessage?.(message.clientMessageId!)}
              className="mt-1 text-red-500 text-[11px] font-bold hover:underline px-2"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/*                            Date separator                                */
/* ----------------------------------------------------------------------- */

const DateSeparator = ({ label }: { label: string }) => (
  <div className="flex justify-center my-6 sticky top-2 z-20">
    <div className="bg-[#E1F3FB] text-[#54656F] text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider border border-white/50">
      {label}
    </div>
  </div>
)

const formatDateLabel = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - msgDate.getTime()) / (24 * 60 * 60 * 1000))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: now.getFullYear() === d.getFullYear() ? undefined : 'numeric' })
}

/* ----------------------------------------------------------------------- */
/*                                  Main                                   */
/* ----------------------------------------------------------------------- */

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, typingMessage, userRole, onOptionSelect, onRetryMessage }, ref) => {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    const handleOptionSelect = (optionId: string, messageId: string) => {
      setSelectedOptions(prev => ({ ...prev, [messageId]: optionId }))
      onOptionSelect?.(optionId, messageId)
    }

    const processedMessages = useMemo(() => {
      const filtered = messages.filter(m => m && (userRole !== 'friend' || (!m.isAutomated && m.sender !== 'system')))
      return [...filtered].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }, [messages, userRole])

    return (
      <div 
        ref={ref}
        className="h-full overflow-y-auto px-3 sm:px-6 py-4 relative scroll-smooth overscroll-contain"
        style={CHAT_BG_STYLE}
      >
        {/* Sacred Watermark */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
          <Image src="/sobhagya-logo.svg" alt="" width={400} height={400} className="w-64 h-64 sm:w-96 sm:h-96" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col">
          <AnimatePresence initial={false}>
            {processedMessages.map((msg, idx) => {
              const prev = idx > 0 ? processedMessages[idx - 1] : null
              const next = idx < processedMessages.length - 1 ? processedMessages[idx + 1] : null
              
              const dateLabel = formatDateLabel(msg.timestamp)
              const prevDateLabel = prev ? formatDateLabel(prev.timestamp) : null
              const showDate = dateLabel !== prevDateLabel

              // Grouping logic for WhatsApp style
              const isFirstInGroup = !prev || prev.sender !== msg.sender || showDate
              const isLastInGroup = !next || next.sender !== msg.sender || formatDateLabel(next.timestamp) !== dateLabel
              
              return (
                <React.Fragment key={msg.id || msg.clientMessageId || idx}>
                  {showDate && <DateSeparator label={dateLabel} />}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={isLastInGroup ? 'mb-3' : 'mb-0.5'}
                  >
                    <MessageBubble
                      message={msg}
                      showAvatar={isLastInGroup}
                      showTail={isFirstInGroup}
                      onOptionSelect={handleOptionSelect}
                      selectedOptionId={selectedOptions[msg.messageId || '']}
                      onRetryMessage={onRetryMessage}
                    />
                  </motion.div>
                </React.Fragment>
              )
            })}

            {typingMessage && <TypingIndicator key="typing" />}
          </AnimatePresence>
        </div>
      </div>
    )
  }
)

ChatMessages.displayName = 'ChatMessages'
export default ChatMessages
