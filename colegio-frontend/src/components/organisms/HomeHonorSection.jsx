'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { honorService } from '@/services/honorService';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const categoryConfig = {
    academico: { label: 'Académico', variant: 'info', icon: '📚' },
    valores: { label: 'Valores', variant: 'warning', icon: '🌟' },
    reciclaje: { label: 'Reciclaje', variant: 'success', icon: '♻️' },
};

const CATEGORIES_ORDER = ['academico', 'valores', 'reciclaje'];

function StudentRow({ entry, config }) {
    if (!entry) {
        return (
            <div className="flex items-center gap-3 py-2.5">
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-base shrink-0">
                    {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-300 italic">Sin asignar</p>
                </div>
                <Badge variant={config.variant} size="sm">{config.label}</Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 py-2.5">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 ring-2 ring-white shrink-0">
                {entry.photo?.url ? (
                    <img src={entry.photo.url} alt={entry.studentName}
                        className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-base bg-neutral-100">
                        {config.icon}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-sm text-neutral-900 truncate">
                    {entry.studentName}
                </p>
            </div>
            <Badge variant={config.variant} size="sm">{config.label}</Badge>
        </div>
    );
}

function GradeCard({ gradeGroup }) {
    return (
        <div className="min-w-[300px] sm:min-w-[340px] snap-start flex-shrink-0 group">
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden
                shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">

                {/* Grade header */}
                <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-neutral-50">
                    <div className="h-10 w-10 bg-neutral-900 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-white font-mono text-sm font-bold">
                            {gradeGroup.name.replace(/[^0-9°]/g, '').slice(0, 3) || gradeGroup.name.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-mono font-bold text-sm text-neutral-900 tracking-tight truncate">
                            {gradeGroup.name}
                        </h4>
                        <p className="text-[0.65rem] text-neutral-400">
                            {Object.keys(gradeGroup.entries).length}/3 categorías
                        </p>
                    </div>
                </div>

                {/* Students */}
                <div className="px-5 py-2 flex flex-col divide-y divide-neutral-50">
                    {CATEGORIES_ORDER.map(cat => (
                        <StudentRow
                            key={cat}
                            entry={gradeGroup.entries[cat]}
                            config={categoryConfig[cat]}
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
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const data = await honorService.getBoard(year, month);
                setEntries(data.data || []);
            } catch {
                setEntries([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [year, month]);

    // Group by grade
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
    const sortedGrades = Object.values(byGrade).sort((a, b) => a.order - b.order);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    useEffect(() => {
        updateScrollState();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateScrollState, { passive: true });
            window.addEventListener('resize', updateScrollState);
            return () => {
                el.removeEventListener('scroll', updateScrollState);
                window.removeEventListener('resize', updateScrollState);
            };
        }
    }, [sortedGrades.length, updateScrollState]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="min-w-[340px] flex-shrink-0 animate-pulse">
                                <div className="bg-white rounded-2xl border border-neutral-100 p-5 h-56">
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-10 h-10 bg-neutral-200 rounded-xl" />
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-4 w-24 bg-neutral-200 rounded" />
                                            <div className="h-3 w-16 bg-neutral-200 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                                                <div className="h-3 w-28 bg-neutral-200 rounded flex-1" />
                                                <div className="h-5 w-16 bg-neutral-200 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (sortedGrades.length === 0) return null;

    return (
        <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">🏆</span>
                            <Heading level="h2">Cuadro de Honor</Heading>
                        </div>
                        <Paragraph color="muted">
                            Reconocimiento a nuestros mejores estudiantes — {MONTHS[month - 1]} {year}
                        </Paragraph>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Navigation arrows */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className="h-9 w-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center
                                    hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <svg className="h-4 w-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className="h-9 w-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center
                                    hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <svg className="h-4 w-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <Link href="/cuadro-honor">
                            <Button variant="outline" size="sm">Ver completo →</Button>
                        </Link>
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Fade edges */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    )}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-2 -mx-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sortedGrades.map((gradeGroup) => (
                            <GradeCard key={gradeGroup.name} gradeGroup={gradeGroup} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
