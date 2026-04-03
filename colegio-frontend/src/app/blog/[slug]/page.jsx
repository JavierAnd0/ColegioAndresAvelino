import MainLayout from '@/components/templates/MainLayout';
import Link from 'next/link';
import {
    LuMailOpen, LuCalendar, LuEye, LuTimer,
    LuChevronLeft, LuTag, LuNewspaper, LuArrowUpRight,
} from 'react-icons/lu';

/* ══════════════════════════════════════
   DATA FETCHING
══════════════════════════════════════ */
async function getPost(slug) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.data;
    } catch { return null; }
}

async function getRecentPosts() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/blog?limit=6`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch { return []; }
}

/* ══════════════════════════════════════
   METADATA
══════════════════════════════════════ */
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);
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
            ...(post.featuredImage?.url && {
                images: [{ url: post.featuredImage.url, alt: post.featuredImage.alt || post.title }],
            }),
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

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const categoryColors = {
    noticias:    { bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400' },
    eventos:     { bg: 'bg-brand-50',   text: 'text-brand-600',   dot: 'bg-brand-500' },
    actividades: { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400' },
    logros:      { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    anuncios:    { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
    general:     { bg: 'bg-neutral-100',text: 'text-neutral-600', dot: 'bg-neutral-400' },
};

const formatDateLong = (d) =>
    new Date(d).toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

const formatDateShort = (d) =>
    new Date(d).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/* ══════════════════════════════════════
   SIDEBAR: card de post reciente
══════════════════════════════════════ */
function SidebarCard({ post }) {
    const colors = categoryColors[post.category] || categoryColors.general;
    return (
        <Link href={`/blog/${post.slug}`} className="flex gap-3.5 py-5 group border-b border-neutral-100 last:border-0">
            {/* Miniatura */}
            <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                {post.featuredImage?.url ? (
                    <img
                        src={post.featuredImage.url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-50">
                        <LuNewspaper className="w-5 h-5 text-brand-200" />
                    </div>
                )}
            </div>

            {/* Texto */}
            <div className="flex flex-col gap-1 min-w-0">
                <span className={`text-[0.58rem] font-mono font-bold uppercase tracking-widest ${colors.text}`}>
                    {capitalize(formatDateShort(post.publishedAt))}
                </span>
                <h4 className="font-display font-semibold text-neutral-800 text-[0.82rem] leading-snug
                    line-clamp-2 group-hover:text-brand-600 transition-colors duration-200">
                    {post.title}
                </h4>
                {post.excerpt && (
                    <p className="text-[0.72rem] text-neutral-400 line-clamp-2 leading-relaxed mt-0.5">
                        {post.excerpt}
                    </p>
                )}
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag}
                                className="px-1.5 py-0.5 rounded text-[0.58rem] font-mono
                                    bg-neutral-100 text-neutral-500 border border-neutral-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

/* ══════════════════════════════════════
   ARTICLE CONTENT
══════════════════════════════════════ */
function ArticleContent({ content }) {
    if (!content) return null;
    const lines = content.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = (key) => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${key}`} className="space-y-2.5 my-6 pl-1">
                    {listItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                            <span className="text-neutral-600 text-[1.0625rem] leading-[1.85]">{item}</span>
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList(i);
            return;
        }

        if (trimmed.startsWith('## ')) {
            flushList(i);
            elements.push(
                <h2 key={i} className="font-display font-bold text-neutral-900 text-2xl md:text-3xl
                    leading-tight mt-10 mb-4 first:mt-0">
                    {trimmed.slice(3)}
                </h2>
            );
            return;
        }
        if (trimmed.startsWith('# ')) {
            flushList(i);
            elements.push(
                <h1 key={i} className="font-display font-bold text-neutral-900 text-3xl md:text-4xl
                    leading-tight mt-10 mb-4 first:mt-0">
                    {trimmed.slice(2)}
                </h1>
            );
            return;
        }
        if (trimmed.startsWith('### ')) {
            flushList(i);
            elements.push(
                <h3 key={i} className="font-display font-semibold text-neutral-900 text-xl
                    leading-tight mt-8 mb-3">
                    {trimmed.slice(4)}
                </h3>
            );
            return;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            listItems.push(trimmed.slice(2));
            return;
        }
        if (trimmed.startsWith('> ')) {
            flushList(i);
            elements.push(
                <blockquote key={i}
                    className="border-l-4 border-brand-500 pl-5 py-1 my-7 italic
                        text-neutral-500 text-lg leading-relaxed">
                    {trimmed.slice(2)}
                </blockquote>
            );
            return;
        }

        flushList(i);
        elements.push(
            <p key={i} className="text-neutral-600 text-[1.0625rem] leading-[1.85] my-4">
                {trimmed}
            </p>
        );
    });

    flushList('end');
    return <div>{elements}</div>;
}

