'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on chat page and call pages
  if (pathname === '/chat' || pathname?.startsWith('/video-call') || pathname?.startsWith('/audio-call')) {
    return null;
  }
  
  return <Footer />;
}
