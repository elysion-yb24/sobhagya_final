'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const ENTRY_KEY = 'sobhagya:entryFrom';

type BackButtonProps = {
  className?: string;
  size?: number;
  variant?: 'default' | 'ghost';
  ariaLabel?: string;
};

/**
 * Single-step back button.
 *
 * On first paint we record where the user came from (same-origin referrer or
 * "/"). When clicked we navigate there with router.replace and immediately
 * collapse the history stack so a second browser-back press cannot dive any
 * deeper than the home page.
 */
export default function BackButton({
  className = '',
  size = 18,
  variant = 'default',
  ariaLabel = 'Go back',
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [entry, setEntry] = useState<string>('/');
  const usedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let stored = sessionStorage.getItem(ENTRY_KEY);
    if (!stored) {
      const ref = document.referrer;
      try {
        if (ref) {
          const u = new URL(ref);
          if (u.origin === window.location.origin && u.pathname !== pathname) {
            stored = u.pathname + (u.search || '');
          }
        }
      } catch {
        // ignore
      }
      if (!stored) stored = '/';
      sessionStorage.setItem(ENTRY_KEY, stored);
    }
    setEntry(stored);
  }, [pathname]);

  const handleClick = () => {
    if (usedRef.current) {
      router.replace('/');
      return;
    }
    usedRef.current = true;
    const target = entry || '/';
    sessionStorage.removeItem(ENTRY_KEY);
    router.replace(target);
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({}, '', target);
      } catch {
        // ignore
      }
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
