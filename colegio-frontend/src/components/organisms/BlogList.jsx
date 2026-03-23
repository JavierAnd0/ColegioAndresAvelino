'use client';
import { useState } from 'react';
import BlogCard from '@/components/molecules/BlogCard';
import SearchBar from '@/components/molecules/SearchBar';
import CategoryFilter from '@/components/molecules/CategoryFilter';
import BlogCardSkeleton from '@/components/molecules/BlogCardSkeleton';
import { LuInbox, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const blogCategories = [
    { value: 'noticias', label: 'Noticias' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'logros', label: 'Logros' },
    { value: 'anuncios', label: 'Anuncios' },
];

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
    return (
        <div>
            {/* ── Hero ── */}
            <section className="relative bg-neutral-950 overflow-hidden py-24">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-900 rounded-full opacity-20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-yellow-900 rounded-full opacity-10 blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-4">
                        Noticias y publicaciones
                    </span>
                    <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-5">
                        Blog <span className="gradient-text">institucional</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl">
                        Mantente al tanto de las últimas noticias, logros y eventos de nuestra comunidad educativa.
                    </p>
                    <p className="text-xs font-mono text-neutral-600 mt-4">
                        {total} {total === 1 ? 'publicación' : 'publicaciones'}
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            {/* ── Filtros y contenido ── */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                {showFilters && (
                    <div className="flex flex-col gap-5 mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CategoryFilter
                                categories={blogCategories}
                                activeCategory={activeCategory}
                                onCategoryChange={onCategoryChange}
                            />
                            <SearchBar
                                placeholder="Buscar publicaciones..."
                                onSearch={onSearch}
                                className="sm:max-w-xs"
                            />
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BlogCardSkeleton key={i} variant="vertical" />
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="h-20 w-20 bg-neutral-100 rounded-2xl flex items-center justify-center">
                            <LuInbox className="w-10 h-10 text-neutral-300" />
                        </div>
                        <div className="text-center">
                            <p className="font-display font-bold text-neutral-700 text-lg">No hay publicaciones</p>
                            <p className="text-neutral-400 text-sm mt-1">
                                No se encontraron publicaciones con los filtros seleccionados.
                            </p>
                        </div>
                    </div>
                )}

                {/* Grid de posts */}
                {!loading && posts.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <BlogCard key={post._id} post={post} />
                            ))}
                        </div>

                        {/* Paginación */}
                        {pages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-12">
                                <button
                                    onClick={() => onPageChange?.(page - 1)}
                                    disabled={page <= 1}
                                    className="h-10 w-10 rounded-xl border border-neutral-200 flex items-center justify-center
                                        text-neutral-500 hover:border-brand-400 hover:text-brand-600
                                        disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    <LuChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                                        const p = i + 1;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => onPageChange?.(p)}
                                                className={`h-10 w-10 rounded-xl text-sm font-mono font-bold transition-all cursor-pointer
                                                    ${p === page
                                                        ? 'bg-brand-600 text-white border border-brand-600'
                                                        : 'border border-neutral-200 text-neutral-500 hover:border-brand-400 hover:text-brand-600'
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
                                    className="h-10 w-10 rounded-xl border border-neutral-200 flex items-center justify-center
                                        text-neutral-500 hover:border-brand-400 hover:text-brand-600
                                        disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    <LuChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
