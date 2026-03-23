'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/templates/MainLayout';
import Badge from '@/components/atoms/Badge';
import Spinner from '@/components/atoms/Spinner';
import { activityService } from '@/services/activityService';
import { LuChevronLeft, LuFileText, LuExternalLink, LuBookOpen } from 'react-icons/lu';

const typeConfig = {
    cuento:       { label: 'Cuento',        variant: 'info' },
    colorear:     { label: 'Colorear',      variant: 'warning' },
    numeros:      { label: 'Números',       variant: 'success' },
    rompecabezas: { label: 'Rompecabezas', variant: 'default' },
    juego:        { label: 'Juego',         variant: 'danger' },
    lectura:      { label: 'Lectura',       variant: 'info' },
    otro:         { label: 'Otro',          variant: 'default' },
};

const gradeLabels = {
    0: 'Preescolar', 1: '1°', 2: '2°', 3: '3°', 4: '4°', 5: '5°',
};

export default function ActivityDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await activityService.getById(id);
                setActivity(res.data);
            } catch {
                setError('No se encontró la actividad');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center py-24">
                    <Spinner size="lg" />
                </div>
            </MainLayout>
        );
    }

    if (error || !activity) {
        return (
            <MainLayout>
                <div className="max-w-3xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-5">
                    <div className="h-20 w-20 bg-neutral-100 rounded-2xl flex items-center justify-center">
                        <LuBookOpen className="w-10 h-10 text-neutral-300" />
                    </div>
                    <div>
                        <p className="font-display font-bold text-neutral-700 text-xl">Actividad no encontrada</p>
                        <p className="text-neutral-400 text-sm mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => router.push('/actividades')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold
                            hover:bg-brand-700 transition-colors cursor-pointer"
                    >
                        <LuChevronLeft className="w-4 h-4" /> Volver a actividades
                    </button>
                </div>
            </MainLayout>
        );
    }

    const config = typeConfig[activity.type] || typeConfig.otro;

    return (
        <MainLayout>
            <article>

                {/* ── Hero ── */}
                <section className="relative bg-neutral-950 overflow-hidden pt-16 pb-24">
                    <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-900 opacity-20 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-3xl mx-auto px-4 relative z-10">
                        {/* Volver */}
                        <button
                            onClick={() => router.push('/actividades')}
                            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-neutral-300
                                transition-colors mb-8 cursor-pointer group"
                        >
                            <LuChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Actividades educativas
                        </button>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-5">
                            <Badge variant={config.variant}>{config.label}</Badge>
                            {activity.targetGrades?.map((g) => (
                                <Badge key={g} variant="default">{gradeLabels[g] || `${g}°`}</Badge>
                            ))}
                        </div>

                        {/* Título */}
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                            {activity.title}
                        </h1>

                        {activity.description && (
                            <p className="text-neutral-400 text-lg leading-relaxed">{activity.description}</p>
                        )}

                        {activity.source && (
                            <p className="text-xs font-mono text-neutral-600 mt-4">Fuente: {activity.source}</p>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                            <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                        </svg>
                    </div>
                </section>

                {/* ── Imagen ── */}
                {activity.imageUrl && (
                    <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 mb-10">
                        <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            className="w-full h-auto max-h-96 object-cover rounded-2xl shadow-xl"
                        />
                    </div>
                )}

                {/* ── Contenido ── */}
                <div className="max-w-3xl mx-auto px-4 py-4 pb-16">

                    {/* Texto del cuento/lectura */}
                    {activity.content && (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-7 sm:p-9 mb-8">
                            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-neutral-200">
                                <LuBookOpen className="w-5 h-5 text-brand-600" />
                                <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest">Contenido</span>
                            </div>
                            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-[0.95rem]">
                                {activity.content}
                            </p>
                        </div>
                    )}

                    {/* PDF embed */}
                    {activity.fileUrl && (
                        <div className="mb-8">
                            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col items-center gap-5">
                                <div className="h-16 w-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center">
                                    <LuFileText className="h-8 w-8 text-red-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-display font-bold text-neutral-900">Archivo PDF disponible</p>
                                    <p className="text-sm text-neutral-500 mt-1">Haz clic para abrir el documento en una nueva pestaña.</p>
                                </div>
                                <a
                                    href={activity.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold
                                        hover:bg-brand-700 transition-colors"
                                >
                                    <LuFileText className="h-4 w-4" />
                                    Abrir PDF
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Link externo */}
                    {activity.externalUrl && (
                        <div className="border-t border-neutral-100 pt-6">
                            <a
                                href={activity.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600
                                    hover:text-brand-700 transition-colors group"
                            >
                                Ver fuente original
                                <LuExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        </div>
                    )}

                    {/* Volver */}
                    <div className="mt-10 pt-8 border-t border-neutral-100">
                        <button
                            onClick={() => router.push('/actividades')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200
                                text-sm font-semibold text-neutral-600 hover:border-brand-400 hover:text-brand-600
                                transition-all duration-200 cursor-pointer group"
                        >
                            <LuChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Volver a actividades
                        </button>
                    </div>
                </div>

            </article>
        </MainLayout>
    );
}
