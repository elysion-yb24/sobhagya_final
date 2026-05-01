'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, CheckCircle2 } from 'lucide-react'

interface SessionEndedCardProps {
  onRate: () => void
  onSendDakshina?: () => void
  onChatAgain: () => void
  astrologerName: string
  astrologerAvatar?: string
}

export default function SessionEndedCard({
  onRate,
  onChatAgain,
  astrologerName,
  astrologerAvatar,
}: SessionEndedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto my-4 px-4 sm:px-5 py-3 sm:py-4 bg-white rounded-2xl shadow-sm border border-saffron-100"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        {/* Left: avatar + status */}
        <div className="flex items-center gap-3 min-w-0 sm:flex-1">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-saffron-100">
              {astrologerAvatar ? (
                <img src={astrologerAvatar} alt={astrologerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center text-white text-lg font-bold">
                  {astrologerName.charAt(0)}
                </div>
              )}
            </div>
            <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-green-600 bg-white rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-garamond text-base sm:text-lg font-bold text-saffron-900 truncate">Session Completed</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              with <span className="font-semibold text-gray-700">{astrologerName}</span>
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 sm:shrink-0">
          <button
            onClick={onRate}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-saffron-50 text-saffron-700 rounded-lg text-sm font-semibold hover:bg-saffron-100 transition active:scale-95 border border-saffron-200"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Rate</span>
          </button>

          <button
            onClick={onChatAgain}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition active:scale-95 border border-gray-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Again</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
