'use client';
import { useState } from 'react';
import BlogCard from '@/components/molecules/BlogCard';
import SearchBar from '@/components/molecules/SearchBar';
import CategoryFilter from '@/components/molecules/CategoryFilter';
import Spinner from '@/components/atoms/Spinner';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import BlogCardSkeleton from '@/components/molecules/BlogCardSkeleton';

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
        <section className="max-w-6xl mx-auto px-4 py-12">

            {/* Header y filtros */}
            {showFilters && (
                <div className="flex flex-col gap-6 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <Heading level="h2">Blog</Heading>
                            <Paragraph color="muted" className="mt-1">
                                {total} {total === 1 ? 'publicación' : 'publicaciones'}
                            </Paragraph>
                        </div>
                        <SearchBar
                            placeholder="Buscar publicaciones..."
                            onSearch={onSearch}
                            className="sm:max-w-xs"
                        />
                    </div>
                    <CategoryFilter
                        categories={blogCategories}
                        activeCategory={activeCategory}
                        onCategoryChange={onCategoryChange}
                    />
                </div>
            )}

            {/* Estado de carga */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <BlogCardSkeleton key={i} variant="vertical" />
                    ))}
                </div>
            )}

            {/* Sin resultados */}
            {!loading && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <span className="text-5xl">📭</span>
                    <Heading level="h4" className="text-neutral-500">
                        No hay publicaciones
                    </Heading>
                    <Paragraph color="muted">
                        No se encontraron publicaciones con los filtros seleccionados.
                    </Paragraph>
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
                        <div className="flex items-center justify-center gap-2 mt-10">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => onPageChange?.(page - 1)}
                            >
                                ← Anterior
                            </Button>
                            <span className="text-sm text-neutral-600 px-3">
                                Página {page} de {pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= pages}
                                onClick={() => onPageChange?.(page + 1)}
                            >
                                Siguiente →
                            </Button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}