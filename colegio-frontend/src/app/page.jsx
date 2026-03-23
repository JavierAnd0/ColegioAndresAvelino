import MainLayout from '@/components/templates/MainLayout';
import HeroSection from '@/components/organisms/HeroSection';
import HomeEventsSection from '@/components/organisms/HomeEventsSection';
import HomeHonorSection from '@/components/organisms/HomeHonorSection';
import ImageCarousel from '@/components/organisms/ImageCarousel';
import HomeBlogSection from '@/components/organisms/HomeBlogSection';

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero */}
      <HeroSection />

      {/* Eventos */}
      <HomeEventsSection />

      {/* Transición oscuro → verde */}
      <div className="h-0 overflow-visible relative z-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 64" className="w-full fill-brand-900 -mt-1">
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>

      {/* Cuadro de Honor */}
      <HomeHonorSection />

      {/* Transición verde → negro (carousel) */}
      <div className="h-0 overflow-visible relative z-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 64" className="w-full fill-neutral-950 -mt-1">
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>

      {/* Carousel de imágenes — solo aparece si hay slides */}
      <ImageCarousel />

      {/* Transición negro → blanco */}
      <div className="h-0 overflow-visible relative z-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 64" className="w-full fill-white -mt-1">
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>

      {/* Blog */}
      <HomeBlogSection />
    </MainLayout>
  );
}
