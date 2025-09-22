'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isDisabled?: boolean
  onTyping?: () => void
  onStopTyping?: () => void
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  isDisabled = false,
  onTyping,
  onStopTyping
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
    
    // Trigger typing event if not already typing
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      onTyping?.()
    }
    
    // Clear typing indicator after 1 second of no typing
    if ((handleInputChange as any).typingTimeout) {
      clearTimeout((handleInputChange as any).typingTimeout)
    }
    (handleInputChange as any).typingTimeout = setTimeout(() => {
      setIsTyping(false)
      onStopTyping?.()
    }, 1000)
  }

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-orange-200 flex-shrink-0 safe-area-pb" 
         style={{ 
           paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
           minHeight: '70px'
         }}>
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Additional Actions - Hide on mobile */}
        <div className="hidden sm:flex items-center gap-1">
          {/* File upload button */}
          <button
            disabled={isDisabled}
            className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 active:scale-95 ${
              isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
            }`}
            title="Attach file"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              placeholder={isDisabled ? "Session ended" : "Type a message..."}
              disabled={isDisabled}
              className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-12 sm:pr-14 bg-white border-2 border-orange-200 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-base leading-relaxed placeholder:text-gray-400 shadow-sm ${
                isDisabled
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50 border-gray-200'
                  : 'text-gray-900 hover:border-orange-300'
              }`}
              rows={1}
              maxLength={1000}
              style={{ 
                minHeight: '48px',  // Better touch target
                maxHeight: '120px',
                fontSize: '16px' // Prevent zoom on iOS
              }}
            />
            
            {/* Send button */}
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isDisabled}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 rounded-full transition-all duration-200 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                !newMessage.trim() || isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : newMessage.trim()
                  ? 'text-white bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl'
                  : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Voice message button - Show when no text */}
        {!newMessage.trim() && (
          <button
            disabled={isDisabled}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center border-2 border-orange-200 bg-white hover:bg-orange-50 shadow-sm ${
              isDisabled
                ? 'text-gray-300 cursor-not-allowed border-gray-200'
                : 'text-orange-600 hover:text-orange-700 hover:border-orange-300'
            }`}
            title="Voice message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>

      {/* Status message */}
      {isDisabled && (
        <div className="mt-2 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Session has ended
          </p>
        </div>
      )}
    </div>
  )
}
