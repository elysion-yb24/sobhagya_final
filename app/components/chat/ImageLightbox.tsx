'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

interface Props {
  images: { url: string; caption?: string; senderName?: string; timestamp?: string }[]
  startIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageLightbox({ images, startIndex, isOpen, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setIndex(startIndex)
      setZoom(1)
    }
  }, [isOpen, startIndex])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, images.length, onClose])

  // Lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const current = images[index]
  if (!current) return null

  const canPrev = index > 0
  const canNext = index < images.length - 1

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] bg-black/95 flex flex-col"
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-3 sm:px-5 py-3 text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{current.senderName || 'Photo'}</div>
              {current.timestamp && (
                <div className="text-[11px] text-white/60">
                  {new Date(current.timestamp).toLocaleString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Open original"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div
            className="flex-1 flex items-center justify-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              key={current.url}
              drag={zoom === 1 ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y) > 120) onClose()
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="max-w-full max-h-full px-4 sm:px-12"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={current.caption || ''}
                onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
                className="max-w-full max-h-[78vh] object-contain rounded-lg select-none cursor-zoom-in"
                style={{ transform: `scale(${zoom})`, transition: 'transform 200ms ease' }}
                draggable={false}
              />
            </motion.div>

            {canPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex((i) => Math.max(0, i - 1))
                  setZoom(1)
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white transition"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {canNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex((i) => Math.min(images.length - 1, i + 1))
                  setZoom(1)
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white transition"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Footer caption */}
          <div
            className="px-4 sm:px-8 py-3 text-center text-white/85 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {current.caption && (
              <p className="max-w-2xl mx-auto leading-relaxed mb-1">{current.caption}</p>
            )}
            <p className="text-[11px] text-white/50">
              {index + 1} of {images.length} · double-tap to zoom · swipe down to close
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
