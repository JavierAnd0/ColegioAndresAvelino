export const metadata = {
    title: 'Contacto',
    description:
        'Comunícate con nosotros. Envía tus preguntas, solicitudes o comentarios y nuestro equipo te responderá a la brevedad.',
    openGraph: {
        title: 'Contacto',
        description: 'Contáctanos en Rivera, Huila. Teléfono, correo y formulario de contacto.',
        url: '/contacto',
    },
    alternates: { canonical: '/contacto' },
};

export default function ContactoLayout({ children }) {
    return children;
}
