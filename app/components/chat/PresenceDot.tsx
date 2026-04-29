'use client'

import React from 'react'

type Presence = 'online' | 'busy' | 'offline'

interface Props {
  status: Presence
  size?: number
  ringClass?: string
  className?: string
}

const COLORS: Record<Presence, string> = {
  online: 'bg-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-gray-300',
}

export default function PresenceDot({
  status,
  size = 12,
  ringClass = 'ring-2 ring-white',
  className = '',
}: Props) {
  const px = `${size}px`
  return (
    <span
      className={`inline-block rounded-full ${COLORS[status]} ${ringClass} ${className}`}
      style={{ width: px, height: px }}
    >
      {status === 'online' && (
        <span
          className="block w-full h-full rounded-full bg-emerald-400/60 animate-ping"
          style={{ animationDuration: '1.6s' }}
        />
      )}
    </span>
  )
}
