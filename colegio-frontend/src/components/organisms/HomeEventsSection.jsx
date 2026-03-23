'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LuCalendarDays, LuClock, LuMapPin, LuArrowRight } from 'react-icons/lu';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* Paleta alineada con brand verde + acento dorado — sin azules ni púrpuras */
const categoryMeta = {
    academico: { label: 'Académico', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    deportivo:  { label: 'Deportivo',  color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
    cultural:   { label: 'Cultural',   color: '#d97706', bg: 'rgba(217,119,6,0.12)'  },
    reunion:    { label: 'Reunión',    color: '#a3d28c', bg: 'rgba(163,210,140,0.12)' },
    festivo:    { label: 'Festivo',    color: '#facc15', bg: 'rgba(250,204,21,0.10)'  },
    otro:       { label: 'Otro',       color: '#737373', bg: 'rgba(115,115,115,0.12)' },
};

function formatEventDate(dateStr) {
    const d = new Date(dateStr);
    return {
        day:     d.getDate().toString().padStart(2, '0'),
        month:   d.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase(),
        weekday: d.toLocaleDateString('es-CO', { weekday: 'short' }),
        time:    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
}

function EventCard({ event, isDragging }) {
    const { title, description, startDate, category, location, color, isAllDay } = event;
    const start = formatEventDate(startDate);
    const meta  = categoryMeta[category] || categoryMeta.otro;
    const accentColor = color || meta.color;
    const [hovered, setHovered] = useState(false);

    return (
        <div className="min-w-[280px] sm:min-w-[310px] snap-start flex-shrink-0 select-none h-full">
            <Link
                href="/calendario"
                draggable={false}
                onClick={(e) => { if (isDragging) e.preventDefault(); }}
                className="block h-full group"
            >
                <div
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="relative rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300"
                    style={{
                        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${hovered ? `${accentColor}40` : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.4), 0 0 24px ${accentColor}18` : 'none',
                        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                >
                    {/* Barra de color superior */}
                    <div className="h-0.5 w-full flex-shrink-0"
                        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }} />

                    {/* Glow top on hover */}
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{
                            background: `radial-gradient(ellipse at 50% -10%, ${accentColor}0d 0%, transparent 60%)`,
                            opacity: hovered ? 1 : 0,
                        }} />

                    <div className="p-5 flex flex-col gap-4 flex-1 relative z-10">
                        {/* Fecha + categoría */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-baseline gap-2">
                                <span className="font-display text-4xl font-bold text-white leading-none">{start.day}</span>
                                <div className="flex flex-col">
                                    <span className="text-[0.6rem] font-mono font-bold uppercase tracking-widest"
                                        style={{ color: accentColor }}>{start.month}</span>
                                    <span className="text-[0.6rem] font-mono uppercase tracking-wide text-white/30 capitalize">{start.weekday}</span>
                                </div>
                            </div>
                            <span className="text-[0.6rem] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0"
                                style={{ color: accentColor, backgroundColor: meta.bg }}>
                                {meta.label}
                            </span>
                        </div>

                        {/* Título */}
                        <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2 transition-colors duration-200"
                            style={{ color: hovered ? accentColor : 'white' }}>
                            {title}
                        </h3>

                        {/* Descripción */}
                        {description && (
                            <p className="text-white/35 text-xs leading-relaxed line-clamp-2 flex-1">
                                {description}
                            </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 mt-auto"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                            <span className="text-xs text-white/30 flex items-center gap-1.5">
                                {isAllDay
                                    ? <><LuCalendarDays className="w-3 h-3" /> Todo el día</>
                                    : <><LuClock className="w-3 h-3" /> {start.time}</>}
                            </span>
                            {location && (
                                <span className="text-xs text-white/30 truncate max-w-[120px] flex items-center gap-1 justify-end">
                                    <LuMapPin className="w-3 h-3 flex-shrink-0" /> {location}
                                </span>
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
        fetch(`${API_URL}/events/upcoming`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                const now = new Date();
                setEvents((data.data || []).filter(e => new Date(e.startDate) >= now));
            })
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    const updateScrollProgress = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollProgress();
        el.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress);
        return () => {
            el.removeEventListener('scroll', updateScrollProgress);
            window.removeEventListener('resize', updateScrollProgress);
        };
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
            const delta = e.pageX - el.offsetLeft - startXRef.current;
            if (Math.abs(delta) > 5) { isDraggingRef.current = true; setIsDragging(true); }
            el.scrollLeft = scrollLeftRef.current - delta;
        };
        const onMouseUp = () => {
            el.style.cursor = 'grab';
            el.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setTimeout(() => { isDraggingRef.current = false; setIsDragging(false); }, 50);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, []);

    if (loading) {
        return (
            <section className="relative py-20 bg-neutral-950 overflow-hidden">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="mb-10">
                        <div className="h-3 w-20 rounded-full animate-pulse mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="h-10 w-56 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="min-w-[310px] flex-shrink-0 h-[180px] rounded-2xl animate-pulse"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (events.length === 0) return null;

    return (
        <section className="relative py-20 bg-neutral-950 overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none -translate-y-1/2"
                style={{ background: 'radial-gradient(circle, #16a34a, transparent 70%)' }} />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none -translate-y-1/2"
                style={{ background: 'radial-gradient(circle, #d97706, transparent 70%)' }} />

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-2">
                            Agenda
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                            Próximos<br />
                            <span className="gradient-text">Eventos</span>
                        </h2>
                        <div className="h-px w-12 mt-4 rounded-full"
                            style={{ background: 'linear-gradient(90deg, #16a34a, transparent)' }} />
                    </div>
                    <Link href="/calendario"
                        className="hidden sm:flex items-center gap-2 text-sm font-semibold transition-colors duration-200 group"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#86efac'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                        Ver todos
                        <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Carrusel */}
                <div
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    className="flex gap-4 overflow-x-auto snap-x pb-4 -mx-4 px-4 cursor-grab items-stretch"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {events.slice(0, 10).map(event => (
                        <EventCard key={event._id} event={event} isDragging={isDragging} />
                    ))}
                </div>

                {/* Barra de progreso */}
                {events.length > 3 && (
                    <div className="mt-5 flex items-center gap-3">
                        <div className="flex-1 max-w-[180px] h-px rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full transition-all duration-200"
                                style={{
                                    width: `${Math.max(12, scrollProgress * 100)}%`,
                                    background: 'linear-gradient(90deg, #16a34a, #d97706)',
                                }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {events.slice(0, 10).length} eventos
                        </span>
                    </div>
                )}

                <div className="sm:hidden mt-6">
                    <Link href="/calendario" className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                        Ver todos los eventos <LuArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
