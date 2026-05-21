import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Kundli (Mobile) | Sobhagya',
  description:
    'Generate your detailed Vedic Kundli on mobile — planetary positions, doshas, rudraksha and gemstone recommendations from Sobhagya.',
  alternates: {
    canonical: 'https://sobhagya.in/kundli/mobile',
  },
};

export default function MobileKundliLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
