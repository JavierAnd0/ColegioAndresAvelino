import MainLayout from '@/components/templates/MainLayout';
import HeroSection from '@/components/organisms/HeroSection';
import EventCard from '@/components/molecules/EventCard';
import BlogCard from '@/components/molecules/BlogCard';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import BlogCardSkeleton from '@/components/molecules/BlogCardSkeleton';
import EventCardSkeleton from '@/components/molecules/EventCardSkeleton';


// Obtener datos del servidor directamente (Next.js Server Component)
async function getFeaturedPosts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog/featured`,
      { next: { revalidate: 60 } } // Revalidar cada 60 segundos
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getUpcomingEvents() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/upcoming`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredPosts, upcomingEvents] = await Promise.all([
    getFeaturedPosts(),
    getUpcomingEvents(),
  ]);

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
                Actividades programadas para esta semana
              </Paragraph>
            </div>
            <Link href="/calendario">
              <Button variant="outline" size="sm">Ver todos →</Button>
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-10">
              <Paragraph color="muted">No hay eventos próximos esta semana.</Paragraph>
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

      {/* Posts destacados */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Heading level="h2">Últimas Noticias</Heading>
              <Paragraph color="muted" className="mt-1">
                Lo más reciente de nuestra institución
              </Paragraph>
            </div>
            <Link href="/blog">
              <Button variant="outline" size="sm">Ver todas →</Button>
            </Link>
          </div>

          {featuredPosts.length === 0 ? (
            <div className="text-center py-10">
              <Paragraph color="muted">No hay publicaciones destacadas aún.</Paragraph>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post._id} post={post} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}