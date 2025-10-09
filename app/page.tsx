import HeroSection from '@/app/components/HeroSection';
import RashiSection from '@/app/components/RashiSection';
import ConsultingSection from '@/app/components/ConsultingSection';
import OurProducts from '@/app/components/OurProducts';
import StatsBar from '@/app/components/StatsBar';
import BlogSection from '@/app/components/BlogSection';
import AppDownload from '@/app/components/AppDownload';
import WhyConsult from '@/app/components/WhyConsult';
import AstrologerCarousel from '@/app/components/ConsultAstrologer';
import HoroscopeInsights from '@/app/components/HoroscopeInsights';
import ScrollAnimation from '@/app/components/ui/ScrollAnimation';


export default function Home() {
  return (
    <main>
      <HeroSection />
      <ScrollAnimation delay={0.2}>
        <ConsultingSection />
      </ScrollAnimation>
      <ScrollAnimation delay={0.1}>
        <StatsBar />
      </ScrollAnimation>
      <ScrollAnimation delay={0.3}>
        <OurProducts />
      </ScrollAnimation>
      <ScrollAnimation delay={0.2}>
        <AstrologerCarousel />
      </ScrollAnimation>
      <ScrollAnimation delay={0.4}>
        <BlogSection />
      </ScrollAnimation>
      <ScrollAnimation delay={0.3}>
        <RashiSection />
      </ScrollAnimation>
      <ScrollAnimation delay={0.2}>
        <HoroscopeInsights />
      </ScrollAnimation>
      <ScrollAnimation delay={0.4}>
        <AppDownload />
      </ScrollAnimation>
      <ScrollAnimation delay={0.3}>
        <WhyConsult />
      </ScrollAnimation>
    </main>
  );
}