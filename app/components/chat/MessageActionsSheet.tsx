'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reply, Copy, Trash2 } from 'lucide-react'

export interface MessageActionsTarget {
  id: string
  text: string
  isMine: boolean
  isImage?: boolean
}

interface Props {
  target: MessageActionsTarget | null
  onClose: () => void
  onReply: (target: MessageActionsTarget) => void
  onCopy?: (text: string) => void
  onDelete?: (target: MessageActionsTarget) => void
}

export default function MessageActionsSheet({ target, onClose, onReply, onCopy, onDelete }: Props) {
  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, onClose])

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          key="actions-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[110] bg-black/40 flex items-end sm:items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            key="actions-sheet"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-saffron-100 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2 border-b border-saffron-50">
              <p className="text-[11px] uppercase tracking-wider text-saffron-600 font-bold">Message</p>
              <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">
                {target.isImage ? '📷 Photo' : target.text || '...'}
              </p>
            </div>

            <ActionRow
              icon={<Reply className="w-5 h-5" />}
              label="Reply"
              onClick={() => {
                onReply(target)
                onClose()
              }}
            />
            {!target.isImage && onCopy && (
              <ActionRow
                icon={<Copy className="w-5 h-5" />}
                label="Copy text"
                onClick={() => {
                  onCopy(target.text)
                  onClose()
                }}
              />
            )}
            {target.isMine && onDelete && (
              <ActionRow
                icon={<Trash2 className="w-5 h-5" />}
                label="Delete for me"
                tone="danger"
                onClick={() => {
                  onDelete(target)
                  onClose()
                }}
              />
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition border-t border-saffron-50"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ActionRow({
  icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  const color = tone === 'danger' ? 'text-red-600' : 'text-gray-800'
  const hover = tone === 'danger' ? 'hover:bg-red-50' : 'hover:bg-saffron-50'
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3.5 flex items-center gap-3 text-sm font-medium ${color} ${hover} transition active:scale-[0.99] focus:outline-none`}
    >
      <span className="text-saffron-600">{icon}</span>
      {label}
    </button>
  )
}
