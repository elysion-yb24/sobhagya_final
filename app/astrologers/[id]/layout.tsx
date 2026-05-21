import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // We intentionally don't fetch the astrologer here — the client page handles
  // that and we'd duplicate the call. Setting only a canonical + base title is
  // enough to deduplicate this profile URL for search crawlers.
  return {
    title: 'Astrologer Profile | Sobhagya',
    description:
      'Talk to a verified Sobhagya astrologer over call, video or chat. View ratings, languages and live availability.',
    alternates: {
      canonical: `https://sobhagya.in/astrologers/${id}`,
    },
  };
}

export default function AstrologerProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
