import Link from 'next/link';
import { LuMapPin, LuPhone, LuMail, LuHeart } from 'react-icons/lu';

const footerLinks = {
    'Institución': [
        { label: 'Nosotros',        href: '/nosotros' },
        { label: 'Cuadro de Honor', href: '/cuadro-honor' },
        { label: 'Calendario',      href: '/calendario' },
        { label: 'Blog',            href: '/blog' },
        { label: 'Contacto',        href: '/contacto' },
    ],
    'Legal': [
        { label: 'Términos',    href: '/terminos' },
        { label: 'Privacidad',  href: '/privacidad' },
    ],
};

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-neutral-900 text-white relative overflow-hidden">
            {/* Franja superior degradada */}
            <div className="h-1 bg-gradient-to-r from-brand-600 via-yellow-400 to-brand-600" />

            {/* Patrón decorativo */}
            <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 py-14 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Info del colegio */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="font-display text-white font-bold">C</span>
                            </div>
                            <span className="font-display font-bold text-lg tracking-tight">Nombre del Colegio</span>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
                            Formando líderes del mañana con valores, conocimiento y compromiso social.
                        </p>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-neutral-400 flex items-center gap-2">
                                <LuMapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
                                Dirección del colegio
                            </span>
                            <span className="text-sm text-neutral-400 flex items-center gap-2">
                                <LuPhone className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
                                Teléfono de contacto
                            </span>
                            <span className="text-sm text-neutral-400 flex items-center gap-2">
                                <LuMail className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
                                correo@colegio.edu.co
                            </span>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section} className="flex flex-col gap-4">
                            <span className="font-mono text-xs font-bold text-brand-400 uppercase tracking-widest">{section}</span>
                            <ul className="flex flex-col gap-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-neutral-400 hover:text-brand-400 transition-colors duration-200 flex items-center gap-1.5 group"
                                        >
                                            <span className="h-px w-3 bg-neutral-700 group-hover:bg-brand-500 group-hover:w-5 transition-all duration-200 rounded-full" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Copyright */}
                <div className="border-t border-neutral-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-neutral-500">
                        © {year} Nombre del Colegio. Todos los derechos reservados.
                    </p>
                    <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                        Hecho con <LuHeart className="w-3.5 h-3.5 text-brand-500 animate-pulse" /> para nuestra comunidad educativa
                    </p>
                </div>
            </div>
        </footer>
    );
}
