import Link from 'next/link';
import Paragraph from '@/components/atoms/Typography/Paragraph';

const footerLinks = {
    'Institución': [
        { label: 'Nosotros', href: '/nosotros' },
        { label: 'Cuadro de Honor', href: '/cuadro-honor' },
        { label: 'Calendario', href: '/calendario' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contacto', href: '/contacto' },
    ],
    'Legal': [
        { label: 'Términos', href: '/terminos' },
        { label: 'Privacidad', href: '/privacidad' },
    ],
};

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-neutral-900 text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Info del colegio */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-neutral-900 font-mono font-bold text-sm">C</span>
                            </div>
                            <span className="font-mono font-bold text-lg tracking-tight">Nombre del Colegio</span>
                        </div>
                        <Paragraph size="sm" className="text-neutral-400">
                            Formando líderes del mañana con valores, conocimiento y compromiso social.
                        </Paragraph>
                        <div className="flex flex-col gap-1">
                            <Paragraph size="sm" className="text-neutral-400">
                                📍 Dirección del colegio
                            </Paragraph>
                            <Paragraph size="sm" className="text-neutral-400">
                                📞 Teléfono de contacto
                            </Paragraph>
                            <Paragraph size="sm" className="text-neutral-400">
                                ✉️ correo@colegio.edu.co
                            </Paragraph>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section} className="flex flex-col gap-4">
                            <span className="font-semibold text-neutral-200">{section}</span>
                            <ul className="flex flex-col gap-2">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Copyright */}
                <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Paragraph size="sm" className="text-neutral-500">
                        © {year} Nombre del Colegio. Todos los derechos reservados.
                    </Paragraph>
                    <Paragraph size="sm" className="text-neutral-500">
                        Hecho con ❤️ para nuestra comunidad educativa
                    </Paragraph>
                </div>
            </div>
        </footer>
    );
}