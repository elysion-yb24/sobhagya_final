import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Kundli Service | Sobhagya',
  description:
    'Get a personalised Vedic Kundli online — planetary positions, doshas, dashas and gemstone guidance prepared by Sobhagya astrologers.',
  alternates: {
    canonical: 'https://sobhagya.in/services/kundli',
  },
};

export default function KundliServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
