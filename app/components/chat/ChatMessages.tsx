'use client'

import React, { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Paperclip, Clock, Download } from 'lucide-react'

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
  isAutomated?: boolean
  messageId?: string
  options?: Array<{
    optionId: string
    optionText: string
    disabled?: boolean
  }>
}

interface ChatMessagesProps {
  messages: Message[]
  userId: string | null
  onReplyToMessage: (message: Message) => void
  onOptionSelect: (optionId: string, messageId: string) => void
  consultationFlowActive?: boolean
  waitingForAstrologer?: boolean
  remainingTime?: number
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(({
  messages,
  userId,
  onReplyToMessage,
  onOptionSelect,
  consultationFlowActive,
  waitingForAstrologer,
  remainingTime
}, ref) => {

  const renderMessageContent = (message: Message) => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="space-y-2">
            <img src={message.fileLink} alt="Shared" className="max-w-xs rounded-xl shadow" />
            {message.text && <p className="text-sm">{message.text}</p>}
          </div>
        )
      case 'voice':
        return (
          <div className="flex flex-col gap-1">
            <audio controls className="w-full rounded">
              <source src={message.fileLink} type="audio/mpeg" />
            </audio>
            {message.voiceMessageDuration && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} /> {Math.floor(message.voiceMessageDuration / 60)}:
                {(message.voiceMessageDuration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        )
      case 'file':
        return (
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <Paperclip size={16} />
            <a href={message.fileLink} download className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              <Download size={14} /> Download File
            </a>
          </div>
        )
      case 'options':
        console.log("Rendering option message:",message)
        return (
          <div className="flex flex-col gap-3">
            {message.text && <p className="text-sm font-medium">{message.text}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {message.options?.map(opt => (
                <button
                  key={opt.optionId}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!opt.disabled) onOptionSelect(opt.optionId, message.messageId || '')
                  }}
                  className={`px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={opt.disabled}
                >
                  {opt.optionText}
                </button>
              ))}
            </div>
          </div>
        )
      default:
        return <p className="text-sm">{message.text}</p>
    }
  }

  return (
    <div ref={ref} className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
      <AnimatePresence initial={false}>
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === 'user'
              ? 'justify-end'
              : msg.sender === 'astrologer'
                ? 'justify-start'
                : 'justify-center'}`}
          >
            {/* SYSTEM / AUTOMATED MESSAGE */}
            {msg.sender === 'system' ? (
              <div className={`px-6 py-3 rounded-2xl text-sm font-medium shadow-lg max-w-2xl mx-auto
                ${msg.isAutomated ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {msg.isAutomated && <span className="text-lg">🤖</span>}
                  <span className="font-semibold">{msg.isAutomated ? 'Automated Assistant' : 'System'}</span>
                </div>
                <p className="text-sm">{msg.text}</p>

                {/* Countdown for WAITING_FOR_ASTROLOGER */}
                {msg.messageId === 'WAITING_FOR_ASTROLOGER' && remainingTime !== undefined && (
                  <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-50 px-2 py-1 rounded-full inline-block">
                    ⏱️ ~{Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            ) : (
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md relative
                ${msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>

                {/* Reply Preview */}
                {msg.replyMessage && (
                  <div className="text-xs p-2 rounded bg-gray-200 mb-2">
                    <p className="font-semibold">Replying</p>
                    <p className="truncate">{msg.replyMessage.message}</p>
                  </div>
                )}

                {renderMessageContent(msg)}

                {/* Footer: Time + Reply button */}
                <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {/* Reply button for user messages if applicable */}
                  {!msg.isAutomated && msg.sender !== 'user' && (
                    <button onClick={() => onReplyToMessage(msg)} className="hover:underline">
                      Reply
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing indicator for automated flow */}
      {consultationFlowActive && waitingForAstrologer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-gray-500 text-sm animate-pulse"
        >
          🤖 Automated flow is typing...
        </motion.div>
      )}
    </div>
  )
})

ChatMessages.displayName = 'ChatMessages'
export default ChatMessages
