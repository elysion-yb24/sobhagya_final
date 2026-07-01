'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight touch-based pull-to-refresh for the mobile-first pooja feed (the app
 * runs in a WebView). When the page is scrolled to the very top and the user pulls
 * down past `threshold`, `onRefresh` runs. No external dependency. Returns
 * `{ pullDistance, refreshing }` so the caller can render a pull indicator.
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void> | void,
  opts: { threshold?: number } = {}
) {
  const threshold = opts.threshold ?? 70;
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const scrollTop = () => window.scrollY || document.documentElement.scrollTop || 0;

    const setDistance = (d: number) => {
      distanceRef.current = d;
      setPullDistance(d);
    };

    const onTouchStart = (e: TouchEvent) => {
      startY.current = scrollTop() <= 0 ? e.touches[0].clientY : null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null || refreshingRef.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && scrollTop() <= 0) setDistance(Math.min(dy * 0.5, threshold * 1.6));
    };

    const onTouchEnd = async () => {
      if (startY.current == null) return;
      const shouldRefresh = distanceRef.current >= threshold;
      startY.current = null;
      setDistance(0);
      if (shouldRefresh && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        try {
          await onRefreshRef.current();
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [threshold]);

  return { pullDistance, refreshing };
}
