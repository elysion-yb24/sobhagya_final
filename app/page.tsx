import dynamic from 'next/dynamic';
import HeroSection from '@/app/components/HeroSection';
import ConsultingSection from '@/app/components/ConsultingSection';
import StatsBar from '@/app/components/StatsBar';

const OurProducts = dynamic(() => import('@/app/components/OurProducts'), { ssr: true });
const AstrologerCarousel = dynamic(() => import('@/app/components/ConsultAstrologer'), { ssr: true });
const BlogSection = dynamic(() => import('@/app/components/BlogSection'), { ssr: true });
const RashiSection = dynamic(() => import('@/app/components/RashiSection'), { ssr: true });
const HoroscopeInsights = dynamic(() => import('@/app/components/HoroscopeInsights'), { ssr: true });
const AppDownload = dynamic(() => import('@/app/components/AppDownload'), { ssr: true });
const WhyConsult = dynamic(() => import('@/app/components/WhyConsult'), { ssr: true });

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      {/* Sacred divider between hero and consulting */}
      <div className="sacred-divider mx-auto max-w-xs sm:max-w-md md:max-w-lg my-0" />
      <ConsultingSection />
      <StatsBar />
      <OurProducts />
      <AstrologerCarousel />
      <BlogSection />
      <RashiSection />
      <HoroscopeInsights />
      <AppDownload />
      <WhyConsult />
    </main>
  );
}