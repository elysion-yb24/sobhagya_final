'use client'

import React from 'react'
import { X } from 'lucide-react'

interface Props {
  authorLabel: string
  text: string
  imageUrl?: string
  onDismiss?: () => void
  onClick?: () => void
  variant?: 'composer' | 'bubble'
  tone?: 'user' | 'astrologer'
}

export default function ReplyPreview({
  authorLabel,
  text,
  imageUrl,
  onDismiss,
  onClick,
  variant = 'composer',
  tone = 'astrologer',
}: Props) {
  const accent = tone === 'user' ? 'border-amber-300 bg-white/40' : 'border-saffron-400 bg-saffron-50/70'
  const isImage = !!imageUrl
  const previewText = isImage ? 'Photo' : (text || '...').replace(/\s+/g, ' ').slice(0, 120)

  const inner = (
    <div className={`flex items-stretch gap-2 rounded-lg border-l-4 ${accent} px-2.5 py-1.5 min-w-0`}>
      <div className="flex-1 min-w-0">
        <div className={`text-[11px] font-semibold ${tone === 'user' ? 'text-amber-700' : 'text-orange-700'} truncate`}>
          {authorLabel}
        </div>
        <div className={`text-xs leading-snug truncate ${tone === 'user' ? 'text-orange-900/80' : 'text-gray-600'}`}>
          {isImage ? (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo
            </span>
          ) : (
            previewText
          )}
        </div>
      </div>
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
      )}
      {variant === 'composer' && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-black/5 transition self-center"
          aria-label="Cancel reply"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    )
  }
  return inner
}
