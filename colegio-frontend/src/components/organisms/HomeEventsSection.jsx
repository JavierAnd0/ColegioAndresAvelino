'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';

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
    };
}

function EventSlide({ event, isDragging }) {
    const { title, description, startDate, category, location, color, isAllDay } = event;
    const start = formatEventDate(startDate);
    const config = categoryConfig[category] || categoryConfig.otro;
    const accentColor = color || '#171717';

    return (
        <div className="min-w-[300px] sm:min-w-[340px] snap-start flex-shrink-0 select-none">
            <Link
                href="/calendario"
                draggable={false}
                onClick={(e) => { if (isDragging) e.preventDefault(); }}
                className="block h-full"
            >
                <div className="relative bg-white rounded-2xl overflow-hidden border border-neutral-100
                    shadow-sm hover:shadow-xl hover:-translate-y-1
                    transition-all duration-300 h-full min-h-[200px] flex flex-col group">

                    <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <span className="text-white font-mono text-lg font-bold leading-none">
                                        {start.day}
                                    </span>
                                    <span className="text-white/70 font-mono text-[0.55rem] uppercase leading-none mt-0.5">
                                        {start.monthShort}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[0.7rem] text-neutral-400 capitalize font-medium">
                                        {start.weekday}
                                    </p>
                                    <p className="text-sm font-mono font-semibold text-neutral-800">
                                        {isAllDay ? 'Todo el día' : start.time}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={config.variant} size="sm" className="shrink-0">
                                {config.label}
                            </Badge>
                        </div>

                        <h3 className="font-mono font-bold text-sm text-neutral-900 leading-snug line-clamp-2
                            group-hover:text-neutral-600 transition-colors">
                            {title}
                        </h3>

                        {description && (
                            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mt-1.5">
                                {description}
                            </p>
                        )}

                        {location && (
                            <div className="flex items-center gap-1.5 mt-auto pt-3">
                                <svg className="h-3 w-3 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                <span className="text-[0.7rem] text-neutral-400 truncate">{location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function HomeEventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

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

    const onMouseDown = useCallback((e) => {
        const el = scrollRef.current;
        if (!el) return;
        isDraggingRef.current = false;
        startXRef.current = e.pageX - el.offsetLeft;
        scrollLeftRef.current = el.scrollLeft;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';

        const onMouseMove = (e) => {
            const x = e.pageX - el.offsetLeft;
            const delta = x - startXRef.current;
            if (Math.abs(delta) > 5) {
                isDraggingRef.current = true;
                setIsDragging(true);
            }
            el.scrollLeft = scrollLeftRef.current - delta;
        };

        const onMouseUp = () => {
            el.style.cursor = 'grab';
            el.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setTimeout(() => {
                isDraggingRef.current = false;
                setIsDragging(false);
            }, 50);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="mb-8">
                        <div className="h-8 w-56 bg-neutral-200 rounded animate-pulse" />
                        <div className="h-4 w-80 bg-neutral-100 rounded animate-pulse mt-2" />
                    </div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="min-w-[340px] flex-shrink-0 animate-pulse">
                                <div className="bg-white rounded-2xl border border-neutral-100 p-5 min-h-[200px]">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-xl" />
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-3 w-14 bg-neutral-100 rounded" />
                                            <div className="h-4 w-10 bg-neutral-100 rounded" />
                                        </div>
                                        <div className="h-5 w-16 bg-neutral-100 rounded-full" />
                                    </div>
                                    <div className="h-4 w-3/4 bg-neutral-100 rounded mt-2" />
                                    <div className="h-3 w-full bg-neutral-100 rounded mt-2" />
                                    <div className="h-3 w-1/2 bg-neutral-100 rounded mt-2" />
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
                {/* Header con flechas */}
                <div className="flex items-end justify-between gap-4 mb-8">
                    <div>
                        <Heading level="h2">Próximos Eventos</Heading>
                        <Paragraph color="muted" className="mt-1">
                            Actividades y eventos de nuestra institución
                        </Paragraph>
                    </div>

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
                </div>

                {/* Carrusel */}
                <div className="relative">
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
                    )}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />
                    )}

                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-2 -mx-4 px-4 cursor-grab active:cursor-grabbing"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {events.slice(0, 10).map((event) => (
                            <EventSlide key={event._id} event={event} isDragging={isDragging} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
