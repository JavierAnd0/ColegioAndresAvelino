'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import { honorService, gradeService } from '@/services/honorService';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const categoryConfig = {
    academico: { label: 'Académico', variant: 'info' },
    valores: { label: 'Valores', variant: 'warning' },
    reciclaje: { label: 'Reciclaje', variant: 'success' },
};

const CATEGORIES_ORDER = ['academico', 'valores', 'reciclaje'];

/* --- Icono de Preescolar (lápiz) --- */
function PreescolarIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="4" />
            <polygon points="12,2 9,7 15,7" fill="currentColor" stroke="none" />
            <line x1="10" y1="20" x2="14" y2="20" />
        </svg>
    );
}

/* --- Icono de categoría (SVG) --- */
function CategoryIcon({ category, className }) {
    if (category === 'academico') {
        // Libro
        return (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
        );
    }
    if (category === 'valores') {
        // Estrella
        return (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        );
    }
    // Reciclaje - hoja
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2.5 1.5 6.5c0 4-2 7-4.5 8.5" />
            <path d="M12 10v6" />
            <path d="M9 13l3-3 3 3" />
        </svg>
    );
}

function StudentRow({ entry, category }) {
    const config = categoryConfig[category];

    if (!entry) {
        return (
            <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
                <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-neutral-50 flex items-center justify-center shrink-0">
                    <CategoryIcon category={category} className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-300" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-neutral-300 italic">Sin asignar</p>
                </div>
                <Badge variant={config.variant} size="sm">{config.label}</Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-neutral-100 ring-2 ring-white shrink-0">
                {entry.photo?.url ? (
                    <img src={entry.photo.url} alt={entry.studentName}
                        className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <CategoryIcon category={category} className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-neutral-900 truncate">
                    {entry.studentName}
                </p>
            </div>
            <Badge variant={config.variant} size="sm">{config.label}</Badge>
        </div>
    );
}

function GradePanel({ gradeGroup }) {
    return (
        <div className="w-full">
            <div className="bg-white rounded-xl border border-neutral-200/60 overflow-hidden">
                <div className="divide-y divide-neutral-100 px-5">
                    {CATEGORIES_ORDER.map(cat => (
                        <StudentRow
                            key={cat}
                            entry={gradeGroup.entries[cat]}
                            category={cat}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function HomeHonorSection() {
    const now = new Date();
    const [entries, setEntries] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const autoPlayRef = useRef(null);
    const [paused, setPaused] = useState(false);

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [boardData, gradeData] = await Promise.all([
                    honorService.getBoard(year, month),
                    gradeService.getAll(),
                ]);
                setEntries(boardData.data || []);
                setGrades(gradeData.data || []);
            } catch {
                setEntries([]);
                setGrades([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month]);

    // Group entries by grade
    const byGrade = {};
    entries.forEach(entry => {
        const gradeId = entry.grade?._id || entry.grade;
        if (!byGrade[gradeId]) {
            byGrade[gradeId] = {
                name: entry.grade?.name || 'Sin grado',
                order: entry.grade?.order ?? 99,
                entries: {},
            };
        }
        byGrade[gradeId].entries[entry.category] = entry;
    });

    // Build sorted list using all grades (even empty ones)
    const sortedGrades = grades.map(g => ({
        _id: g._id,
        name: g.name,
        order: g.order,
        entries: byGrade[g._id]?.entries || {},
    })).sort((a, b) => a.order - b.order);

    // Auto-play carousel
    useEffect(() => {
        if (sortedGrades.length <= 1 || paused) return;
        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % sortedGrades.length);
        }, 4000);
        return () => clearInterval(autoPlayRef.current);
    }, [sortedGrades.length, paused]);

    const goTo = useCallback((index) => {
        setActiveIndex(index);
        // Pause auto-play briefly when user clicks
        setPaused(true);
        setTimeout(() => setPaused(false), 8000);
    }, []);

    if (loading) {
        return (
            <section className="py-16">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="mb-8 text-center">
                        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mx-auto" />
                        <div className="h-4 w-72 bg-neutral-100 rounded animate-pulse mt-2 mx-auto" />
                    </div>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-10 h-10 bg-neutral-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-5 space-y-4">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-neutral-100 rounded-full" />
                                <div className="h-3.5 w-32 bg-neutral-100 rounded flex-1" />
                                <div className="h-5 w-16 bg-neutral-100 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (sortedGrades.length === 0) return null;

    const activeGrade = sortedGrades[activeIndex];

    return (
        <section className="py-20 bg-neutral-50/50">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <Heading level="h2" className="text-3xl md:text-4xl">Cuadro de Honor</Heading>
                    <Paragraph color="muted" className="mt-2 text-base">
                        Reconocimiento a nuestros estudiantes — {MONTHS[month - 1]} {year}
                    </Paragraph>
                </div>

                {/* Grade selector tabs */}
                <div className="flex justify-center gap-1.5 sm:gap-2 mb-8 flex-wrap">
                    {sortedGrades.map((grade, index) => {
                        const isActive = index === activeIndex;
                        const isPreescolar = grade.order === 0;

                        return (
                            <button
                                key={grade._id}
                                type="button"
                                onClick={() => goTo(index)}
                                title={grade.name}
                                className={`
                                    relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center
                                    transition-all duration-200 cursor-pointer
                                    ${isActive
                                        ? 'bg-neutral-900 text-white shadow-lg scale-110'
                                        : 'bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 border border-neutral-200'
                                    }
                                `}
                            >
                                {isPreescolar ? (
                                    <PreescolarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                    <span className="font-mono text-sm sm:text-base font-bold">{grade.order}°</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Active grade name */}
                <div className="text-center mb-5">
                    <span className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">
                        {activeGrade.name}
                    </span>
                </div>

                {/* Grade panel with transition */}
                <div className="relative overflow-hidden max-w-xl mx-auto">
                    <div
                        className="transition-opacity duration-300"
                        key={activeIndex}
                    >
                        <GradePanel gradeGroup={activeGrade} />
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-6">
                    {sortedGrades.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === activeIndex
                                    ? 'w-7 bg-neutral-900'
                                    : 'w-1.5 bg-neutral-300'
                            }`}
                        />
                    ))}
                </div>

                {/* Link to full page */}
                <div className="text-center mt-8">
                    <Link
                        href="/cuadro-honor"
                        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-4"
                    >
                        Ver cuadro completo
                    </Link>
                </div>
            </div>
        </section>
    );
}
