'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
  className?: string;
  size?: number;
  variant?: 'default' | 'ghost';
  ariaLabel?: string;
};

/**
 * Back button with a safe home fallback.
 *
 * - If there is in-tab history we delegate to router.back() so the browser
 *   just steps back one entry (preserves scroll, cache, etc.).
 * - Otherwise (direct load, or a tab opened fresh on a deep link) we send the
 *   user to the home page.
 *
 * We intentionally do NOT touch window.history.replaceState — mixing manual
 * history mutations with Next.js's App Router history was preventing the
 * navigation from actually applying on pages like /chat.
 */
export default function BackButton({
  className = '',
  size = 18,
  variant = 'default',
  ariaLabel = 'Go back',
}: BackButtonProps) {
  const router = useRouter();
  const hasHistoryRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // window.history.length is >= 1 for any tab. Anything > 1 means there
    // is an entry we can step back to within this tab.
    hasHistoryRef.current = window.history.length > 1;
  }, []);

  const handleClick = () => {
    if (hasHistoryRef.current) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const base =
    'inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300';
  const styles =
    variant === 'ghost'
      ? 'w-9 h-9 text-gray-700 hover:bg-gray-100'
      : 'w-9 h-9 bg-white border border-orange-200/70 text-gray-700 shadow-sm hover:shadow-md hover:border-orange-300 hover:text-orange-600';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`${base} ${styles} ${className}`}
    >
      <ArrowLeft size={size} strokeWidth={2.5} />
    </button>
  );
}
