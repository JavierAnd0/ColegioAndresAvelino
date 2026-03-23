import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import { LuWrench, LuArrowRight, LuHardHat } from 'react-icons/lu';

export default function NotFound() {
    return (
        <MainLayout>
            <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden bg-white">

                {/* Fondo sutil */}
                <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-30 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #dcfce7, transparent 70%)' }} />

                <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg">

                    {/* Icono animado */}
                    <div className="relative">
                        <div className="h-28 w-28 bg-brand-50 border-2 border-brand-100 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-100">
                            <LuHardHat className="w-14 h-14 text-brand-500" />
                        </div>
                        {/* Herramienta orbitando */}
                        <div className="absolute -top-2 -right-2 h-9 w-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-md animate-bounce">
                            <LuWrench className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Texto principal */}
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-mono font-bold text-brand-500 uppercase tracking-widest">
                            En mantenimiento
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
                            Trabajamos para<br />
                            <span className="gradient-text">ti</span>
                        </h1>
                        <p className="text-neutral-500 text-base leading-relaxed mt-1">
                            Esta sección está siendo mejorada para ofrecerte una experiencia aún mejor.
                            Pronto estará disponible.
                        </p>
                    </div>

                    {/* Barra de progreso decorativa */}
                    <div className="w-full max-w-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                            <span>Progreso</span>
                            <span>En curso...</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full animate-shimmer"
                                style={{
                                    width: '65%',
                                    background: 'linear-gradient(90deg, #16a34a, #22c55e, #eab308)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Acción */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold
                            hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 group"
                    >
                        Volver al inicio
                        <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
