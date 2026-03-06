'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';

const sidebarLinks = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Cuadro de Honor', href: '/admin/cuadro-honor', icon: '🏆' },
    { label: 'Grados', href: '/admin/grados', icon: '🎓' },
    { label: 'Eventos', href: '/admin/eventos', icon: '📅' },
    { label: 'Blog', href: '/admin/blog', icon: '📝' },
    { label: 'Ver sitio', href: '/', icon: '🌐' },
];

export default function AdminLayout({ children }) {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [loading, isAuthenticated]);

    // Mostrar spinner mientras verifica auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    // No renderizar nada si no está autenticado
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen flex bg-neutral-50">

            {/* Sidebar */}
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
                    {sidebarLinks.map((link) => (
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
                            <span>{link.icon}</span>
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
                                <p className="text-xs text-neutral-500 truncate">{user.role}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </div>
                )}
            </aside>

            <div className="flex-1 md:ml-60">
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}