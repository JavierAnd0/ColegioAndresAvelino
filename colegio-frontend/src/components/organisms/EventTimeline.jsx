'use client';
import { useMemo } from 'react';
import EventCard from '@/components/molecules/EventCard';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import { LuCalendarX } from 'react-icons/lu';

const categoryDotColors = {
    academico: 'bg-blue-500',
    deportivo: 'bg-green-500',
    cultural: 'bg-yellow-500',
    reunion: 'bg-neutral-500',
    festivo: 'bg-red-500',
    otro: 'bg-neutral-400',
};

function formatGroupDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const weekday = d.toLocaleDateString('es-CO', { weekday: 'long' });
    const month = d.toLocaleDateString('es-CO', { month: 'long' });
    return { day, weekday, month };
}

export default function EventTimeline({ events = [], currentMonth, currentYear }) {
    // Group events by date
    const groupedEvents = useMemo(() => {
        const groups = {};
        const sorted = [...events].sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );

        sorted.forEach((event) => {
            const d = new Date(event.startDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(event);
        });

        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [events]);

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <LuCalendarX className="w-12 h-12 text-neutral-300" />
                <Heading level="h4" className="text-neutral-500">
                    Sin eventos este mes
                </Heading>
                <Paragraph color="muted">
                    No hay eventos programados para este período.
                </Paragraph>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-neutral-200" />

            <div className="flex flex-col gap-8">
                {groupedEvents.map(([dateKey, dayEvents]) => {
                    const { day, weekday, month } = formatGroupDate(dateKey);
                    return (
                        <div key={dateKey} className="relative">
                            {/* Date separator */}
                            <div className="flex items-center gap-3 mb-4 relative">
                                <div className="w-8 sm:w-12 flex items-center justify-center relative z-10">
                                    <div className="w-3 h-3 rounded-full bg-neutral-900 ring-4 ring-white" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-mono text-2xl font-bold text-neutral-900">
                                        {day}
                                    </span>
                                    <span className="font-mono text-xs text-neutral-400 uppercase tracking-wide capitalize">
                                        {weekday}, {month}
                                    </span>
                                </div>
                            </div>

                            {/* Events for this date */}
                            <div className="flex flex-col gap-3 ml-8 sm:ml-12 pl-4 border-l-0">
                                {dayEvents.map((event) => (
                                    <div key={event._id} className="relative">
                                        {/* Colored dot connector */}
                                        <div className="absolute -left-[calc(1rem+1.5px+16px)] sm:-left-[calc(1rem+1.5px+24px)] top-5 flex items-center">
                                            <div className={`w-2 h-2 rounded-full ${categoryDotColors[event.category] || 'bg-neutral-400'}`} />
                                            <div className="w-3 sm:w-5 h-px bg-neutral-200" />
                                        </div>
                                        <EventCard event={event} variant="full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
