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
}

const TypingIndicator = () => (
  <div className="flex space-x-1 items-center bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl w-fit shadow-sm">
    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    <span className="ml-2 text-xs">typing...</span>
  </div>
)

// ✅ Option Button
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
    className={`px-4 py-2.5 m-1 rounded-xl text-sm font-medium transition-all duration-200 ${option.disabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
      }`}
  >
    {option.optionText}
  </motion.button>
)

// ✅ Options Container
const OptionsContainer = ({ options, messageId, onOptionSelect }: {
  options: Array<{ optionId: string; optionText: string; disabled?: boolean }>
  messageId: string
  onOptionSelect: (optionId: string, messageId: string) => void
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-wrap gap-2">
    {options.map((option, index) => (
      <OptionButton key={index} option={option} messageId={messageId} onOptionSelect={onOptionSelect} />
    ))}
  </motion.div>
)


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
  const getBubbleClasses = (msg: Message) => {
    if (msg.sender === 'system' || msg.isAutomated) {
      return 'bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg max-w-sm border border-gray-300 italic'
    }
    if (msg.sender === 'user') {
      return 'bg-orange-500 text-white px-3 py-2 rounded-2xl rounded-br-sm shadow-sm'
    }
    return 'bg-white text-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm'
  }


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
    <div
      className={`flex items-end gap-2 mb-2 ${message.sender === 'user' ? 'justify-end flex-row-reverse' : 'justify-start flex-row'
        }`}
    >
      {/* Avatar */}
      {message.sender === 'system' || message.isAutomated ? (
        <img
          src="/sobhagya-logo.svg"
          alt="Sobhagya Logo"
          className="w-8 h-8 rounded-full object-contain bg-white p-1 border border-gray-200 shadow-sm"
        />
      ) : (
        avatar ? (
          <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold">
            {message.sender === 'user' ? 'U' : 'A'}
          </div>
        )
      )}


      {/* Bubble */}
      <div className={`${getBubbleClasses(message)} relative max-w-xs`}>
        <div className="break-words text-sm">{message.text}</div>

        {message.options && message.options.length > 0 && message.messageId && (
          <OptionsContainer
            options={message.options}
            messageId={message.messageId}
            onOptionSelect={onOptionSelect || (() => { })}
          />
        )}

        <div
          className={`text-xs mt-1 flex justify-end ${message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
            }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.sender === 'user' && <span className="ml-1">✓✓</span>}
        </div>
      </div>
    </div>
  )
}



const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, typingMessage, userId, userRole, selectedSession, onReplyToMessage, onOptionSelect, sessionStatus }, ref) => {
    const filteredMessages =
      userRole === 'friend' ? messages.filter(msg => !msg.isAutomated && msg.sender !== 'system') : messages

    const sortedMessages = [...filteredMessages].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeA - timeB
    })

    return (
      <div
        ref={ref}
        className="h-full overflow-y-auto px-4 py-4 relative"
        style={{
          height: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f0f2f5'
        }}
      >
        {/* Blurred Sobhagya Logo Background - Perfectly Centered */}
        <div className="fixed flex items-center justify-center pointer-events-none z-0"
          style={{
            top: '50%',
            left: 'calc(50% + 160px)',
            transform: 'translate(-50%, -50%)',
            width: '100vw',
            height: '100vh'
          }}>
          <div className="opacity-5 blur-sm transform scale-150">
            <img
              src="/sobhagya-logo.svg"
              alt="Sobhagya Logo"
              className="w-96 h-96 object-contain"
            />
          </div>
        </div>
        <div className="relative z-10">
          <AnimatePresence initial={false}>
            {sortedMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex mb-2 ${msg.sender === 'user'
                  ? 'justify-end'
                  : 'justify-start'
                  }`}
              >
                <MessageBubble
                  message={msg}
                  userId={userId}
                  userRole={userRole}
                  selectedSession={selectedSession}
                  onOptionSelect={onOptionSelect}
                />
              </motion.div>
            ))}

            {/* ✅ Typing Indicator Overlay */}
            {typingMessage && (
              <div className="absolute bottom-3 left-4 z-20">
                <TypingIndicator />
              </div>
            )}

          </AnimatePresence>

        </div>
      </div>
    )
  }
)

ChatMessages.displayName = 'ChatMessages'
export default ChatMessages
