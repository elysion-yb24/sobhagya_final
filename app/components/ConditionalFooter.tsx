'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on chat page, call pages, active live sessions, and partner dashboard
  if (
    pathname === '/chat' ||
    pathname?.startsWith('/video-call') ||
    pathname?.startsWith('/audio-call') ||
    pathname?.startsWith('/astrologer-video-call') ||
    pathname === '/partner-info' ||
    pathname?.startsWith('/partner-info/') ||
    (pathname?.startsWith('/live-sessions/') && pathname !== '/live-sessions')
  ) {
    return null;
  }
  
  return <Footer />;
}
