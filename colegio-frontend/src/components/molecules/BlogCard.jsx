import Link from 'next/link';
import { LuNewspaper } from 'react-icons/lu';

const categoryColors = {
  noticias:    { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  eventos:     { bg: 'bg-brand-50',  text: 'text-brand-700',  dot: 'bg-brand-400' },
  actividades: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  logros:      { bg: 'bg-brand-50',  text: 'text-brand-700',  dot: 'bg-brand-400' },
  anuncios:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400' },
  general:     { bg: 'bg-neutral-100', text: 'text-neutral-600', dot: 'bg-neutral-400' },
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

function CategoryPill({ category }) {
  const colors = categoryColors[category] || categoryColors.general;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-mono font-bold uppercase tracking-wide ${colors.bg} ${colors.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {category}
    </span>
  );
}

export default function BlogCard({ post, variant = 'vertical' }) {
  const { title, excerpt, featuredImage, category, author, publishedAt, slug } = post;

  if (variant === 'horizontal') {
    return (
      <Link href={`/blog/${slug}`} className="block group">
        <div className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all duration-300">
          <div className="w-28 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-brand-50">
            {featuredImage?.url ? (
              <img
                src={featuredImage.url}
                alt={featuredImage.alt || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><LuNewspaper className="w-8 h-8 text-brand-300" /></div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <CategoryPill category={category} />
            <h5 className="font-display font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">{title}</h5>
            <p className="text-xs text-neutral-400 line-clamp-2">{excerpt}</p>
            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="text-xs text-neutral-400">{formatDate(publishedAt)}</span>
              <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">Leer →</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${slug}`} className="block group h-full">
        <article className="relative bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50/50 transition-all duration-300 h-full flex flex-col">
          {/* Imagen */}
          <div className="relative overflow-hidden bg-brand-50 h-52">
            {featuredImage?.url ? (
              <img
                src={featuredImage.url}
                alt={featuredImage.alt || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><LuNewspaper className="w-12 h-12 text-brand-200" /></div>
            )}
            {/* Overlay en hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="p-5 flex flex-col gap-3 flex-1">
            <CategoryPill category={category} />
            <h4 className="font-display font-bold text-neutral-900 text-lg leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors duration-200">{title}</h4>
            <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed">{excerpt}</p>

            <div className="flex items-center justify-between pt-3 mt-auto border-t border-neutral-50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 font-display">
                  {author?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="text-xs text-neutral-400">{author?.name || 'Autor'}</span>
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                Leer <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Variante vertical (default)
  return (
    <Link href={`/blog/${slug}`} className="block group">
      <article className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-brand-200 hover:shadow-lg transition-all duration-300">
        <div className="overflow-hidden bg-brand-50 h-44">
          {featuredImage?.url ? (
            <img
              src={featuredImage.url}
              alt={featuredImage.alt || title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><LuNewspaper className="w-10 h-10 text-brand-200" /></div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2">
          <CategoryPill category={category} />
          <h5 className="font-display font-semibold text-neutral-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">{title}</h5>
          <p className="text-sm text-neutral-400 line-clamp-2">{excerpt}</p>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
            <span className="text-xs text-neutral-400">{formatDate(publishedAt)}</span>
            <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-200">Leer →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
