'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

const PARTNER_PATHS = [
  '/partner-info',
  '/astrologer-video-call',
];

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (!pathname) return <Header />;

  // Full-screen call surfaces render their own chrome — hide the site header.
  if (pathname.startsWith('/pooja/live')) return null;

  // Partner-owned routes render their own dashboard chrome — hide the user header.
  const isPartnerRoute =
    PARTNER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith('/live-sessions/');

  if (isPartnerRoute) return null;

  return <Header />;
}
