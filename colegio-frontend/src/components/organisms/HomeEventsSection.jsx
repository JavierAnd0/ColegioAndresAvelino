'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const categoryConfig = {
    academico: { label: 'Académico', variant: 'info' },
    deportivo: { label: 'Deportivo', variant: 'success' },
    cultural: { label: 'Cultural', variant: 'warning' },
    reunion: { label: 'Reunión', variant: 'default' },
    festivo: { label: 'Festivo', variant: 'danger' },
    otro: { label: 'Otro', variant: 'default' },
};

function formatEventDate(dateStr) {
    const d = new Date(dateStr);
    return {
        day: d.getDate(),
        monthShort: d.toLocaleDateString('es-CO', { month: 'short' }),
        weekday: d.toLocaleDateString('es-CO', { weekday: 'short' }),
        time: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        full: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
}

function EventSlide({ event }) {
    const { title, description, startDate, category, location, color, isAllDay } = event;
    const start = formatEventDate(startDate);
    const config = categoryConfig[category] || categoryConfig.otro;
    const accentColor = color || '#171717';

    return (
        <div className="min-w-[300px] sm:min-w-[340px] snap-start flex-shrink-0 group">
            <div className="relative bg-white rounded-2xl border border-neutral-100 overflow-hidden
                shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">

                {/* Color accent top */}
                <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

                {/* Date block + badge */}
                <div className="px-5 pt-5 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0"
                            style={{ backgroundColor: accentColor }}
                        >
                            <span className="text-white font-mono text-xl font-bold leading-none">
                                {start.day}
                            </span>
                            <span className="text-white/80 font-mono text-[0.6rem] uppercase leading-none mt-0.5">
                                {start.monthShort}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-medium capitalize">
                                {start.weekday}
                            </p>
                            {!isAllDay && (
                                <p className="text-sm font-mono font-semibold text-neutral-700">
                                    {start.time}
                                </p>
                            )}
                            {isAllDay && (
                                <p className="text-xs font-medium text-neutral-500">
                                    Todo el día
                                </p>
                            )}
                        </div>
                    </div>
                    <Badge variant={config.variant} size="sm">
                        {config.label}
                    </Badge>
                </div>

                {/* Content */}
                <div className="px-5 pt-4 pb-5 flex-1 flex flex-col gap-2">
                    <h3 className="font-mono font-bold text-base text-neutral-900 leading-snug line-clamp-2 group-hover:text-neutral-700 transition-colors">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
                            {description}
                        </p>
                    )}

                    {/* Location */}
                    {location && (
                        <div className="flex items-center gap-1.5 mt-auto pt-2">
                            <svg className="h-3.5 w-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="text-xs text-neutral-400 truncate">{location}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HomeEventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/events/upcoming`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setEvents(data.data || []);
            } catch {
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

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
    }, [events.length, updateScrollState]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="py-16 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="min-w-[340px] flex-shrink-0 animate-pulse">
                                <div className="bg-white rounded-2xl border border-neutral-100 p-5 h-52">
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-14 h-14 bg-neutral-200 rounded-xl" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3 w-16 bg-neutral-200 rounded" />
                                            <div className="h-4 w-12 bg-neutral-200 rounded" />
                                        </div>
                                        <div className="h-5 w-16 bg-neutral-200 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                                        <div className="h-3 w-full bg-neutral-200 rounded" />
                                        <div className="h-3 w-2/3 bg-neutral-200 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (events.length === 0) {
        return (
            <section className="py-16 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 text-center py-8">
                    <Heading level="h2">Próximos Eventos</Heading>
                    <Paragraph color="muted" className="mt-2">
                        No hay eventos programados por el momento.
                    </Paragraph>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">📅</span>
                            <Heading level="h2">Próximos Eventos</Heading>
                        </div>
                        <Paragraph color="muted">
                            Actividades y eventos de nuestra institución
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

                        <Link href="/calendario">
                            <Button variant="outline" size="sm">Ver todos →</Button>
                        </Link>
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Fade edges */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
                    )}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-2 -mx-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {events.slice(0, 8).map((event) => (
                            <EventSlide key={event._id} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
