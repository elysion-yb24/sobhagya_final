'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Gift, MessageCircle, Heart } from 'lucide-react'

interface SessionEndedCardProps {
  onRate: () => void
  onSendDakshina: () => void
  onChatAgain: () => void
  astrologerName: string
  astrologerAvatar?: string
}

export default function SessionEndedCard({
  onRate,
  onSendDakshina,
  onChatAgain,
  astrologerName,
  astrologerAvatar,
}: SessionEndedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-md mx-auto my-8 p-6 bg-white rounded-3xl shadow-xl border border-saffron-100 relative overflow-hidden"
    >
      {/* Background Mandala Watermark */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-[0.05] pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="#F7941D">
          <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
          <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-saffron-50 shadow-lg mb-4">
          {astrologerAvatar ? (
            <img src={astrologerAvatar} alt={astrologerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center text-white text-2xl font-bold">
              {astrologerName.charAt(0)}
            </div>
          )}
        </div>

        <h2 className="font-garamond text-2xl font-bold text-saffron-900 mb-1">Session Completed</h2>
        <p className="text-gray-500 text-sm mb-6">Your session with <span className="font-semibold text-gray-700">{astrologerName}</span> has ended. May you find peace and clarity.</p>

        <div className="grid grid-cols-1 gap-3 w-full">
          <button
            onClick={onRate}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-saffron-50 text-saffron-700 rounded-2xl font-bold hover:bg-saffron-100 transition active:scale-95 border border-saffron-200"
          >
            <Star className="w-5 h-5 fill-current" />
            Rate Session
          </button>

          <button
            onClick={onSendDakshina}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold hover:shadow-lg transition active:scale-95 shadow-orange-200"
          >
            <Gift className="w-5 h-5" />
            Send Dakshina
          </button>

          <button
            onClick={onChatAgain}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition active:scale-95 border border-gray-200"
          >
            <MessageCircle className="w-5 h-5" />
            Chat Again
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-saffron-400">
          <Heart className="w-4 h-4 fill-current" />
          <span className="text-xs font-semibold uppercase tracking-widest italic font-garamond">Sobhagya Blessings</span>
        </div>
      </div>
    </motion.div>
  )
}
