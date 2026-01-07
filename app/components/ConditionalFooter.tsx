'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on chat and call pages
  if (pathname === '/chat' || pathname === '/audio-call' || pathname === '/video-call') {
    return null;
  }

  return <Footer />;
}
