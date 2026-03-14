'use client';
import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Spinner from '@/components/atoms/Spinner';
import ActivityCard from '@/components/molecules/ActivityCard';
import { activityService } from '@/services/activityService';
import { gradeService } from '@/services/honorService';

const typeLabels = {
    cuento: 'Cuento',
    colorear: 'Colorear',
    numeros: 'Números',
    rompecabezas: 'Rompecabezas',
    juego: 'Juego',
    lectura: 'Lectura',
    otro: 'Otro',
};

export default function ActividadesPage() {
    const [activities, setActivities] = useState([]);
    const [grades, setGrades] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [gradesRes, typesRes] = await Promise.all([
                    gradeService.getAll(),
                    activityService.getTypes(),
                ]);
                setGrades((gradesRes.data || []).sort((a, b) => a.order - b.order));
                setTypes(typesRes.data || []);
            } catch {
                // silenciar
            }
        };
        loadFilters();
    }, []);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (selectedGrade !== '') params.grade = selectedGrade;
            if (selectedType) params.type = selectedType;
            if (search.trim()) params.search = search.trim();

            const res = await activityService.getAll(params);
            setActivities(res.data || []);
            setTotalPages(res.pages || 1);
        } catch {
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, [selectedGrade, selectedType, search, page]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleGradeChange = (e) => {
        setSelectedGrade(e.target.value);
        setPage(1);
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <MainLayout>
            <section className="py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <Heading level="h1">Actividades Educativas</Heading>
                        <Paragraph color="muted" className="mt-2">
                            Recursos y actividades para aprender de forma divertida
                        </Paragraph>
                    </div>

                    {/* Filtros — dropdowns + búsqueda */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <select
                            value={selectedGrade}
                            onChange={handleGradeChange}
                            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 bg-white
                                focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400
                                cursor-pointer min-w-[160px]"
                        >
                            <option value="">Grado</option>
                            {grades.map((g) => (
                                <option key={g._id} value={g.order}>
                                    {g.order === 0 ? 'Preescolar' : `${g.order}°`}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedType}
                            onChange={handleTypeChange}
                            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 bg-white
                                focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400
                                cursor-pointer min-w-[160px]"
                        >
                            <option value="">Tipo de actividad</option>
                            {types.map((t) => (
                                <option key={t} value={t}>
                                    {typeLabels[t] || t}
                                </option>
                            ))}
                        </select>

                        <div className="relative sm:flex-1 sm:max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Buscar actividad..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400
                                    placeholder:text-neutral-400"
                            />
                        </div>
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Spinner size="lg" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <Heading level="h3">No hay actividades disponibles</Heading>
                            <Paragraph color="muted" className="mt-2">
                                Aún no se han cargado actividades. Vuelve pronto.
                            </Paragraph>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activities.map((activity) => (
                                    <ActivityCard key={activity._id} activity={activity} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium
                                            hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-neutral-500 font-mono">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium
                                            hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </MainLayout>
    );
}
