'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const categoryColors = {
    academico: '#2563eb',
    deportivo: '#16a34a',
    cultural: '#ea580c',
    reunion: '#6b7280',
    festivo: '#dc2626',
    otro: '#171717',
};

function formatEventDate(dateStr) {
    const d = new Date(dateStr);
    return {
        day: d.getDate(),
        monthShort: d.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase(),
        weekday: d.toLocaleDateString('es-CO', { weekday: 'long' }),
        time: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
}

function EventSlide({ event, isDragging }) {
    const { title, description, startDate, category, location, color, isAllDay } = event;
    const start = formatEventDate(startDate);
    const accentColor = color || categoryColors[category] || '#171717';

    return (
        <div className="min-w-[260px] sm:min-w-[300px] snap-start flex-shrink-0 select-none">
            <Link
                href="/calendario"
                draggable={false}
                onClick={(e) => { if (isDragging) e.preventDefault(); }}
                className="block h-full"
            >
                <div className="bg-white rounded-xl border border-neutral-200/60
                    hover:border-neutral-300 hover:shadow-md
                    transition-all duration-200 h-full flex flex-col group">

                    <div className="p-4 flex gap-3.5 flex-1">
                        {/* Bloque fecha */}
                        <div
                            className="w-14 h-14 rounded-lg flex flex-col items-center justify-center shrink-0"
                            style={{ backgroundColor: accentColor }}
                        >
                            <span className="text-white font-mono text-xl font-bold leading-none">
                                {start.day}
                            </span>
                            <span className="text-white/70 font-mono text-[0.5rem] tracking-wider leading-none mt-0.5">
                                {start.monthShort}
                            </span>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0 flex flex-col">
                            <p className="text-[0.65rem] text-neutral-400 capitalize leading-none mb-1">
                                {start.weekday} · {isAllDay ? 'Todo el día' : start.time}
                            </p>
                            <h3 className="font-semibold text-sm text-neutral-900 leading-snug line-clamp-2
                                group-hover:text-neutral-600 transition-colors">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-neutral-400 line-clamp-1 mt-1">
                                    {description}
                                </p>
                            )}
                            {location && (
                                <p className="text-[0.65rem] text-neutral-400 truncate mt-auto pt-2">
                                    {location}
                                </p>
                            )}
                        </div>
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
    const [scrollProgress, setScrollProgress] = useState(0);

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

    const updateScrollProgress = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            updateScrollProgress();
            el.addEventListener('scroll', updateScrollProgress, { passive: true });
            window.addEventListener('resize', updateScrollProgress);
            return () => {
                el.removeEventListener('scroll', updateScrollProgress);
                window.removeEventListener('resize', updateScrollProgress);
            };
        }
    }, [events.length, updateScrollProgress]);

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
                        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
                        <div className="h-4 w-72 bg-neutral-100 rounded animate-pulse mt-2" />
                    </div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="min-w-[300px] flex-shrink-0 animate-pulse">
                                <div className="bg-white rounded-xl border border-neutral-200/60 p-4 h-[100px]">
                                    <div className="flex gap-3.5">
                                        <div className="w-14 h-14 bg-neutral-100 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2.5 w-20 bg-neutral-100 rounded" />
                                            <div className="h-3.5 w-full bg-neutral-100 rounded" />
                                            <div className="h-2.5 w-2/3 bg-neutral-100 rounded" />
                                        </div>
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
                <div className="mb-8">
                    <Heading level="h2">Próximos Eventos</Heading>
                    <Paragraph color="muted" className="mt-1">
                        Actividades y eventos de nuestra institución
                    </Paragraph>
                </div>

                {/* Carrusel */}
                <div
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    className="flex gap-3 overflow-x-auto snap-x pb-4 -mx-4 px-4 cursor-grab active:cursor-grabbing"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {events.slice(0, 10).map((event) => (
                        <EventSlide key={event._id} event={event} isDragging={isDragging} />
                    ))}
                </div>

                {/* Barra de progreso */}
                {events.length > 3 && (
                    <div className="mt-4 mx-auto max-w-[120px]">
                        <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-neutral-900 rounded-full transition-all duration-150"
                                style={{ width: `${Math.max(20, scrollProgress * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
