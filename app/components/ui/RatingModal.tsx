'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StarRating from './StarRating'

interface RatingModalProps {
  isOpen: boolean
  onRatingSubmit: (rating: number) => void
  onContinueChat: () => void
  onClose: () => void
}

export default function RatingModal({ 
  isOpen, 
  onRatingSubmit, 
  onContinueChat, 
  onClose 
}: RatingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          {/* Local backdrop with blur - only affects the chat messages area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              damping: 20,
              stiffness: 300
            }}
            className="relative z-10 w-full max-w-sm"
          >
            <StarRating
              onRatingSubmit={onRatingSubmit}
              onContinueChat={onContinueChat}
              onClose={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
