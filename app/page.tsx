import HeroSection from '@/app/components/HeroSection';

import RashiSection from '@/app/components/RashiSection';
import ConsultingSection from '@/app/components/ConsultingSection';
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
      <AstrologerCarousel />
      <ConsultingSection />
      <StatsBar />
      <BlogSection />
      <RashiSection />
      <HoroscopeInsights />
      <AppDownload />
      <WhyConsult />
     
     
    </main>
    
  );
}