'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on chat page, call pages, and active live sessions
  if (pathname === '/chat' || pathname?.startsWith('/video-call') || pathname?.startsWith('/audio-call') || (pathname?.startsWith('/live-sessions/') && pathname !== '/live-sessions')) {
    return null;
  }
  
  return <Footer />;
}
