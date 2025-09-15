'use client'

import React from 'react'

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
  isAutomated?: boolean
  messageId?: string
  options?: Array<{ optionId: string; optionText: string }>
}

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  replyToMessage: Message | null
  setReplyToMessage: (message: Message | null) => void
  showFileUpload: boolean
  setShowFileUpload: (show: boolean) => void
  selectedSessionStatus: 'active' | 'ended' | 'pending'
  insufficientBalance: boolean
  onSendMessage: () => void
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  automatedFlowActive?: boolean
  waitingForAstrologer?: boolean
  lastMessageWithOptions?: Message | null
  onOptionSelect?: (optionId: string, messageId: string) => void
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  replyToMessage,
  setReplyToMessage,
  showFileUpload,
  setShowFileUpload,
  selectedSessionStatus,
  insufficientBalance,
  onSendMessage,
  onFileSelect,
  automatedFlowActive,
  waitingForAstrologer,
  lastMessageWithOptions,
  onOptionSelect
}: ChatInputProps) {

  const isInputDisabled = selectedSessionStatus !== 'active' || insufficientBalance || automatedFlowActive || waitingForAstrologer

  const placeholderText = insufficientBalance
    ? "Insufficient balance - cannot send messages"
    : automatedFlowActive
      ? "Automated flow in progress..."
      : waitingForAstrologer
        ? "Waiting for astrologer..."
        : "Type your message..."

  // Show only options when automated flow is active and there are options available
  if (automatedFlowActive && lastMessageWithOptions?.options && lastMessageWithOptions.options.length > 0) {
    return (
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">Please select an option to continue:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {lastMessageWithOptions.options.map(opt => (
              <button
                key={opt.optionId}
                onClick={(e) => {
                  e.preventDefault()
                  onOptionSelect?.(opt.optionId, lastMessageWithOptions.messageId || '')
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors shadow-md hover:shadow-lg"
              >
                {opt.optionText}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Replying to:</p>
            <p className="text-sm truncate">{replyToMessage.text}</p>
          </div>
          <button
            onClick={() => setReplyToMessage(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="mb-2 p-2 bg-blue-100 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-xs text-blue-600">Selected file:</p>
            <p className="text-sm">{selectedFile.name}</p>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-blue-500 hover:text-blue-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center space-x-2">
        {/* File Upload */}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={onFileSelect}
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
          disabled={isInputDisabled}
        />
        <label
          htmlFor="file-upload"
          className={`px-3 py-2 rounded-full cursor-pointer transition-colors ${
            isInputDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📎
        </label>

        {/* Text Input */}
        <input
          type="text"
          placeholder={placeholderText}
          className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isInputDisabled
              ? 'border-red-300 bg-red-50 text-red-500 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-900'
          }`}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !isInputDisabled) {
              e.preventDefault()
              onSendMessage()
            }
          }}
          disabled={isInputDisabled}
        />

        {/* Send Button */}
        <button
          type="button"
          className={`px-4 py-2 rounded-full transition-colors ${
            isInputDisabled || (!newMessage.trim() && !selectedFile)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          onClick={(e) => {
            e.preventDefault()
            onSendMessage()
          }}
          disabled={isInputDisabled || (!newMessage.trim() && !selectedFile)}
        >
          Send
        </button>
      </div>
    </div>
  )
}
