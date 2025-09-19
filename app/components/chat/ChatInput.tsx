'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isDisabled?: boolean
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  isDisabled = false
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [newMessage])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (newMessage.trim() && !isDisabled) {
        onSendMessage()
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    setIsTyping(true)
    // Clear typing indicator after 1 second of no typing
    if ((handleInputChange as any).typingTimeout) {
      clearTimeout((handleInputChange as any).typingTimeout)
    }
    (handleInputChange as any).typingTimeout = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="p-3 bg-white border-t border-orange-200 flex-shrink-0">
      <div className="flex items-center gap-2">
        {/* Additional Actions */}
        <div className="flex items-center gap-1">
          {/* File upload button */}
          <button
            disabled={isDisabled}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
            }`}
            title="Attach file"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isDisabled ? "Session ended or insufficient balance" : "Type a message"}
              disabled={isDisabled}
                className={`w-full px-4 py-2 pr-10 bg-orange-50 border border-orange-200 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm ${
                  isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-900'
                }`}
              rows={1}
              maxLength={1000}
            />
            
            {/* Send button */}
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isDisabled}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
                !newMessage.trim() || isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Typing indicator */}
          {isTyping && !isDisabled && (
            <div className="absolute -top-6 left-0 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="ml-1">typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Voice message button */}
        <button
          disabled={isDisabled}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isDisabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
          }`}
          title="Voice message"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {/* Status message */}
      {isDisabled && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            {newMessage.includes('insufficient') ? 'Insufficient balance' : 'Session has ended'}
          </p>
        </div>
      )}
    </div>
  )
}
