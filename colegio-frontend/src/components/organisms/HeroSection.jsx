'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { heroSlidesService } from '@/services/heroSlidesService';
import { LuBookOpen, LuClipboardList, LuMonitor, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const quickLinks = [
    { label: 'Ingreso Académico',    Icon: LuBookOpen,      href: '/admisiones' },
    { label: 'Manual de Convivencia', Icon: LuClipboardList, href: '/manual-convivencia' },
    { label: 'Plataforma de Notas',  Icon: LuMonitor,       href: '/notas' },
];

export default function HeroSection({
    subtitle = 'Una institución educativa comprometida con la excelencia, los valores y el desarrollo integral de cada estudiante.',
}) {
    const [slides, setSlides]   = useState([]);
    const [current, setCurrent] = useState(0);
    const [paused, setPaused]   = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        heroSlidesService.getAll()
            .then(res => setSlides(res.data || []))
            .catch(() => setSlides([]));
    }, []);

    const next = useCallback(() => {
        setCurrent(c => (c + 1) % slides.length);
    }, [slides.length]);

    const goTo = useCallback((index) => {
        setCurrent(index);
        setPaused(true);
        setTimeout(() => setPaused(false), 7000);
    }, []);

    useEffect(() => {
        if (slides.length <= 1 || paused) return;
        timerRef.current = setInterval(next, 5000);
        return () => clearInterval(timerRef.current);
    }, [slides.length, paused, next]);

    const hasSlides = slides.length > 0;

    return (
        <section
            className="relative min-h-screen flex flex-col overflow-hidden bg-neutral-950"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* ── Área principal con imágenes contenidas ── */}
            <div className="flex-1 relative overflow-hidden">

                {/* ── Slides de fondo ── */}
                {hasSlides ? (
                    slides.map((slide, i) => (
                        <div
                            key={slide._id}
                            aria-hidden={i !== current}
                            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
                        >
                            <img
                                src={slide.image.url}
                                alt={slide.title || `Slide ${i + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading={i === 0 ? 'eager' : 'lazy'}
                                style={{
                                    transform: i === current ? 'scale(1.04)' : 'scale(1)',
                                    transition: 'transform 8s ease-out',
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <>
                        <div className="absolute -top-60 right-0 w-[700px] h-[700px] bg-brand-700 rounded-full opacity-[0.10] blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-brand-900 rounded-full opacity-25 blur-3xl pointer-events-none" />
                    </>
                )}

                {/* ── Gradientes de legibilidad ── */}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/75 to-neutral-950/20 pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40 pointer-events-none z-10" />

                {/* ── Patrón de puntos ── */}
                <div className="absolute inset-0 dot-pattern opacity-[0.04] pointer-events-none z-10" />

                {/* ── Contenido de texto ── */}
                <div className="relative z-20 h-full flex items-center px-8 sm:px-12 lg:px-20 py-28">
                    <div className="max-w-lg flex flex-col gap-8">

                        <div className="animate-fade-in-up flex flex-col gap-5">
                            <h1 className="font-display font-black leading-[1.02] tracking-tight"
                                style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}>
                                <span className="text-white">Andres Avelino </span>
                                <span className="gradient-text">Longas</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="h-[3px] w-14 bg-brand-500 rounded-full" />
                                <div className="h-[3px] w-7  bg-yellow-400 rounded-full" />
                                <div className="h-[3px] w-3.5 bg-brand-800 rounded-full" />
                            </div>
                        </div>

                        <p className="animate-fade-in-up-d2 text-neutral-300 leading-relaxed"
                            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}>
                            {subtitle}
                        </p>

                    </div>
                </div>

                {/* ── Flechas de navegación ── */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
                            aria-label="Slide anterior"
                            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30
                                w-9 h-9 sm:w-11 sm:h-11 rounded-full
                                bg-black/35 hover:bg-black/55 backdrop-blur-sm
                                border border-white/15 hover:border-white/30
                                flex items-center justify-center text-white
                                transition-all duration-200 cursor-pointer"
                        >
                            <LuChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => goTo((current + 1) % slides.length)}
                            aria-label="Slide siguiente"
                            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30
                                w-9 h-9 sm:w-11 sm:h-11 rounded-full
                                bg-black/35 hover:bg-black/55 backdrop-blur-sm
                                border border-white/15 hover:border-white/30
                                flex items-center justify-center text-white
                                transition-all duration-200 cursor-pointer"
                        >
                            <LuChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* ── Indicadores (dots) ── */}
                {slides.length > 1 && (
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Ir al slide ${i + 1}`}
                                className="rounded-full transition-all duration-300 cursor-pointer"
                                style={{
                                    width: i === current ? '24px' : '7px',
                                    height: '7px',
                                    background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* ── Barra de progreso ── */}
                {slides.length > 1 && !paused && (
                    <div className="absolute bottom-0 left-0 right-0 z-30 h-0.5 bg-white/10">
                        <div
                            key={`${current}-bar`}
                            className="h-full bg-brand-500"
                            style={{ animation: 'progress-bar 5s linear forwards' }}
                        />
                    </div>
                )}
            </div>

            {/* ── Accesos rápidos ── */}
            <div className="relative z-10 border-t border-white/[0.08] bg-neutral-950/65 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {quickLinks.map(({ label, Icon, href }) => (
                            <Link key={label} href={href}
                                className="group flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 border border-white/[0.08] hover:border-brand-500/40 hover:bg-white/[0.04] transition-all duration-200 text-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                                    <Icon className="w-5 h-5 text-brand-400" />
                                </div>
                                <p className="font-display font-bold text-white text-sm leading-snug">{label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Wave de salida ── */}
            <div className="relative z-10 leading-[0]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 56" className="w-full fill-neutral-950">
                    <path d="M0,56 L0,28 C240,56 480,0 720,20 C960,40 1200,8 1440,28 L1440,56 Z" />
                </svg>
            </div>

        </section>
    );
}
