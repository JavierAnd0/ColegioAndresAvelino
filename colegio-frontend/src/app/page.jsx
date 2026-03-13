import MainLayout from '@/components/templates/MainLayout';
import HeroSection from '@/components/organisms/HeroSection';
import HomeEventsSection from '@/components/organisms/HomeEventsSection';
import HomeHonorSection from '@/components/organisms/HomeHonorSection';
import HomeBlogSection from '@/components/organisms/HomeBlogSection';

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero */}
      <HeroSection />

      {/* Próximos eventos — carousel fluido */}
      <HomeEventsSection />

      {/* Cuadro de Honor — carousel por grado, mes actual */}
      <HomeHonorSection />

      {/* Posts */}
      <HomeBlogSection />
    </MainLayout>
  );
}
