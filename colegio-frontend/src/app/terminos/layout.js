export const metadata = {
    title: 'Términos de Uso',
    description:
        'Términos y condiciones de uso del sitio web del Colegio Andrés Avelino. Conoce las normas que rigen el acceso y uso de nuestra plataforma digital.',
    openGraph: {
        title: 'Términos de Uso',
        description: 'Términos y condiciones de uso del sitio web institucional.',
        url: '/terminos',
    },
    alternates: { canonical: '/terminos' },
};

export default function TerminosLayout({ children }) {
    return children;
}
