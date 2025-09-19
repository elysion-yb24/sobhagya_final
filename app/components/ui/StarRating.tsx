'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  onRatingSubmit: (rating: number) => void
  onContinueChat: () => void
  onClose?: () => void
}

export default function StarRating({ onRatingSubmit, onContinueChat, onClose }: StarRatingProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const handleSubmitRating = () => {
    if (rating > 0) {
      onRatingSubmit(rating)
      setIsSubmitted(true)
    }
  }

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= (hoveredRating || rating)
    return (
      <motion.button
        key={starNumber}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => setHoveredRating(starNumber)}
        onMouseLeave={() => setHoveredRating(0)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`text-3xl transition-colors duration-200 ${
          isFilled ? 'text-orange-500' : 'text-gray-300'
        } hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50`}
      >
        ★
      </motion.button>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 max-w-md w-full mx-auto relative backdrop-blur-sm">
      {/* Close button - always show */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="text-center">
        {!isSubmitted ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rate Your Experience
              </h3>
              <p className="text-gray-600">
                How was your session with the astrologer?
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(renderStar)}
            </div>

            {rating > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {rating === 1 && "Poor - We'll work to improve"}
                  {rating === 2 && "Fair - Thanks for your feedback"}
                  {rating === 3 && "Good - We appreciate your rating"}
                  {rating === 4 && "Very Good - Thank you!"}
                  {rating === 5 && "Excellent - We're thrilled!"}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <motion.button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                whileHover={rating > 0 ? { scale: 1.02 } : {}}
                whileTap={rating > 0 ? { scale: 0.98 } : {}}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  rating === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                }`}
              >
                Submit Rating
              </motion.button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <span className="text-2xl">✅</span>
              <span className="font-medium">Thank you for your feedback!</span>
            </div>
            
            <div className="space-y-3">
              <motion.button
                onClick={onContinueChat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 shadow-md hover:shadow-lg transition-colors"
              >
                Continue This Chat
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
