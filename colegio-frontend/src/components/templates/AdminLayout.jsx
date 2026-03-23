'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import { LuLayoutDashboard, LuTrophy, LuGraduationCap, LuCalendar, LuBookOpen, LuFileText, LuUsers, LuGlobe, LuImages } from 'react-icons/lu';

const sidebarLinks = [
    { label: 'Dashboard',       href: '/admin',              Icon: LuLayoutDashboard },
    { label: 'Carousel',        href: '/admin/carousel',     Icon: LuImages },
    { label: 'Cuadro de Honor', href: '/admin/cuadro-honor', Icon: LuTrophy },
    { label: 'Grados',          href: '/admin/grados',       Icon: LuGraduationCap },
    { label: 'Eventos',         href: '/admin/eventos',      Icon: LuCalendar },
    { label: 'Blog',            href: '/admin/blog',         Icon: LuFileText },
    { label: 'Actividades',     href: '/admin/actividades',  Icon: LuBookOpen },
    { label: 'Docentes',        href: '/admin/docentes',     Icon: LuUsers },
    { label: 'Ver sitio',       href: '/',                   Icon: LuGlobe },
];

const ROLE_LABELS = {
    superadmin: { label: 'Super Admin', className: 'bg-violet-100 text-violet-700' },
    admin:      { label: 'Docente',     className: 'bg-neutral-200 text-neutral-600' },
};

export default function AdminLayout({ children }) {
    const { user, loading, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();

    const allLinks = sidebarLinks;
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [loading, isAuthenticated]);

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen flex bg-neutral-50">

            {/* Mobile header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 h-14 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="font-bold text-neutral-900 text-sm">Admin</span>
                </Link>

                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                    {mobileMenuOpen ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </header>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/30"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile slide-out menu */}
            <div className={`
                md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-white border-r border-neutral-200
                transform transition-transform duration-200 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {allLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                                transition-all duration-200
                                ${pathname === link.href
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                }
                            `}
                        >
                            <link.Icon className="w-[18px] h-[18px] flex-shrink-0" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {user && (
                    <div className="p-4 border-t border-neutral-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${ROLE_LABELS[user.role]?.className || 'bg-neutral-100 text-neutral-500'}`}>
                                    {ROLE_LABELS[user.role]?.label || user.role}
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </div>
                )}
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-60 bg-white border-r border-neutral-200 fixed h-full">
                <div className="h-16 flex items-center px-5 border-b border-neutral-100">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">C</span>
                        </div>
                        <span className="font-bold text-neutral-900">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {allLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${pathname === link.href
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                }
              `}
                        >
                            <link.Icon className="w-[18px] h-[18px] flex-shrink-0" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {user && (
                    <div className="p-4 border-t border-neutral-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${ROLE_LABELS[user.role]?.className || 'bg-neutral-100 text-neutral-500'}`}>
                                    {ROLE_LABELS[user.role]?.label || user.role}
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </div>
                )}
            </aside>

            {/* Main content */}
            <div className="flex-1 md:ml-60 min-w-0 overflow-x-hidden">
                <main className="p-4 pt-18 md:p-6 md:pt-6">{children}</main>
            </div>
        </div>
    );
}
