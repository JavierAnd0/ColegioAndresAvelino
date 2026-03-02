'use client';
import { useState } from 'react';
import EventCard from '@/components/molecules/EventCard';
import CategoryFilter from '@/components/molecules/CategoryFilter';
import Spinner from '@/components/atoms/Spinner';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import EventCardSkeleton from '@/components/molecules/EventCardSkeleton';


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
                    <Heading level="h2">Calendario de Eventos</Heading>

                    {/* Navegación de mes */}
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={handlePrevMonth}>←</Button>
                        <span className="text-base font-semibold text-neutral-900 min-w-36 text-center">
                            {MONTHS[currentMonth]} {currentYear}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleNextMonth}>→</Button>
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

            {/* Sin eventos */}
            {!loading && events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <span className="text-5xl">📅</span>
                    <Heading level="h4" className="text-neutral-500">
                        Sin eventos este mes
                    </Heading>
                    <Paragraph color="muted">
                        No hay eventos programados para {MONTHS[currentMonth]} {currentYear}.
                    </Paragraph>
                </div>
            )}

            {/* Lista de eventos */}
            {!loading && events.length > 0 && (
                <div className="flex flex-col gap-4">
                    <Paragraph color="muted">
                        {events.length} {events.length === 1 ? 'evento' : 'eventos'} en {MONTHS[currentMonth]}
                    </Paragraph>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((event) => (
                            <EventCard key={event._id} event={event} variant="full" />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}