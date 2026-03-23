'use client';
import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import ActivityCard from '@/components/molecules/ActivityCard';
import { activityService } from '@/services/activityService';
import { gradeService } from '@/services/honorService';
import { LuSearch, LuBookOpen, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const typeLabels = {
    cuento: 'Cuento',
    colorear: 'Colorear',
    numeros: 'Números',
    rompecabezas: 'Rompecabezas',
    juego: 'Juego',
    lectura: 'Lectura',
    otro: 'Otro',
};

function ActivitySkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
            <div className="h-36 bg-neutral-100" />
            <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-neutral-100 rounded-full" />
                    <div className="h-5 w-12 bg-neutral-100 rounded-full" />
                </div>
                <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
                <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
            </div>
        </div>
    );
}

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

    useEffect(() => { fetchActivities(); }, [fetchActivities]);

    const handleGradeChange = (e) => { setSelectedGrade(e.target.value); setPage(1); };
    const handleTypeChange = (e) => { setSelectedType(e.target.value); setPage(1); };
    const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };

    const selectClass = `px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white
        focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400
        cursor-pointer appearance-none min-w-[150px] font-[family-name:var(--font-dm-sans)]`;

    return (
        <MainLayout>

            {/* ── Hero ── */}
            <section className="relative bg-neutral-950 overflow-hidden py-24">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-900 opacity-20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-yellow-900 opacity-10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-4">
                        Recursos educativos
                    </span>
                    <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-5">
                        Actividades <span className="gradient-text">educativas</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl">
                        Cuentos, juegos, materiales para colorear y mucho más. Recursos diseñados para aprender de forma divertida.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            {/* ── Filtros y contenido ── */}
            <section className="py-12">
                <div className="max-w-6xl mx-auto px-4">

                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
                        <div className="relative">
                            <select value={selectedGrade} onChange={handleGradeChange} className={selectClass}>
                                <option value="">Todos los grados</option>
                                {grades.map((g) => (
                                    <option key={g._id} value={g.order}>
                                        {g.order === 0 ? 'Preescolar' : `${g.order}°`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <select value={selectedType} onChange={handleTypeChange} className={selectClass}>
                                <option value="">Tipo de actividad</option>
                                {types.map((t) => (
                                    <option key={t} value={t}>{typeLabels[t] || t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative flex-1 sm:max-w-xs">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Buscar actividad..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400
                                    placeholder:text-neutral-400"
                            />
                        </div>
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => <ActivitySkeleton key={i} />)}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-24 flex flex-col items-center gap-4">
                            <div className="h-20 w-20 bg-neutral-100 rounded-2xl flex items-center justify-center">
                                <LuBookOpen className="h-10 w-10 text-neutral-300" />
                            </div>
                            <div>
                                <p className="font-display font-bold text-neutral-700 text-lg">No hay actividades disponibles</p>
                                <p className="text-neutral-400 text-sm mt-1">Prueba con otros filtros o vuelve más tarde.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {activities.map((activity) => (
                                    <ActivityCard key={activity._id} activity={activity} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-12">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="h-10 w-10 rounded-xl border border-neutral-200 flex items-center justify-center
                                            text-neutral-500 hover:border-brand-400 hover:text-brand-600
                                            disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        <LuChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-mono text-neutral-500 px-4">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="h-10 w-10 rounded-xl border border-neutral-200 flex items-center justify-center
                                            text-neutral-500 hover:border-brand-400 hover:text-brand-600
                                            disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        <LuChevronRight className="w-4 h-4" />
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
