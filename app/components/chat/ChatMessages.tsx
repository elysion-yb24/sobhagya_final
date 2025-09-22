'use client'

import React, { forwardRef } from 'react'
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
  deliveryStatus?: 'sent' | 'delivered' | 'read'
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
  remainingTime?: number
  sessionStatus?: 'active' | 'ended' | 'pending'
  automatedFlowCompleted?: boolean
}

const TypingIndicator = ({ selectedSession }: { selectedSession?: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-1 md:gap-2 mb-2 justify-start"
      style={{ height: '40px' }} // Fixed height to prevent shifting
    >
      {/* Always show Sobhagya logo for bot typing */}
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
        <img src="/sobhagya-logo.svg" alt="Sobhagya" className="w-4 h-4 md:w-6 md:h-6 object-contain" />
      </div>
      
      <div className="bg-white text-gray-800 px-3 md:px-4 py-2 md:py-3 rounded-2xl rounded-bl-sm shadow-lg relative max-w-xs min-h-[36px] md:min-h-[40px] flex items-center">
        <div className="flex items-center justify-center">
          <div className="flex space-x-1">
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.4
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="relative">
      <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  </div>
)

const WaitingForAstrologer = ({ astrologerName }: { astrologerName?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex justify-center my-3 sm:my-4 px-2"
  >
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 text-orange-700 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm shadow-sm max-w-xs sm:max-w-none">
      <div className="flex items-center gap-2 sm:gap-3">
        <LoadingSpinner />
        <span className="text-center">Waiting for {astrologerName || 'astrologer'} to join...</span>
      </div>
    </div>
  </motion.div>
)

const OptionButton = ({ option, messageId, onOptionSelect }: {
  option: { optionId: string; optionText: string; disabled?: boolean }
  messageId: string
  onOptionSelect: (optionId: string, messageId: string) => void
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => !option.disabled && onOptionSelect(option.optionId, messageId)}
    disabled={option.disabled}
    className={`px-3 md:px-4 py-2 md:py-2.5 m-1 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 border-2 min-h-[44px] flex items-center justify-center ${
      option.disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg border-orange-500 hover:border-orange-600 active:scale-95'
    }`}
  >
    {option.optionText}
  </motion.button>
)

const OptionsContainer = ({ options, messageId, onOptionSelect }: {
  options: Array<{ optionId: string; optionText: string; disabled?: boolean }>
  messageId: string
  onOptionSelect: (optionId: string, messageId: string) => void
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-wrap gap-2">
    {options.map((option, index) => (
      <OptionButton 
        key={`${messageId}-opt-${option.optionId}-${index}`} 
        option={option} 
        messageId={messageId} 
        onOptionSelect={onOptionSelect} 
      />
    ))}
  </motion.div>
)

const MessageTicks = ({ status }: { status?: 'sent' | 'delivered' | 'read' }) => {
  if (!status) return null
  
  return (
    <span className="inline-flex ml-1">
      {status === 'sent' && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {status === 'delivered' && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M2 8L4 10L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8L10 10L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {status === 'read' && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M2 8L4 10L8 6" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8L10 10L14 6" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  )
}

const MessageBubble = ({ message, userId, userRole, selectedSession, onOptionSelect }: {
  message: Message
  userId: string | null
  userRole?: string | null
  selectedSession?: {
    userId?: { _id: string; name?: string; avatar?: string } | string
    providerId: { _id: string; name?: string; avatar?: string } | string
  } | null
  onOptionSelect?: (optionId: string, messageId: string) => void
}) => {
  if (message.sender === 'system' && !message.isAutomated) {
    return (
      <div className="flex justify-center my-2 px-2">
        <div className="bg-gray-200 text-gray-700 text-xs sm:text-sm px-3 py-2 rounded-lg border border-gray-300 italic text-center max-w-xs sm:max-w-sm">
          {message.text || 'No message content'}
        </div>
      </div>
    )
  }

  if (message.text && (message.text.includes('Estimated Time') || message.text.includes('Our team is working'))) {
    return (
      <div className="flex justify-center my-2 px-2">
        <div className="bg-orange-50 text-orange-700 text-xs sm:text-sm px-3 py-2 rounded-lg border border-orange-200 italic text-center max-w-xs sm:max-w-sm">
          {message.text || 'No message content'}
        </div>
      </div>
    )
  }

  // Special styling for astrologer join messages
  if (message.text && message.text.includes('has joined the session')) {
    return (
      <div className="flex justify-center my-3 px-2">
        <div className="bg-green-50 text-green-700 text-sm sm:text-base px-4 py-3 rounded-lg border border-green-200 font-medium text-center shadow-sm max-w-xs sm:max-w-sm">
          {message.text || 'No message content'}
        </div>
      </div>
    )
  }

  if (message.isAutomated) {
    const hasOptions = message.options && message.options.length > 0 && message.messageId;
    
    return (
      <div className="flex items-end gap-1 sm:gap-2 mb-2 justify-start">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <img src="/sobhagya-logo.svg" alt="Sobhagya" className="w-4 h-4 sm:w-6 sm:h-6 object-contain" />
        </div>
        <div className="relative max-w-[85%] sm:max-w-xs md:max-w-md">
          {/* Message bubble - only show if there's text content */}
          {message.text && message.text !== 'No message content' && (
            <div className="bg-white text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-sm shadow-sm mb-2">
              <div className="break-words text-sm sm:text-base leading-relaxed">{message.text}</div>
              <div className="text-xs mt-1 flex justify-end items-center text-gray-500">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
          )}
          
          {/* Options container - separate from message bubble */}
          {hasOptions && message.options && message.messageId && (
            <OptionsContainer options={message.options} messageId={message.messageId} onOptionSelect={onOptionSelect || (() => {})} />
          )}
        </div>
      </div>
    )
  }

  const getBubbleClasses = (msg: Message) =>
    msg.sender === 'user'
      ? 'bg-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-br-sm shadow-sm'
      : 'bg-white text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-sm shadow-sm'

  const getAvatar = () => {
    if (message.sender === 'user') {
      return message.sentByProfileImage ||
        (typeof selectedSession?.userId !== 'string' ? selectedSession?.userId?.avatar : null)
    }
    if (message.sender === 'astrologer') {
      return message.sentByProfileImage ||
        (typeof selectedSession?.providerId !== 'string' ? selectedSession?.providerId?.avatar : null)
    }
    return null
  }

  const avatar = getAvatar()

  return (
    <div className={`flex items-end gap-1 sm:gap-2 mb-2 ${message.sender === 'user' ? 'justify-end flex-row' : 'justify-start flex-row-reverse'}`}>
      {avatar ? (
        <img src={avatar} alt="avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs sm:text-sm font-bold flex-shrink-0">
          {message.sender === 'user' ? 'U' : 'A'}
        </div>
      )}
      <div className={`${getBubbleClasses(message)} relative max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg`}>
        <div className="break-words text-sm sm:text-base leading-relaxed">{message.text || 'No message content'}</div>
        {message.options && message.options.length > 0 && message.messageId && (
          <OptionsContainer options={message.options} messageId={message.messageId} onOptionSelect={onOptionSelect || (() => {})} />
        )}
        <div className={`text-xs mt-1 flex justify-end items-center ${message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          {message.sender === 'user' && <MessageTicks status={message.deliveryStatus || 'sent'} />}
        </div>
      </div>
    </div>
  )
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, typingMessage, userId, userRole, selectedSession, onReplyToMessage, onOptionSelect, sessionStatus, automatedFlowCompleted }, ref) => {
    const filteredMessages = userRole === 'friend'
      ? messages.filter(msg => msg && !msg.isAutomated && msg.sender !== 'system')
      : messages.filter(msg => msg && msg.id) // Ensure messages have valid IDs

    const sortedMessages = [...filteredMessages].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeA - timeB
    })

    // ✅ Simple deduplication without complex key generation
    const seenIds = new Set();
    const uniqueMessages = sortedMessages.filter((message, index) => {
      // Use multiple identifiers to avoid duplicates
      const identifier = message.id || message.clientMessageId || message.messageId || `${message.timestamp}-${message.text}-${index}`;
      
      if (seenIds.has(identifier)) {
        return false;
      }
      seenIds.add(identifier);
      return true;
    }).map((msg, index) => ({
      ...msg,
      internalIndex: index // Add guaranteed unique index
    }));

    return (
      <div
        ref={ref}
        className="h-full overflow-y-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 relative"
        style={{
          height: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f0f2f5'
        }}
      >
        {/* Background logo - responsive positioning */}
        <div className="fixed flex items-center justify-center pointer-events-none z-0"
          style={{ 
            top: '50%', 
            left: typeof window !== 'undefined' && window.innerWidth < 768 ? '50%' : 'calc(50% + 160px)', 
            transform: 'translate(-50%, -50%)', 
            width: '100vw', 
            height: '100vh' 
          }}>
          <div className="opacity-5 md:opacity-10 blur-sm transform scale-75 sm:scale-100 md:scale-150">
            <img src="/sobhagya-logo.svg" alt="Sobhagya Logo" className="w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 object-contain" />
          </div>
        </div>

        <div className="relative z-10">
          <AnimatePresence initial={false}>
            {uniqueMessages.map((msg, index) => (
              <motion.div
                key={`message-${msg.internalIndex}-${msg.id || msg.clientMessageId || msg.messageId || index}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.15, delay: index * 0.02 }}
              >
                <MessageBubble message={msg} userId={userId} userRole={userRole} selectedSession={selectedSession} onOptionSelect={onOptionSelect} />
              </motion.div>
            ))}


            {typingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="z-20"
                style={{ minHeight: '44px' }} // Reserve space to prevent jumping
              >
                <TypingIndicator selectedSession={selectedSession} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }
)

ChatMessages.displayName = 'ChatMessages'
export default ChatMessages