/* ══════════════════════════════════════
   PAGE
══════════════════════════════════════ */
export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const [post, allPosts] = await Promise.all([getPost(slug), getRecentPosts()]);
    const recentPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 5);

    /* 404 */
    if (!post) {
        return (
            <MainLayout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-6">
                    <div className="h-20 w-20 bg-neutral-100 rounded-2xl flex items-center justify-center">
                        <LuMailOpen className="w-10 h-10 text-neutral-300" />
                    </div>
                    <div>
                        <p className="font-display font-bold text-neutral-800 text-xl">Publicación no encontrada</p>
                        <p className="text-neutral-400 text-sm mt-1.5">Esta publicación no existe o fue eliminada.</p>
                    </div>
                    <Link href="/blog"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                            bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
                        <LuChevronLeft className="w-4 h-4" /> Volver al blog
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const colors = categoryColors[post.category] || categoryColors.general;

    return (
        <MainLayout>
            <div className="bg-white min-h-screen">

                {/* ── Breadcrumb ── */}
                <div className="border-b border-neutral-100 bg-neutral-50/70">
                    <div className="max-w-6xl mx-auto px-4 py-3">
                        <nav className="flex items-center gap-2 text-[0.7rem] font-mono text-neutral-400">
                            <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
                            <span className="text-neutral-300">/</span>
                            <Link href="/blog" className="hover:text-neutral-700 transition-colors">Blog</Link>
                            <span className="text-neutral-300">/</span>
                            <span className="text-neutral-600 truncate max-w-[240px]">{post.title}</span>
                        </nav>
                    </div>
                </div>

                {/* ── Layout de dos columnas ── */}
                <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 xl:gap-16 items-start">

                        {/* ════════════════════════════
                            SIDEBAR — posts recientes
                            (aparece abajo en mobile)
                        ════════════════════════════ */}
                        <aside className="order-2 lg:order-1 lg:sticky lg:top-24">
                            <h2 className="font-display font-bold text-neutral-900 text-lg mb-1">
                                Publicaciones recientes
                            </h2>
                            <div className="h-0.5 w-10 bg-gradient-to-r from-brand-500 to-yellow-400 rounded-full mb-5" />

                            {recentPosts.length === 0 ? (
                                <p className="text-sm text-neutral-400 font-mono">No hay publicaciones.</p>
                            ) : (
                                <div>
                                    {recentPosts.map((p) => (
                                        <SidebarCard key={p._id} post={p} />
                                    ))}
                                </div>
                            )}

                            {/* Enlace ver todas */}
                            <Link href="/blog"
                                className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold
                                    text-brand-600 hover:text-brand-700 transition-colors group">
                                Ver todas las publicaciones
                                <LuArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </aside>

                        {/* ════════════════════════════
                            ARTÍCULO
                        ════════════════════════════ */}
                        <article className="order-1 lg:order-2 min-w-0">

                            {/* Cabecera */}
                            <header className="mb-8">
                                {/* Fecha + categoría */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-[0.65rem] font-mono font-bold uppercase tracking-widest ${colors.text}`}>
                                        {capitalize(formatDateLong(post.publishedAt))}
                                    </span>
                                    <span className="text-neutral-200">·</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                        text-[0.6rem] font-mono font-bold uppercase tracking-widest
                                        ${colors.bg} ${colors.text}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                        {post.category}
                                    </span>
                                </div>

                                {/* Título */}
                                <h1 className="font-display font-black text-neutral-900 leading-tight mb-5"
                                    style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
                                    {post.title}
                                </h1>

                                {/* Excerpt */}
                                {post.excerpt && (
                                    <p className="text-neutral-500 text-lg leading-relaxed mb-6">
                                        {post.excerpt}
                                    </p>
                                )}

                                {/* Meta: autor, lectura, vistas */}
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2
                                    pb-7 border-b border-neutral-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center
                                            justify-center text-xs font-black text-brand-700 font-display flex-shrink-0">
                                            {post.author?.name?.[0]?.toUpperCase() || 'D'}
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700">
                                            {post.author?.name || 'Docente'}
                                        </span>
                                    </div>

                                    {post.readingTime && (
                                        <>
                                            <span className="text-neutral-200 hidden sm:block">·</span>
                                            <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                                                <LuTimer className="w-3.5 h-3.5" />
                                                {post.readingTime}
                                            </span>
                                        </>
                                    )}
                                    {post.views !== undefined && (
                                        <>
                                            <span className="text-neutral-200 hidden sm:block">·</span>
                                            <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                                                <LuEye className="w-3.5 h-3.5" />
                                                {post.views} vistas
                                            </span>
                                        </>
                                    )}
                                </div>
                            </header>

                            {/* Imagen destacada */}
                            {post.featuredImage?.url && (
                                <div className="mb-9 rounded-2xl overflow-hidden bg-neutral-100">
                                    <img
                                        src={post.featuredImage.url}
                                        alt={post.featuredImage.alt || post.title}
                                        className="w-full object-cover"
                                        style={{ maxHeight: '460px' }}
                                    />
                                    {post.featuredImage.alt && (
                                        <p className="text-center text-xs text-neutral-400 font-mono py-2.5 px-4">
                                            {post.featuredImage.alt}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Cuerpo */}
                            <ArticleContent content={post.content} />

                            {/* Tags */}
                            {post.tags?.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-neutral-100">
                                    <LuTag className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                                    {post.tags.map((tag) => (
                                        <span key={tag}
                                            className="px-3 py-1 bg-neutral-50 text-neutral-500 text-xs
                                                font-mono rounded-full border border-neutral-200
                                                hover:border-brand-300 hover:text-brand-600
                                                transition-colors cursor-default">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Tarjeta de autor */}
                            <div className="mt-10 p-5 bg-neutral-50 border border-neutral-100 rounded-2xl
                                flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center
                                    justify-center text-2xl font-black text-brand-700 font-display flex-shrink-0">
                                    {post.author?.name?.[0]?.toUpperCase() || 'D'}
                                </div>
                                <div>
                                    <p className="font-display font-semibold text-neutral-900">
                                        {post.author?.name || 'Docente'}
                                    </p>
                                    <p className="text-sm text-neutral-400 mt-0.5">
                                        {capitalize(formatDateLong(post.publishedAt))}
                                    </p>
                                </div>
                            </div>

                            {/* Volver */}
                            <div className="mt-8">
                                <Link href="/blog"
                                    className="inline-flex items-center gap-2 text-sm font-semibold
                                        text-neutral-400 hover:text-brand-600 transition-colors group">
                                    <LuChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    Volver al blog
                                </Link>
                            </div>

                        </article>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
