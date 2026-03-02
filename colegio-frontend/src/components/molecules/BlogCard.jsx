import Badge from '@/components/atoms/Badge';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Link from 'next/link';

const categoryVariants = {
  noticias: 'info',
  eventos: 'success',
  actividades: 'warning',
  logros: 'success',
  anuncios: 'danger',
  general: 'default',
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function BlogCard({ post, variant = 'vertical' }) {
  const { title, excerpt, featuredImage, category, author, publishedAt, slug } = post;

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-white rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200">
        {featuredImage?.url && (
          <img
            src={featuredImage.url}
            alt={featuredImage.alt || title}
            className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Badge variant={categoryVariants[category] || 'default'} size="sm">
            {category}
          </Badge>
          <Heading level="h5" className="line-clamp-2">{title}</Heading>
          <Paragraph size="sm" color="muted" className="line-clamp-2">{excerpt}</Paragraph>
          <div className="flex items-center justify-between mt-auto">
            <Paragraph size="sm" color="muted">{formatDate(publishedAt)}</Paragraph>
            <Link href={`/blog/${slug}`}>
              <Button variant="ghost" size="sm">Leer más →</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {featuredImage?.url ? (
          <img
            src={featuredImage.url}
            alt={featuredImage.alt || title}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-neutral-100 flex items-center justify-center">
            <span className="text-neutral-400 text-sm">Sin imagen</span>
          </div>
        )}
        <div className="p-5 flex flex-col gap-3">
          <Badge variant={categoryVariants[category] || 'default'}>
            {category}
          </Badge>
          <Heading level="h4" className="line-clamp-2">{title}</Heading>
          <Paragraph color="muted" className="line-clamp-3">{excerpt}</Paragraph>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600">
                {author?.name?.[0] || 'A'}
              </div>
              <Paragraph size="sm" color="muted">{author?.name || 'Autor'}</Paragraph>
            </div>
            <Paragraph size="sm" color="muted">{formatDate(publishedAt)}</Paragraph>
          </div>
          <Link href={`/blog/${slug}`}>
            <Button variant="outline" size="sm" className="w-full">
              Leer artículo completo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Variante vertical (default)
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {featuredImage?.url ? (
        <img
          src={featuredImage.url}
          alt={featuredImage.alt || title}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-neutral-100 flex items-center justify-center">
          <span className="text-neutral-400 text-sm">Sin imagen</span>
        </div>
      )}
      <div className="p-4 flex flex-col gap-2.5">
        <Badge variant={categoryVariants[category] || 'default'} size="sm">
          {category}
        </Badge>
        <Heading level="h5" className="line-clamp-2">{title}</Heading>
        <Paragraph size="sm" color="muted" className="line-clamp-2">{excerpt}</Paragraph>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <Paragraph size="sm" color="muted">{formatDate(publishedAt)}</Paragraph>
          <Link href={`/blog/${slug}`}>
            <Button variant="ghost" size="sm">Leer →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}