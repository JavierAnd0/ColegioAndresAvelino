'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import {
    LuLayoutDashboard, LuTrophy, LuGraduationCap, LuCalendar,
    LuBookOpen, LuFileText, LuUsers, LuGlobe, LuImages,
    LuCircleUser, LuLogOut, LuChevronUp,
} from 'react-icons/lu';

const sidebarLinks = [
    { label: 'Dashboard',       href: '/admin',              Icon: LuLayoutDashboard },
    { label: 'Carousel',        href: '/admin/carousel',     Icon: LuImages },
    { label: 'Cuadro de Honor', href: '/admin/cuadro-honor', Icon: LuTrophy },
    { label: 'Grados',          href: '/admin/grados',       Icon: LuGraduationCap },
    { label: 'Eventos',         href: '/admin/eventos',      Icon: LuCalendar },
    { label: 'Blog',            href: '/admin/blog',         Icon: LuFileText },
    { label: 'Actividades',     href: '/admin/actividades',  Icon: LuBookOpen },
    { label: 'Docentes',        href: '/admin/docentes',     Icon: LuUsers, superadminOnly: true },
    { label: 'Ver sitio',       href: '/',                   Icon: LuGlobe },
];

const ROLE_LABELS = {
    superadmin: { label: 'Super Admin', className: 'bg-violet-100 text-violet-700' },
    admin:      { label: 'Docente',     className: 'bg-neutral-200 text-neutral-600' },
};

export default function AdminLayout({ children }) {
    const { user, loading, isAuthenticated, isSuperAdmin, logout } = useAuth();
    const router   = useRouter();
    const pathname = usePathname();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen,   setUserMenuOpen]   = useState(false);

    const desktopUserRef = useRef(null);
    const mobileUserRef  = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/admin/login');
    }, [loading, isAuthenticated]);

    // Close all menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    // Close user dropdown on outside click
    useEffect(() => {
        if (!userMenuOpen) return;
        const handleOutside = (e) => {
            const inDesktop = desktopUserRef.current?.contains(e.target);
            const inMobile  = mobileUserRef.current?.contains(e.target);
            if (!inDesktop && !inMobile) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [userMenuOpen]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const visibleLinks = sidebarLinks.filter(l => !l.superadminOnly || isSuperAdmin);
    const roleStyle = ROLE_LABELS[user?.role] || { label: user?.role, className: 'bg-neutral-100 text-neutral-500' };
    const initial   = user?.name?.[0]?.toUpperCase() ?? '?';

    /** Dropdown menu shown above the user section */
    const UserDropdown = () => (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-30">
            <Link
                href="/admin/perfil"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
                <LuCircleUser className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                Mi Perfil
            </Link>
            <div className="border-t border-neutral-100" />
            <button
                type="button"
                onClick={() => { setUserMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
                <LuLogOut className="w-4 h-4 flex-shrink-0" />
                Cerrar sesión
            </button>
        </div>
    );

    /** Trigger button for the user dropdown */
    const UserTrigger = () => (
        <button
            type="button"
            onClick={() => setUserMenuOpen(p => !p)}
            className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 flex-shrink-0">
                {initial}
            </div>
            <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${roleStyle.className}`}>
                    {roleStyle.label}
                </span>
            </div>
            <LuChevronUp
                className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${userMenuOpen ? '' : 'rotate-180'}`}
            />
        </button>
    );

    return (
        <div className="min-h-screen flex bg-neutral-50">

            {/* ── Mobile top header ── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 h-14 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain rounded" />
                    <span className="font-bold text-neutral-900 text-sm">Admin</span>
                </Link>

                <button
                    onClick={() => setMobileMenuOpen(p => !p)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
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

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/30"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* ── Mobile slide-out ── */}
            <div className={`
                md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-white border-r border-neutral-200
                flex flex-col transform transition-transform duration-200 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    {visibleLinks.map((link) => (
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
                    <div ref={mobileUserRef} className="p-3 border-t border-neutral-100 relative">
                        {userMenuOpen && <UserDropdown />}
                        <UserTrigger />
                    </div>
                )}
            </div>

            {/* ── Desktop sidebar ── */}
            <aside className="hidden md:flex flex-col w-60 bg-white border-r border-neutral-200 fixed h-full">
                <div className="h-16 flex items-center px-5 border-b border-neutral-100 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain rounded" />
                        <span className="font-bold text-neutral-900">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    {visibleLinks.map((link) => (
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
                    <div ref={desktopUserRef} className="p-3 border-t border-neutral-100 relative flex-shrink-0">
                        {userMenuOpen && <UserDropdown />}
                        <UserTrigger />
                    </div>
                )}
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 md:ml-60 min-w-0 overflow-x-hidden">
                <main className="p-4 pt-18 md:p-6 md:pt-6">{children}</main>
            </div>
        </div>
    );
}
