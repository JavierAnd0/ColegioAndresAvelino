'use client';
import { useState } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/molecules/BlogCard';
import {
    LuInbox, LuChevronLeft, LuChevronRight,
    LuSearch, LuX, LuArrowRight, LuNewspaper, LuCalendar,
} from 'react-icons/lu';

const blogCategories = [
    { value: 'noticias',    label: 'Noticias' },
    { value: 'eventos',     label: 'Eventos' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'logros',      label: 'Logros' },
    { value: 'anuncios',    label: 'Anuncios' },
];

const categoryBadge = {
    noticias:    'bg-blue-500/90 text-white',
    eventos:     'bg-brand-600/90 text-white',
    actividades: 'bg-yellow-500/90 text-white',
    logros:      'bg-emerald-600/90 text-white',
    anuncios:    'bg-red-500/90 text-white',
    general:     'bg-neutral-700/90 text-white',
};

const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

/* ── Skeletons ── */
function FeaturedSkeleton() {
    return <div className="rounded-3xl bg-neutral-200 animate-pulse h-[420px] md:h-[500px]" />;
}
function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
            <div className="aspect-[16/9] bg-neutral-100" />
            <div className="p-4 space-y-2.5">
                <div className="h-4 w-20 bg-neutral-100 rounded" />
                <div className="h-5 w-full bg-neutral-100 rounded" />
                <div className="h-5 w-3/4 bg-neutral-100 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div className="h-4 w-24 bg-neutral-100 rounded" />
                    <div className="h-4 w-12 bg-neutral-100 rounded" />
                </div>
            </div>
        </div>
    );
}

