import MainLayout from '@/components/templates/MainLayout';
import Link from 'next/link';
import { LuMailOpen, LuCalendar, LuEye, LuTimer, LuChevronLeft, LuTag } from 'react-icons/lu';

export async function generateMetadata({ params }) {
    const post = await getPost(params.slug);
    if (!post) return { title: 'Post no encontrado' };
    return {
        title: post.seo?.metaTitle || post.title,
        description: post.seo?.metaDescription || post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `/blog/${post.slug}`,
            type: 'article',
            publishedTime: post.publishedAt,
            ...(post.featuredImage?.url && { images: [{ url: post.featuredImage.url, alt: post.featuredImage.alt || post.title }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            ...(post.featuredImage?.url && { images: [post.featuredImage.url] }),
        },
        alternates: { canonical: `/blog/${post.slug}` },
    };
}

async function getPost(slug) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch {
        return null;
    }
}

const categoryColors = {
    noticias:    'bg-blue-50 text-blue-700 border-blue-200',
    eventos:     'bg-brand-50 text-brand-700 border-brand-200',
    actividades: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    logros:      'bg-brand-50 text-brand-700 border-brand-200',
    anuncios:    'bg-red-50 text-red-700 border-red-200',
    general:     'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const formatDate = (date) => new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
});

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center gap-6">
                    <div className="h-20 w-20 bg-neutral-100 rounded-2xl flex items-center justify-center">
                        <LuMailOpen className="w-10 h-10 text-neutral-300" />
                    </div>
                    <div>
                        <p className="font-display font-bold text-neutral-700 text-xl">Post no encontrado</p>
                        <p className="text-neutral-400 text-sm mt-1">Esta publicación no existe o fue eliminada.</p>
                    </div>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold
                            hover:bg-brand-700 transition-colors"
                    >
                        <LuChevronLeft className="w-4 h-4" /> Volver al blog
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const catColor = categoryColors[post.category] || categoryColors.general;

    return (
        <MainLayout>
            <article>

                {/* ── Hero del post ── */}
                <section className="relative bg-neutral-950 overflow-hidden pt-16 pb-24">
                    <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-900 opacity-25 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-3xl mx-auto px-4 relative z-10">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-mono">
                            <Link href="/" className="hover:text-neutral-300 transition-colors">Inicio</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-neutral-300 transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-neutral-400 truncate max-w-[200px]">{post.title}</span>
                        </div>

                        {/* Categoría */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-mono font-bold uppercase tracking-widest border mb-6 ${catColor}`}>
                            {post.category}
                        </span>

                        {/* Título */}
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-neutral-400 text-lg leading-relaxed mb-8">{post.excerpt}</p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-5 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white font-display">
                                    {post.author?.name?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <span className="text-sm text-neutral-300">{post.author?.name || 'Autor'}</span>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                                <LuCalendar className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}
                            </span>
                            {post.views !== undefined && (
                                <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                                    <LuEye className="w-3.5 h-3.5" /> {post.views} vistas
                                </span>
                            )}
                            {post.readingTime && (
                                <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                                    <LuTimer className="w-3.5 h-3.5" /> {post.readingTime}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                            <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                        </svg>
                    </div>
                </section>

                {/* ── Imagen destacada ── */}
                {post.featuredImage?.url && (
                    <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 mb-10">
                        <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt || post.title}
                            className="w-full h-72 object-cover rounded-2xl shadow-xl"
                        />
                    </div>
                )}

                {/* ── Contenido ── */}
                <div className="max-w-3xl mx-auto px-4 py-4 pb-16">
                    <div className="prose max-w-none">
                        {post.content.split('\n').map((paragraph, i) => (
                            paragraph.trim() && (
                                <p
                                    key={i}
                                    className="text-neutral-600 leading-relaxed mb-5 text-base"
                                >
                                    {paragraph}
                                </p>
                            )
                        ))}
                    </div>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-neutral-100">
                            <LuTag className="w-4 h-4 text-neutral-400 mt-0.5" />
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-mono font-medium rounded-full border border-neutral-200"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Volver */}
                    <div className="mt-10 pt-8 border-t border-neutral-100">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200
                                text-sm font-semibold text-neutral-600 hover:border-brand-400 hover:text-brand-600
                                transition-all duration-200 group"
                        >
                            <LuChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Volver al blog
                        </Link>
                    </div>
                </div>

            </article>
        </MainLayout>
    );
}
