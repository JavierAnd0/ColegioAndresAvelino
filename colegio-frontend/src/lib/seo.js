const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'Institución Educativa';

// Metadata base para todas las páginas
export const defaultMetadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: `${SITE_NAME} - Formando líderes del futuro`,
        template: `%s | ${SITE_NAME}`,
    },
    description: 'Sitio web oficial de la Institución Educativa. Calendario de eventos, noticias y más.',
    keywords: ['colegio', 'educación', 'institución educativa', 'Colombia'],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        type: 'website',
        locale: 'es_CO',
        url: BASE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} - Formando líderes del futuro`,
        description: 'Sitio web oficial de la Institución Educativa.',
        images: [{
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: SITE_NAME,
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_NAME} - Formando líderes del futuro`,
        description: 'Sitio web oficial de la Institución Educativa.',
        images: ['/og-image.jpg'],
    },
};

// Generar metadata para un post del blog
export const generateBlogMetadata = (post) => ({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    keywords: post.tags || [],
    openGraph: {
        type: 'article',
        title: post.seo?.metaTitle || post.title,
        description: post.seo?.metaDescription || post.excerpt,
        url: `${BASE_URL}/blog/${post.slug}`,
        publishedTime: post.publishedAt,
        authors: [post.author?.name],
        images: post.featuredImage?.url ? [{
            url: post.featuredImage.url,
            width: 1200,
            height: 630,
            alt: post.featuredImage.alt || post.title,
        }] : [{
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: post.title,
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: post.seo?.metaTitle || post.title,
        description: post.seo?.metaDescription || post.excerpt,
        images: post.featuredImage?.url ? [post.featuredImage.url] : ['/og-image.jpg'],
    },
});

// Generar metadata para páginas estáticas
export const generatePageMetadata = ({ title, description, path = '' }) => ({
    title,
    description,
    openGraph: {
        title,
        description,
        url: `${BASE_URL}${path}`,
        images: [{
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: title,
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.jpg'],
    },
});