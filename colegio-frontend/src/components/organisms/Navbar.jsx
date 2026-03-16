'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/atoms/Button';


const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Actividades', href: '/actividades' },
    { label: 'Cuadro de Honor', href: '/cuadro-honor' },
    { label: 'Calendario', href: '/calendario' },
    { label: 'Blog', href: '/blog' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Contacto', href: '/contacto' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-8 w-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 text-lg hidden sm:block tracking-tight">
                        Colegio
                    </span>
                </Link>

                {/* Links - Desktop */}
                <ul className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${pathname === link.href
                                        ? 'bg-neutral-900 text-white'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                    }
                `}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Botón Admin - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/admin">
                        <Button variant="outline" size="sm">
                            Admin
                        </Button>
                    </Link>
                </div>

                {/* Botón hamburguesa - Mobile */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                    <div className="flex flex-col gap-1.5 w-5">
                        <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                        <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </button>
            </nav>

            {/* Menú Mobile */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-neutral-100 px-4 py-3 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`
                px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${pathname === link.href
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                }
              `}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-neutral-100 mt-1">
                        <Link href="/admin" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full">
                                Admin
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}