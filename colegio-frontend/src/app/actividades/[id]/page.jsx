'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/templates/MainLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import { activityService } from '@/services/activityService';

const typeConfig = {
    cuento: { label: 'Cuento', variant: 'info' },
    colorear: { label: 'Colorear', variant: 'warning' },
    numeros: { label: 'Números', variant: 'success' },
    rompecabezas: { label: 'Rompecabezas', variant: 'default' },
    juego: { label: 'Juego', variant: 'danger' },
    lectura: { label: 'Lectura', variant: 'info' },
    otro: { label: 'Otro', variant: 'default' },
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
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                    <Heading level="h2">Actividad no encontrada</Heading>
                    <Paragraph color="muted" className="mt-2">{error}</Paragraph>
                    <button
                        onClick={() => router.push('/actividades')}
                        className="mt-6 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium
                            hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                        Volver a actividades
                    </button>
                </div>
            </MainLayout>
        );
    }

    const config = typeConfig[activity.type] || typeConfig.otro;

    return (
        <MainLayout>
            <article className="py-12">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Navegación */}
                    <button
                        onClick={() => router.push('/actividades')}
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900
                            transition-colors mb-8 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a actividades
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <Badge variant={config.variant}>{config.label}</Badge>
                            {activity.targetGrades?.map((g) => (
                                <Badge key={g} variant="default">{gradeLabels[g] || `${g}°`}</Badge>
                            ))}
                        </div>

                        <Heading level="h1">{activity.title}</Heading>

                        {activity.description && (
                            <Paragraph color="muted" className="mt-3 text-lg">
                                {activity.description}
                            </Paragraph>
                        )}

                        {activity.source && (
                            <p className="text-xs text-neutral-400 mt-3">
                                Fuente: {activity.source}
                            </p>
                        )}
                    </div>

                    {/* Imagen */}
                    {activity.imageUrl && (
                        <div className="rounded-xl overflow-hidden mb-8">
                            <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="w-full h-auto max-h-96 object-cover"
                            />
                        </div>
                    )}

                    {/* Contenido del cuento/lectura */}
                    {activity.content && (
                        <div className="prose prose-neutral max-w-none mb-8">
                            <div className="bg-neutral-50 rounded-xl p-6 sm:p-8 text-neutral-700 leading-relaxed whitespace-pre-wrap text-[0.95rem]">
                                {activity.content}
                            </div>
                        </div>
                    )}

                    {/* PDF embed */}
                    {activity.fileUrl && (
                        <div className="mb-8">
                            <div className="bg-neutral-50 rounded-xl p-6 text-center">
                                <svg className="h-12 w-12 text-neutral-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <p className="text-sm text-neutral-600 mb-4">Archivo PDF disponible</p>
                                <a
                                    href={activity.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium
                                        hover:bg-neutral-800 transition-colors"
                                >
                                    Abrir PDF
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Link a fuente original */}
                    {activity.externalUrl && (
                        <div className="border-t border-neutral-100 pt-6">
                            <a
                                href={activity.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                Ver fuente original
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>
            </article>
        </MainLayout>
    );
}
