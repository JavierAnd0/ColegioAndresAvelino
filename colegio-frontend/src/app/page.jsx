import MainLayout from '@/components/templates/MainLayout';
import HeroSection from '@/components/organisms/HeroSection';
import HomeBlogSection from '@/components/organisms/HomeBlogSection';
import EventCard from '@/components/molecules/EventCard';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Link from 'next/link';


// URL base del API con fallback (igual que services/api.js)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getUpcomingEvents() {
  try {
    const res = await fetch(
      `${API_URL}/events/upcoming`,
      { next: { revalidate: 60 }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error.message);
    return [];
  }
}

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents();

  return (
    <MainLayout>
      {/* Hero */}
      <HeroSection />

      {/* Próximos eventos */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Heading level="h2">Próximos Eventos</Heading>
              <Paragraph color="muted" className="mt-1">
                Actividades y eventos de nuestra institución
              </Paragraph>
            </div>
            <Link href="/calendario">
              <Button variant="outline" size="sm">Ver todos →</Button>
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-10">
              <Paragraph color="muted">No hay eventos programados por el momento.</Paragraph>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.slice(0, 4).map((event) => (
                <EventCard key={event._id} event={event} variant="compact" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts - componente client-side con autenticación */}
      <HomeBlogSection />
    </MainLayout>
  );
}
