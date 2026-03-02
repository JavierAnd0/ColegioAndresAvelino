import MainLayout from '@/components/templates/MainLayout';
import Badge from '@/components/atoms/Badge';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Link from 'next/link';

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

export default async function BlogPostPage({ params }) {
    const post = await getPost(params.slug);

    if (!post) {
        return (
            <MainLayout>
                <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                    <span className="text-6xl">📭</span>
                    <Heading level="h3" className="mt-4 text-neutral-500">Post no encontrado</Heading>
                    <Link href="/blog" className="mt-6 inline-block">
                        <Button variant="outline">← Volver al blog</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const formatDate = (date) => new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <MainLayout>
            <article className="max-w-3xl mx-auto px-4 py-12">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
                    <Link href="/" className="hover:text-neutral-900">Inicio</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-neutral-900">Blog</Link>
                    <span>/</span>
                    <span className="text-neutral-900 truncate">{post.title}</span>
                </div>

                {/* Header del post */}
                <header className="flex flex-col gap-4 mb-8">
                    <Badge variant="info">{post.category}</Badge>
                    <Heading level="h1">{post.title}</Heading>
                    <Paragraph size="lg" color="muted">{post.excerpt}</Paragraph>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold">
                                {post.author?.name?.[0]}
                            </div>
                            <Paragraph size="sm" color="muted">{post.author?.name}</Paragraph>
                        </div>
                        <Paragraph size="sm" color="muted">
                            📅 {formatDate(post.publishedAt)}
                        </Paragraph>
                        <Paragraph size="sm" color="muted">
                            👁 {post.views} vistas
                        </Paragraph>
                        <Paragraph size="sm" color="muted">
                            ⏱ {post.readingTime}
                        </Paragraph>
                    </div>
                </header>

                {/* Imagen destacada */}
                {post.featuredImage?.url && (
                    <img
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        className="w-full h-72 object-cover rounded-xl mb-8"
                    />
                )}

                {/* Contenido */}
                <div className="prose prose-neutral max-w-none">
                    {post.content.split('\n').map((paragraph, i) => (
                        paragraph.trim() && (
                            <Paragraph key={i} className="mb-4">{paragraph}</Paragraph>
                        )
                    ))}
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-neutral-100">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
                        ))}
                    </div>
                )}

                {/* Volver */}
                <div className="mt-10 pt-6 border-t border-neutral-100">
                    <Link href="/blog">
                        <Button variant="outline">← Volver al blog</Button>
                    </Link>
                </div>
            </article>
        </MainLayout>
    );
}