'use client';

import { usePathname } from 'next/navigation';

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isListingPage = pathname === '/blog';

    // Listing page needs to scroll, individual posts need iframe container
    if (isListingPage) {
        return <div className="min-h-screen">{children}</div>;
    }

    return (
        <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] overflow-hidden">
            {children}
        </div>
    );
}
