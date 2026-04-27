'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isDisabled?: boolean
  onTyping?: () => void
  onStopTyping?: () => void
  onFileUpload?: (file: File) => void | Promise<void>
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  isDisabled = false,
  onTyping,
  onStopTyping,
  onFileUpload,
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onFileUpload) return
    try {
      setUploading(true)
      await onFileUpload(file)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
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

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      onTyping?.()
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onStopTyping?.()
    }, 1500)
  }

  return (
    <footer className="p-3 md:p-4 bg-[#FDF8F0]/80 backdrop-blur-md border-t border-orange-100/50 safe-area-pb">
      <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
        
        {/* Attachment Button */}
        <div className="flex-shrink-0 mb-0.5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            disabled={isDisabled || uploading || !onFileUpload}
          />
          <button
            type="button"
            disabled={isDisabled || uploading || !onFileUpload}
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-orange-600 hover:bg-orange-100/50 transition-all duration-200 active:scale-90 disabled:opacity-30"
            title="Attach file"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Input Box */}
        <div className="flex-1 relative bg-white rounded-[24px] shadow-sm border border-orange-100/50 group focus-within:border-orange-300 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isDisabled ? "Chat session ended" : "Type your message..."}
            disabled={isDisabled}
            className="w-full pl-5 pr-12 py-3 bg-transparent resize-none focus:outline-none text-[15px] md:text-base text-gray-800 placeholder:text-gray-400 leading-normal scrollbar-hide"
            rows={1}
            maxLength={2000}
            style={{ minHeight: '46px', maxHeight: '120px' }}
          />
          
          {/* Emoji / Secondary Action placeholder */}
          <div className="absolute right-3 bottom-2.5">
             <button className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </button>
          </div>
        </div>

        {/* Send / Voice Button */}
        <div className="flex-shrink-0 mb-0.5">
          {newMessage.trim() ? (
            <button
              onClick={onSendMessage}
              disabled={isDisabled}
              className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-200 transition-all duration-200 active:scale-90 flex items-center justify-center"
            >
              <svg className="w-6 h-6 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          ) : (
            <button
              disabled={isDisabled}
              className="p-3 bg-white text-orange-600 border border-orange-100 rounded-full shadow-sm hover:bg-orange-50 transition-all duration-200 active:scale-90 flex items-center justify-center disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {isDisabled && (
        <p className="text-center text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
          This session is closed
        </p>
      )}
    </footer>
  )
}
