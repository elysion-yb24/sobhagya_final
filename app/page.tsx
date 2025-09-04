import HeroSection from '@/app/components/HeroSection';

import RashiSection from '@/app/components/RashiSection';
import ConsultingSection from '@/app/components/ConsultingSection';
import OurProducts from '@/app/components/OurProducts';
import StatsBar from '@/app/components/StatsBar';
import BlogSection from '@/app/components/BlogSection';
import AppDownload from '@/app/components/AppDownload';
import WhyConsult from '@/app/components/WhyConsult';
import AstrologerCarousel from '@/app/components/ConsultAstrologer';
import HoroscopeInsights from '@/app/components/HoroscopeInsights'


export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="h-16 bg-white"></div>
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