/* ── Post destacado (primer resultado en modo sin filtro) ── */
function FeaturedPost({ post }) {
    if (!post) return null;
    const { title, excerpt, featuredImage, category, author, publishedAt, slug } = post;
    const badge = categoryBadge[category] || categoryBadge.general;

    return (
        <Link href={`/blog/${slug}`} className="block group">
            <article className="relative rounded-3xl overflow-hidden bg-neutral-900 h-[420px] md:h-[500px]">
                {/* Imagen de fondo */}
                {featuredImage?.url ? (
                    <img
                        src={featuredImage.url}
                        alt={featuredImage.alt || title}
                        className="absolute inset-0 w-full h-full object-cover
                            group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-neutral-900
                        flex items-center justify-center">
                        <LuNewspaper className="w-24 h-24 text-white/8" />
                    </div>
                )}

                {/* Gradiente: claro arriba, oscuro abajo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Contenido superpuesto */}
                <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10">
                    <div className="max-w-3xl">
                        {/* Categoría + fecha */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md
                                text-[0.6rem] font-mono font-bold uppercase tracking-widest
                                backdrop-blur-sm ${badge}`}>
                                {category}
                            </span>
                            <span className="flex items-center gap-1.5 text-white/45 text-xs font-mono">
                                <LuCalendar className="w-3 h-3" />
                                {formatDate(publishedAt)}
                            </span>
                        </div>

                        {/* Título */}
                        <h2 className="font-display font-black text-white
                            text-2xl sm:text-3xl md:text-[2.5rem] leading-tight
                            line-clamp-3 mb-3
                            group-hover:text-brand-200 transition-colors duration-300">
                            {title}
                        </h2>

                        {/* Excerpt — solo en pantallas > mobile */}
                        {excerpt && (
                            <p className="hidden sm:block text-white/55 text-sm leading-relaxed
                                line-clamp-2 mb-7 max-w-xl">
                                {excerpt}
                            </p>
                        )}

                        {/* Footer: autor + botón */}
                        <div className="flex items-center justify-between gap-4 mt-4 sm:mt-0">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-sm
                                    flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                    {author?.name?.[0]?.toUpperCase() || 'D'}
                                </div>
                                <span className="text-white/55 text-sm truncate max-w-[140px]">
                                    {author?.name || 'Docente'}
                                </span>
                            </div>

                            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                                bg-white/10 backdrop-blur-sm border border-white/20
                                text-white text-sm font-semibold flex-shrink-0
                                group-hover:bg-brand-600 group-hover:border-brand-600
                                transition-all duration-300">
                                Leer artículo
                                <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

/* ── Componente principal ── */
export default function BlogList({
    posts = [],
    loading = false,
    total = 0,
    page = 1,
    pages = 1,
    onSearch,
    onCategoryChange,
    onPageChange,
    activeCategory = 'all',
    showFilters = true,
}) {
    const [searchInput, setSearchInput] = useState('');
    const [searchApplied, setSearchApplied] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const val = searchInput.trim();
        setSearchApplied(!!val);
        onSearch?.(val);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchApplied(false);
        onSearch?.('');
    };

    const isFiltered = searchApplied || activeCategory !== 'all';
    const showFeatured = !isFiltered && page === 1 && posts.length > 0;
    const featuredPost = showFeatured ? posts[0] : null;
    const gridPosts   = showFeatured ? posts.slice(1) : posts;

    return (
        <div>
            {/* ══════════════════════════════════════════
                HERO
            ══════════════════════════════════════════ */}
            <section className="relative bg-neutral-950 overflow-hidden pt-20 pb-20">
                <div className="absolute inset-0 dot-pattern opacity-[0.06] pointer-events-none" />
                <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-brand-900 rounded-full opacity-20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 right-10 w-80 h-80 bg-yellow-900 rounded-full opacity-10 blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        <span className="text-[0.65rem] font-mono font-bold text-brand-400 uppercase tracking-[0.25em] block mb-5">
                            Noticias & Publicaciones
                        </span>
                        <h1 className="font-display font-black text-white leading-[0.92] mb-6"
                            style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}>
                            Blog<br />
                            <span className="gradient-text">institucional</span>
                        </h1>
                        <p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-md">
                            Las últimas noticias, logros y eventos de nuestra comunidad educativa.
                        </p>

                        {/* Buscador integrado en el hero */}
                        <form onSubmit={handleSearchSubmit}
                            className="flex items-center gap-3 max-w-sm
                                bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-2xl
                                px-5 py-3.5 focus-within:border-white/25 transition-colors">
                            <LuSearch className="w-4 h-4 text-white/35 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Buscar publicaciones..."
                                className="flex-1 bg-transparent text-white placeholder:text-white/25
                                    text-sm outline-none min-w-0"
                            />
                            {searchInput && (
                                <button type="button" onClick={clearSearch}
                                    className="text-white/25 hover:text-white/60 transition-colors cursor-pointer flex-shrink-0">
                                    <LuX className="w-4 h-4" />
                                </button>
                            )}
                            <button type="submit"
                                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700
                                    text-white text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer">
                                Buscar
                            </button>
                        </form>
                    </div>
                </div>

                {/* Wave de transición */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 48" className="w-full fill-neutral-50">
                        <path d="M0,48 L0,24 C360,0 720,48 1080,24 C1260,12 1380,24 1440,16 L1440,48 Z" />
                    </svg>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CONTENIDO
            ══════════════════════════════════════════ */}
            <section className="bg-neutral-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 py-12">

                    {/* Filtros de categoría */}
                    {showFilters && (
                        <div className="flex items-center justify-between gap-4 mb-10 border-b border-neutral-200">
                            <div className="flex items-center gap-0 overflow-x-auto">
                                {[{ value: 'all', label: 'Todas' }, ...blogCategories].map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => onCategoryChange?.(cat.value)}
                                        className={`flex-shrink-0 px-4 py-3 text-sm border-b-2 -mb-px
                                            transition-all duration-200 cursor-pointer whitespace-nowrap
                                            ${activeCategory === cat.value
                                                ? 'text-neutral-900 border-neutral-900 font-semibold'
                                                : 'text-neutral-400 border-transparent hover:text-neutral-700 hover:border-neutral-300 font-medium'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-neutral-400 font-mono pb-3 flex-shrink-0">
                                {total} {total === 1 ? 'publicación' : 'publicaciones'}
                            </p>
                        </div>
                    )}

                    {/* ── Loading ── */}
                    {loading && (
                        <div className="space-y-10">
                            {!isFiltered && page === 1 && <FeaturedSkeleton />}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        </div>
                    )}

                    {/* ── Empty ── */}
                    {!loading && posts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-36 gap-5">
                            <div className="h-20 w-20 bg-white border border-neutral-200 rounded-2xl
                                flex items-center justify-center shadow-sm">
                                <LuInbox className="w-9 h-9 text-neutral-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-display font-bold text-neutral-700 text-lg">
                                    Sin publicaciones
                                </p>
                                <p className="text-neutral-400 text-sm mt-1.5 max-w-xs leading-relaxed">
                                    No se encontraron publicaciones con los filtros seleccionados.
                                </p>
                            </div>
                            {isFiltered && (
                                <button
                                    onClick={() => { clearSearch(); onCategoryChange?.('all'); }}
                                    className="text-sm text-brand-600 font-semibold hover:text-brand-700
                                        transition-colors cursor-pointer underline underline-offset-2">
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Posts ── */}
                    {!loading && posts.length > 0 && (
                        <div className="space-y-10">

                            {/* Post destacado */}
                            {featuredPost && <FeaturedPost post={featuredPost} />}

                            {/* Divider "Más publicaciones" */}
                            {featuredPost && gridPosts.length > 0 && (
                                <div className="flex items-center gap-4 pt-2">
                                    <span className="text-[0.65rem] font-mono font-bold text-neutral-400
                                        uppercase tracking-widest flex-shrink-0">
                                        Más publicaciones
                                    </span>
                                    <div className="flex-1 h-px bg-neutral-200" />
                                </div>
                            )}

                            {/* Grid */}
                            {gridPosts.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gridPosts.map((post) => (
                                        <BlogCard key={post._id} post={post} />
                                    ))}
                                </div>
                            )}

                            {/* Paginación */}
                            {pages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-6">
                                    <button
                                        onClick={() => onPageChange?.(page - 1)}
                                        disabled={page <= 1}
                                        className="h-10 w-10 rounded-xl bg-white border border-neutral-200
                                            flex items-center justify-center text-neutral-500
                                            hover:border-brand-400 hover:text-brand-600
                                            disabled:opacity-30 disabled:cursor-not-allowed
                                            transition-all cursor-pointer shadow-sm"
                                    >
                                        <LuChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                                            const p = i + 1;
                                            return (
                                                <button key={p} onClick={() => onPageChange?.(p)}
                                                    className={`h-10 w-10 rounded-xl text-sm font-mono font-bold
                                                        transition-all cursor-pointer shadow-sm
                                                        ${p === page
                                                            ? 'bg-neutral-900 text-white border border-neutral-900'
                                                            : 'bg-white border border-neutral-200 text-neutral-500 hover:border-brand-400 hover:text-brand-600'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => onPageChange?.(page + 1)}
                                        disabled={page >= pages}
                                        className="h-10 w-10 rounded-xl bg-white border border-neutral-200
                                            flex items-center justify-center text-neutral-500
                                            hover:border-brand-400 hover:text-brand-600
                                            disabled:opacity-30 disabled:cursor-not-allowed
                                            transition-all cursor-pointer shadow-sm"
                                    >
                                        <LuChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
