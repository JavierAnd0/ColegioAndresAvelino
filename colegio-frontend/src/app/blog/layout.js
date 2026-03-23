export const metadata = {
    title: 'Blog y Noticias',
    description:
        'Últimas noticias, logros, eventos y anuncios de nuestra institución educativa.',
    openGraph: {
        title: 'Blog y Noticias',
        description: 'Noticias, logros y anuncios de la Institución Educativa.',
        url: '/blog',
    },
    alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }) {
    return children;
}
