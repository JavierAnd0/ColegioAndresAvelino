'use client';
import { useState, useEffect } from 'react';
import CategoryFilter from '@/components/molecules/CategoryFilter';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import EventCardSkeleton from '@/components/molecules/EventCardSkeleton';
import CalendarGrid from '@/components/organisms/CalendarGrid';
import EventTimeline from '@/components/organisms/EventTimeline';

const eventCategories = [
    { value: 'academico', label: 'Académico' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'reunion', label: 'Reuniones' },
    { value: 'festivo', label: 'Festivos' },
];

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function ViewToggle({ viewMode, onChange }) {
    return (
        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
            <button
                onClick={() => onChange('grid')}
                className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-200
                    ${viewMode === 'grid'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }
                `}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Grilla
            </button>
            <button
                onClick={() => onChange('list')}
                className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-200
                    ${viewMode === 'list'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }
                `}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Timeline
            </button>
        </div>
    );
}

export default function EventCalendar({
    events = [],
    loading = false,
    onCategoryChange,
    onMonthChange,
    activeCategory = 'all',
}) {
    const now = new Date();
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [viewMode, setViewMode] = useState('grid');

    // Restore view mode from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('eventCalendarView');
        if (saved === 'grid' || saved === 'list') {
            setViewMode(saved);
        }
    }, []);

    const handleViewChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('eventCalendarView', mode);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
            onMonthChange?.(11, currentYear - 1);
        } else {
            setCurrentMonth(m => m - 1);
            onMonthChange?.(currentMonth - 1, currentYear);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
            onMonthChange?.(0, currentYear + 1);
        } else {
            setCurrentMonth(m => m + 1);
            onMonthChange?.(currentMonth + 1, currentYear);
        }
    };

    return (
        <section className="max-w-6xl mx-auto px-4 py-12">

            {/* Header del calendario */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest block mb-1">
                            Agenda mensual
                        </span>
                        <Heading level="h2">Eventos</Heading>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Toggle de vista */}
                        <ViewToggle viewMode={viewMode} onChange={handleViewChange} />

                        {/* Navegación de mes */}
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-1">
                            <button
                                onClick={handlePrevMonth}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500
                                    hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <span className="font-mono text-sm font-bold text-neutral-900 min-w-36 text-center">
                                {MONTHS[currentMonth]} {currentYear}
                            </span>
                            <button
                                onClick={handleNextMonth}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500
                                    hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtro de categorías */}
                <CategoryFilter
                    categories={eventCategories}
                    activeCategory={activeCategory}
                    onCategoryChange={onCategoryChange}
                />
            </div>

            {/* Estado de carga */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <EventCardSkeleton key={i} variant="full" />
                    ))}
                </div>
            )}

            {/* Contenido principal */}
            {!loading && (
                <>
                    {/* Contador de eventos */}
                    {events.length > 0 && (
                        <Paragraph color="muted" className="mb-4">
                            {events.length} {events.length === 1 ? 'evento' : 'eventos'} en {MONTHS[currentMonth]}
                        </Paragraph>
                    )}

                    {/* Vista de grilla */}
                    {viewMode === 'grid' && (
                        <CalendarGrid
                            events={events}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                        />
                    )}

                    {/* Vista de timeline */}
                    {viewMode === 'list' && (
                        <EventTimeline
                            events={events}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                        />
                    )}
                </>
            )}
        </section>
    );
}
