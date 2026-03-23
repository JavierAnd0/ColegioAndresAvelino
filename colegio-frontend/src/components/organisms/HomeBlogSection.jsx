'use client';

import { useState, useEffect } from 'react';
import { blogService } from '@/services/blogService';
import Link from 'next/link';
import ScrollReveal from '@/components/atoms/ScrollReveal';
import { LuNewspaper, LuCalendar, LuArrowRight } from 'react-icons/lu';

const categoryColors = {
    noticias:    { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400' },
    eventos:     { bg: 'bg-brand-100',   text: 'text-brand-700',  dot: 'bg-brand-500' },
    actividades: { bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-400' },
    logros:      { bg: 'bg-brand-100',   text: 'text-brand-700',  dot: 'bg-brand-500' },
    anuncios:    { bg: 'bg-amber-100',   text: 'text-amber-800',  dot: 'bg-amber-500' },
    general:     { bg: 'bg-neutral-100', text: 'text-neutral-600',dot: 'bg-neutral-400' },
};

const formatDate = (date) =>
    new Date(date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });

function CategoryPill({ category }) {
    const colors = categoryColors[category] || categoryColors.general;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-mono font-bold uppercase tracking-widest ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
            {category}
        </span>
    );
}

/* ── Card principal (arriba izquierda, más ancho) ── */
function FeaturedCard({ post }) {
    if (!post) return null;
    return (
        <Link href={`/blog/${post.slug}`} className="block group h-full">
            <article className="h-full bg-white rounded-3xl border border-neutral-100
                hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50/60
                transition-all duration-300 overflow-hidden flex flex-col">
                <div className="w-full h-52 bg-brand-50 overflow-hidden flex-shrink-0">
                    {post.featuredImage?.url ? (
                        <img src={post.featuredImage.url} alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <LuNewspaper className="w-12 h-12 text-brand-200" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col flex-1 p-6 gap-3">
                    <CategoryPill category={post.category} />
                    <h3 className="font-display text-xl font-bold text-neutral-900 leading-snug line-clamp-3
                        group-hover:text-brand-700 transition-colors flex-1">
                        {post.title}
                    </h3>
                    {post.excerpt && (
                        <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">
                            {post.excerpt}
                        </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                            <LuCalendar className="w-3.5 h-3.5" />
                            {formatDate(post.publishedAt)}
                        </span>
                        <span className="text-xs font-semibold text-brand-600 flex items-center gap-1
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Leer más <LuArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

/* ── Card secundario (los otros tres) ── */
function RegularCard({ post }) {
    if (!post) return null;
    return (
        <Link href={`/blog/${post.slug}`} className="block group h-full">
            <article className="h-full bg-white rounded-2xl border border-neutral-100
                hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50/50
                transition-all duration-300 overflow-hidden flex flex-col">
                <div className="w-full h-40 bg-brand-50 overflow-hidden flex-shrink-0">
                    {post.featuredImage?.url ? (
                        <img src={post.featuredImage.url} alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <LuNewspaper className="w-8 h-8 text-brand-200" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col flex-1 p-4 gap-2">
                    <CategoryPill category={post.category} />
                    <h4 className="font-display text-sm font-bold text-neutral-900 leading-snug line-clamp-2
                        group-hover:text-brand-700 transition-colors">
                        {post.title}
                    </h4>
                    {post.excerpt && (
                        <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 flex-1">
                            {post.excerpt}
                        </p>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono pt-2 border-t border-neutral-100">
                        <LuCalendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                    </span>
                </div>
            </article>
        </Link>
    );
}

/* ── Skeletons ── */
function FeaturedSkeleton() {
    return (
        <div className="rounded-3xl overflow-hidden border border-neutral-100 bg-white animate-pulse">
            <div className="h-52 bg-neutral-100" />
            <div className="p-6 flex flex-col gap-3">
                <div className="h-5 w-20 bg-neutral-100 rounded-full" />
                <div className="h-6 bg-neutral-100 rounded-full w-3/4" />
                <div className="h-4 bg-neutral-100 rounded-full w-full" />
                <div className="h-4 bg-neutral-100 rounded-full w-2/3" />
            </div>
        </div>
    );
}
function RegularSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-white animate-pulse">
            <div className="h-40 bg-neutral-100" />
            <div className="p-4 flex flex-col gap-2">
                <div className="h-4 w-16 bg-neutral-100 rounded-full" />
                <div className="h-4 bg-neutral-100 rounded-full w-full" />
                <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
            </div>
        </div>
    );
}

export default function HomeBlogSection() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const recentData = await blogService.getAll({ limit: 4 });
                setPosts(recentData.data || []);
            } catch {
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-50 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <ScrollReveal direction="left">
                        <span className="block text-xs font-mono font-bold text-brand-600 uppercase tracking-widest mb-2">
                            Noticias
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                            Últimas <span className="gradient-text">Noticias</span>
                        </h2>
                        <div className="h-1 w-16 bg-gradient-to-r from-brand-500 to-yellow-400 rounded-full mt-4" />
                    </ScrollReveal>
                    <ScrollReveal direction="right" className="hidden sm:block">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200
                                text-sm font-semibold text-neutral-600 hover:border-brand-400 hover:text-brand-600
                                transition-all duration-200 group"
                        >
                            Ver todas
                            <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </ScrollReveal>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-span-12 sm:col-span-7"><FeaturedSkeleton /></div>
                            <div className="col-span-12 sm:col-span-5"><RegularSkeleton /></div>
                        </div>
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-span-12 sm:col-span-6"><RegularSkeleton /></div>
                            <div className="col-span-12 sm:col-span-6"><RegularSkeleton /></div>
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16">
                        <LuNewspaper className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                        <p className="text-neutral-400">No hay publicaciones disponibles por el momento.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">

                        {/* Fila superior: featured (7/12) + regular (5/12) */}
                        <div className="grid grid-cols-12 gap-5 items-stretch">
                            <ScrollReveal direction="up" className="col-span-12 sm:col-span-7">
                                <FeaturedCard post={posts[0]} />
                            </ScrollReveal>
                            <ScrollReveal direction="up" delay={100} className="col-span-12 sm:col-span-5">
                                <RegularCard post={posts[1]} />
                            </ScrollReveal>
                        </div>

                        {/* Fila inferior: dos iguales (6/12 cada uno) */}
                        {posts.length > 2 && (
                            <div className="grid grid-cols-12 gap-5">
                                <ScrollReveal direction="up" delay={150} className="col-span-12 sm:col-span-6">
                                    <RegularCard post={posts[2]} />
                                </ScrollReveal>
                                {posts[3] && (
                                    <ScrollReveal direction="up" delay={200} className="col-span-12 sm:col-span-6">
                                        <RegularCard post={posts[3]} />
                                    </ScrollReveal>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Móvil: ver todas */}
                <div className="sm:hidden mt-8 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600"
                    >
                        Ver todas las noticias <LuArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
