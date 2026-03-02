'use client';

import { useState, useEffect } from 'react';
import { blogService } from '@/services/blogService';
import BlogCard from '@/components/molecules/BlogCard';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Link from 'next/link';

export default function HomeBlogSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Primero intentar posts destacados
        const featuredData = await blogService.getFeatured();
        if (featuredData.data && featuredData.data.length > 0) {
          setPosts(featuredData.data.slice(0, 3));
        } else {
          // Fallback: obtener los posts más recientes
          const recentData = await blogService.getAll({ limit: 3 });
          setPosts(recentData.data || []);
        }
      } catch (error) {
        console.error('Error al cargar posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-neutral-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-20" />
                  <div className="h-5 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <Paragraph color="muted">No hay publicaciones disponibles por el momento.</Paragraph>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} variant="featured" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
