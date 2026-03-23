import Link from 'next/link';
import { LuNewspaper, LuCalendar } from 'react-icons/lu';

const categoryColors = {
  noticias:    { bg: 'bg-blue-500/90',    text: 'text-white' },
  eventos:     { bg: 'bg-brand-600/90',   text: 'text-white' },
  actividades: { bg: 'bg-yellow-500/90',  text: 'text-white' },
  logros:      { bg: 'bg-emerald-600/90', text: 'text-white' },
  anuncios:    { bg: 'bg-red-500/90',     text: 'text-white' },
  general:     { bg: 'bg-neutral-700/90', text: 'text-white' },
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });

function CategoryPill({ category, overlay = false }) {
  const colors = categoryColors[category] || categoryColors.general;
  if (overlay) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.6rem] font-mono font-bold uppercase tracking-widest backdrop-blur-sm ${colors.bg} ${colors.text}`}>
        {category}
      </span>
    );
  }
  // Versión clara para fondos blancos
  const lightMap = {
    noticias:    'bg-blue-50 text-blue-700',
    eventos:     'bg-brand-50 text-brand-700',
    actividades: 'bg-yellow-50 text-yellow-700',
    logros:      'bg-emerald-50 text-emerald-700',
    anuncios:    'bg-red-50 text-red-700',
    general:     'bg-neutral-100 text-neutral-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.6rem] font-mono font-bold uppercase tracking-widest ${lightMap[category] || lightMap.general}`}>
      {category}
    </span>
  );
}

/* ── Placeholder cuando no hay imagen ── */
function ImagePlaceholder({ size = 'md' }) {
  const iconSize = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-50 via-brand-100/50 to-neutral-100">
      <LuNewspaper className={`${iconSize} text-brand-200`} />
    </div>
  );
}

export default function BlogCard({ post, variant = 'vertical' }) {
  const { title, excerpt, featuredImage, category, author, publishedAt, slug } = post;

  /* ── Horizontal ── */
  if (variant === 'horizontal') {
    return (
      <Link href={`/blog/${slug}`} className="block group">
        <div className="flex gap-4 p-3 bg-white rounded-2xl border border-neutral-100
          hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all duration-300">
          <div className="relative w-28 h-20 rounded-xl flex-shrink-0 overflow-hidden">
            {featuredImage?.url ? (
              <img
                src={featuredImage.url}
                alt={featuredImage.alt || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <ImagePlaceholder size="sm" />
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <CategoryPill category={category} />
            <h5 className="font-display font-semibold text-neutral-900 text-sm leading-snug line-clamp-2
              group-hover:text-brand-700 transition-colors">{title}</h5>
            <p className="text-xs text-neutral-400 line-clamp-1">{excerpt}</p>
            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <LuCalendar className="w-3 h-3" />
                {formatDate(publishedAt)}
              </span>
              <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-200">
                Leer →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Featured ── */
  if (variant === 'featured') {
    return (
      <Link href={`/blog/${slug}`} className="block group h-full">
        <article className="relative bg-white rounded-2xl border border-neutral-100 overflow-hidden
          hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50/50 transition-all duration-300 h-full flex flex-col">

          {/* Imagen */}
          <div className="relative overflow-hidden aspect-[16/9] flex-shrink-0">
            {featuredImage?.url ? (
              <img
                src={featuredImage.url}
                alt={featuredImage.alt || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <ImagePlaceholder size="lg" />
            )}
            {/* Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {/* Badge categoría */}
            <div className="absolute top-3 left-3">
              <CategoryPill category={category} overlay />
            </div>
            {/* Fecha */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/80 text-xs font-mono">
              <LuCalendar className="w-3.5 h-3.5" />
              {formatDate(publishedAt)}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-5 flex flex-col gap-2.5 flex-1">
            <h4 className="font-display font-bold text-neutral-900 text-lg leading-snug line-clamp-2
              group-hover:text-brand-700 transition-colors duration-200">{title}</h4>
            <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed flex-1">{excerpt}</p>

            <div className="flex items-center justify-between pt-3 mt-auto border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center
                  text-xs font-bold text-brand-700 font-display flex-shrink-0">
                  {author?.name?.[0]?.toUpperCase() || 'D'}
                </div>
                <span className="text-xs text-neutral-400">{author?.name || 'Docente'}</span>
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1
                opacity-0 group-hover:opacity-100 transition-all duration-200">
                Leer <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">→</span>
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  /* ── Vertical (default) ── */
  return (
    <Link href={`/blog/${slug}`} className="block group h-full">
      <article className="bg-white rounded-2xl border border-neutral-100 overflow-hidden
        hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50/50 transition-all duration-300 h-full flex flex-col">

        {/* Imagen con overlay */}
        <div className="relative overflow-hidden aspect-[16/9] flex-shrink-0">
          {featuredImage?.url ? (
            <img
              src={featuredImage.url}
              alt={featuredImage.alt || title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <ImagePlaceholder />
          )}
          {/* Gradiente oscuro inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          {/* Badge de categoría superpuesto */}
          <div className="absolute top-3 left-3">
            <CategoryPill category={category} overlay />
          </div>
          {/* Fecha superpuesta */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/80 text-[0.65rem] font-mono">
            <LuCalendar className="w-3 h-3" />
            {formatDate(publishedAt)}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h5 className="font-display font-semibold text-neutral-900 leading-snug line-clamp-2
            group-hover:text-brand-700 transition-colors">{title}</h5>
          <p className="text-sm text-neutral-400 line-clamp-2 flex-1 leading-relaxed">{excerpt}</p>

          <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-neutral-100">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-brand-100 flex items-center justify-center
                text-[0.6rem] font-bold text-brand-700 flex-shrink-0">
                {author?.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <span className="text-xs text-neutral-400 truncate max-w-[100px]">{author?.name || 'Docente'}</span>
            </div>
            <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
              Leer →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
