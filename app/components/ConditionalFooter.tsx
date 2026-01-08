'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on chat, call, and blog pages
  if (pathname === '/chat' || pathname === '/audio-call' || pathname === '/video-call' || (pathname && pathname.startsWith('/blog'))) {
    return null;
  }

  return <Footer />;
}
