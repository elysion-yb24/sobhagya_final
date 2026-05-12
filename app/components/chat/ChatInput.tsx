'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Image as ImageIcon, Send, X, Wallet } from 'lucide-react'
import ReplyPreview from './ReplyPreview'

export interface PendingImage {
  id: string
  previewUrl: string
  file: File
}

export interface ReplyTarget {
  id: string
  authorLabel: string
  text: string
  imageUrl?: string
}

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isDisabled?: boolean
  onTyping?: () => void
  onStopTyping?: () => void

  replyTarget?: ReplyTarget | null
  onClearReply?: () => void

  pendingImages?: PendingImage[]
  onSelectImages?: (files: File[]) => void
  onRemovePending?: (id: string) => void
  maxAttachments?: number
  /** Per-file size limit in bytes. Files above the limit are rejected with
   *  an inline warning rather than being uploaded and silently failing on
   *  the server. */
  maxFileSizeBytes?: number

  isInsufficient?: boolean
  onRecharge?: () => void
  isSending?: boolean
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  isDisabled = false,
  onTyping,
  onStopTyping,
  replyTarget,
  onClearReply,
  pendingImages = [],
  onSelectImages,
  onRemovePending,
  maxAttachments = 4,
  maxFileSizeBytes = 10 * 1024 * 1024,
  isInsufficient = false,
  onRecharge,
  isSending = false,
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [])

  const flashError = (message: string) => {
    setAttachmentError(message)
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    errorTimeoutRef.current = setTimeout(() => setAttachmentError(null), 4000)
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const t = textareaRef.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${Math.min(t.scrollHeight, 140)}px`
  }, [newMessage])

  useEffect(() => {
    if (replyTarget) textareaRef.current?.focus()
  }, [replyTarget])

  const canSend =
    !isDisabled && !isSending && (newMessage.trim().length > 0 || pendingImages.length > 0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSendMessage()
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const all = Array.from(e.target.files || [])
    const images = all.filter((f) => f.type.startsWith('image/'))
    const skippedNonImage = all.length - images.length

    const tooLarge: File[] = []
    const accepted: File[] = []
    for (const f of images) {
      if (f.size > maxFileSizeBytes) tooLarge.push(f)
      else accepted.push(f)
    }

    const remaining = Math.max(0, maxAttachments - pendingImages.length)
    const toAdd = accepted.slice(0, remaining)
    const skippedOverLimit = accepted.length - toAdd.length

    if (toAdd.length > 0) onSelectImages?.(toAdd)

    const limitMb = Math.round(maxFileSizeBytes / (1024 * 1024))
    if (tooLarge.length > 0) {
      flashError(
        tooLarge.length === 1
          ? `That photo is over ${limitMb}MB — please pick a smaller one.`
          : `${tooLarge.length} photos were over ${limitMb}MB and skipped.`
      )
    } else if (skippedNonImage > 0) {
      flashError('Only image files can be attached.')
    } else if (skippedOverLimit > 0) {
      flashError(`You can attach up to ${maxAttachments} photos at a time.`)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Disabled-because-session-ended (different visual from disabled-due-to-balance)
  if (isDisabled && !isInsufficient) {
    return (
      <footer className="p-3 sm:p-4 bg-saffron-50/70 backdrop-blur border-t border-saffron-100 safe-area-pb">
        <p className="text-center text-[12px] text-gray-500">
          🪔 This session has ended. Start a new one from the chat list.
        </p>
      </footer>
    )
  }

  return (
    <footer className="bg-[#FDF8F0]/90 backdrop-blur-md border-t border-saffron-100/70 safe-area-pb">
      {/* Insufficient balance strip */}
      {isInsufficient && onRecharge && (
        <button
          onClick={onRecharge}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border-b border-amber-100 transition"
        >
          <Wallet className="w-3.5 h-3.5" />
          Low balance — tap to recharge and keep chatting
        </button>
      )}

      {/* Attachment error (size / type / count) */}
      {attachmentError && (
        <div className="px-3 sm:px-4 pt-2 pb-0 text-[12px] text-red-600 bg-red-50 border-b border-red-100 flex items-center gap-1.5 py-1.5">
          <X className="w-3.5 h-3.5" />
          <span>{attachmentError}</span>
        </div>
      )}

      {/* Reply preview */}
      {replyTarget && (
        <div className="px-3 sm:px-4 pt-2.5">
          <ReplyPreview
            authorLabel={replyTarget.authorLabel}
            text={replyTarget.text}
            imageUrl={replyTarget.imageUrl}
            onDismiss={onClearReply}
            variant="composer"
          />
        </div>
      )}

      {/* Image preview tray */}
      {pendingImages.length > 0 && (
        <div className="px-3 sm:px-4 pt-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
          {pendingImages.map((img) => (
            <div
              key={img.id}
              className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-saffron-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onRemovePending?.(img.id)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {pendingImages.length < maxAttachments && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-saffron-200 bg-white/50 hover:bg-saffron-50 text-saffron-500 flex items-center justify-center transition"
              aria-label="Add more"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <div className="p-2.5 sm:p-3 flex items-end gap-2">
        {/* Attach */}
        <div className="flex-shrink-0 relative">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pendingImages.length >= maxAttachments}
            className="w-11 h-11 rounded-full text-saffron-700 bg-white border border-saffron-100 hover:bg-saffron-50 active:scale-90 transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title="Attach photo"
            aria-label="Attach photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Composer */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl shadow-sm border border-saffron-100/70 focus-within:border-saffron-300 transition flex items-end">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingImages.length > 0 ? 'Add a caption…' : 'Message your astrologer…'
            }
            disabled={isDisabled}
            rows={1}
            maxLength={2000}
            className="flex-1 min-w-0 bg-transparent px-4 py-3 text-[15px] text-gray-800 placeholder:text-gray-400 leading-snug resize-none focus:outline-none scrollbar-hide"
            style={{ minHeight: '44px', maxHeight: '140px' }}
          />
        </div>

        {/* Send */}
        <button
          onClick={onSendMessage}
          disabled={!canSend}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition active:scale-90 shadow-md ${
            canSend
              ? 'bg-gradient-to-br from-saffron-500 to-saffron-600 text-white shadow-saffron-200 hover:shadow-saffron-300'
              : 'bg-saffron-100 text-saffron-300'
          }`}
          aria-label="Send"
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className={`w-5 h-5 ${canSend ? 'translate-x-0.5' : ''}`} />
          )}
        </button>
      </div>
    </footer>
  )
}
