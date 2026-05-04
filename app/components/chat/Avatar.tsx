'use client'

import React, { useEffect, useState } from 'react'

interface AvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  imgClassName?: string
  fallbackClassName?: string
}

const DEFAULT_FALLBACK =
  'w-full h-full bg-gradient-to-br from-saffron-200 to-saffron-400 flex items-center justify-center text-white font-bold'

export default function Avatar({
  src,
  name,
  className = '',
  imgClassName = 'object-cover w-full h-full',
  fallbackClassName = DEFAULT_FALLBACK,
}: AvatarProps) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const initial = (name || '').trim().charAt(0).toUpperCase() || 'A'
  const showImage = !!src && !errored

  return (
    <div className={`relative w-full h-full ${className}`}>
      {showImage ? (
        <img
          src={src as string}
          alt={name || ''}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className={imgClassName}
        />
      ) : (
        <div className={fallbackClassName}>{initial}</div>
      )}
    </div>
  )
}
