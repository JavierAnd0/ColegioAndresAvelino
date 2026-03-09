'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import { honorService } from '@/services/honorService';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const categoryConfig = {
    academico: { label: 'Académico', variant: 'info', icon: '📚' },
    valores: { label: 'Valores', variant: 'success', icon: '🌟' },
    reciclaje: { label: 'Reciclaje', variant: 'warning', icon: '♻️' },
};

const CATEGORIES_ORDER = ['academico', 'valores', 'reciclaje'];

function GradeCard({ gradeGroup }) {
    return (
        <div className="min-w-[320px] sm:min-w-[380px] snap-center flex-shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow p-5 h-full">
                {/* Grade header */}
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-9 w-9 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-mono text-sm font-bold">
                            {gradeGroup.name.charAt(0)}
                        </span>
                    </div>
                    <h4 className="font-mono font-bold text-base text-neutral-900 tracking-tight">
                        {gradeGroup.name}
                    </h4>
                </div>

                {/* Students */}
                <div className="flex flex-col gap-3">
                    {CATEGORIES_ORDER.map(cat => {
                        const entry = gradeGroup.entries[cat];
                        const config = categoryConfig[cat];

                        if (!entry) {
                            return (
                                <div key={cat} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50">
                                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-lg shrink-0">
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-neutral-400">Sin asignar</p>
                                        <Badge variant={config.variant} size="sm">{config.label}</Badge>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={cat} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 ring-2 ring-white shrink-0">
                                    {entry.photo?.url ? (
                                        <img src={entry.photo.url} alt={entry.studentName}
                                            className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg">
                                            {config.icon}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono font-semibold text-sm text-neutral-900 truncate">
                                        {entry.studentName}
                                    </p>
                                    <Badge variant={config.variant} size="sm">{config.label}</Badge>
                                </div>
                            </div>
                        );
                    })}
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

    // Agrupar por grado
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

    const updateScrollButtons = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);
            return () => {
                el.removeEventListener('scroll', updateScrollButtons);
                window.removeEventListener('resize', updateScrollButtons);
            };
        }
    }, [sortedGrades.length]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = 400;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="py-16 bg-neutral-50">
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            </section>
        );
    }

    if (sortedGrades.length === 0) return null;

    return (
        <section className="py-16 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🏆</span>
                            <Heading level="h2">Cuadro de Honor</Heading>
                        </div>
                        <Paragraph color="muted">
                            Reconocimiento a nuestros mejores estudiantes — {MONTHS[month - 1]} {year}
                        </Paragraph>
                    </div>
                    <Link href="/cuadro-honor">
                        <Button variant="outline" size="sm">Ver completo →</Button>
                    </Link>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Scroll container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sortedGrades.map((gradeGroup) => (
                            <GradeCard key={gradeGroup.name} gradeGroup={gradeGroup} />
                        ))}
                    </div>

                    {/* Nav arrows */}
                    {canScrollLeft && (
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10
                                h-10 w-10 bg-white border border-neutral-200 rounded-full shadow-md
                                flex items-center justify-center
                                hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                            <svg className="h-4 w-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10
                                h-10 w-10 bg-white border border-neutral-200 rounded-full shadow-md
                                flex items-center justify-center
                                hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                            <svg className="h-4 w-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Dot indicators */}
                {sortedGrades.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-4">
                        {sortedGrades.map((g, i) => (
                            <div key={i} className="h-1.5 w-6 rounded-full bg-neutral-300" />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
