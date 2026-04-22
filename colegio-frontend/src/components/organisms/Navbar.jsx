'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/atoms/Button';
import { LuGraduationCap } from 'react-icons/lu';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
    { label: 'Inicio',      href: '/' },
    { label: 'Actividades', href: '/actividades' },
    { label: 'Blog',        href: '/blog' },
    { label: 'Nosotros',    href: '/nosotros' },
    { label: 'Contacto',    href: '/contacto' },
];

function LockIcon({ open }) {
    return open ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0m0 0v1M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
        </svg>
    ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );
}

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleHomeClick = (e) => {
        if (pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
            ${scrolled
                ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-brand-100/60'
                : 'bg-white/80 backdrop-blur-sm border-b border-neutral-100'
            }`}
        >
            <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" onClick={handleHomeClick} className="flex items-center flex-shrink-0 group">
                    <img 
                        src="/logo.png" 
                        alt="Logo Institución Educativa Misael Pastrana Borrero" 
                        className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 origin-left"
                    />
                </Link>

                {/* Links Desktop */}
                <ul className="hidden md:flex items-center gap-0.5">
                    {navLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={link.href === '/' ? handleHomeClick : undefined}
                                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${active
                                            ? 'text-brand-700 bg-brand-50'
                                            : 'text-neutral-500 hover:text-brand-700 hover:bg-brand-50'
                                        }`}
                                >
                                    {link.label}
                                    {active && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-brand-500 rounded-full" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Admin - Desktop */}
                <div className="hidden md:flex items-center">
                    <Link href="/admin" title={isAuthenticated ? 'Panel admin (sesión activa)' : 'Acceder al panel admin'}>
                        <button className={`p-2 rounded-lg transition-colors cursor-pointer
                            ${isAuthenticated
                                ? 'text-brand-600 hover:bg-brand-50'
                                : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                            }`}>
                            <LockIcon open={isAuthenticated} />
                        </button>
                    </Link>
                </div>

                {/* Hamburguesa */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    aria-label="Abrir menú"
                >
                    <div className="flex flex-col gap-1.5 w-5">
                        <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
                        <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </button>
            </nav>

            {/* Menú Mobile */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border-t border-brand-50 px-4 py-3 flex flex-col gap-1">
                    {navLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => {
                                    if (link.href === '/') handleHomeClick(e);
                                    else setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${active
                                        ? 'bg-brand-600 text-white shadow-sm'
                                        : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-700'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <div className="pt-2 border-t border-neutral-100 mt-1">
                        <Link href="/admin" onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                ${isAuthenticated
                                    ? 'text-brand-600 hover:bg-brand-50'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                                }`}>
                            <LockIcon open={isAuthenticated} />
                            {isAuthenticated ? 'Panel admin' : 'Acceder al admin'}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
