'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { carouselService } from '@/services/carouselService';
import { LuArrowRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function ImageCarousel() {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        carouselService.getAll()
            .then(res => setSlides(res.data || []))
            .catch(() => setSlides([]))
            .finally(() => setLoaded(true));
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

    if (!loaded || slides.length === 0) return null;

    const slide = slides[current];
    const hasContent = slide.title || slide.subtitle;

    return (
        <section
            className="relative w-full overflow-hidden bg-neutral-950"
            style={{ height: 'clamp(260px, 52vw, 600px)' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* ── Slides ── */}
            {slides.map((s, i) => (
                <div
                    key={s._id}
                    aria-hidden={i !== current}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 10 : 0 }}
                >
                    {/* Imagen: ocupa todo el contenedor sin distorsión */}
                    <img
                        src={s.image.url}
                        alt={s.title || `Slide ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        style={{
                            transform: i === current ? 'scale(1.04)' : 'scale(1)',
                            transition: 'transform 8s ease-out',
                        }}
                    />

                    {/* Overlay base: siempre oscurece bordes para que el contenido sea legible */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/15 to-neutral-950/35" />

                    {/* Overlay lateral: solo cuando hay texto, mejora la legibilidad */}
                    {(s.title || s.subtitle) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/65 via-neutral-950/20 to-transparent" />
                    )}
                </div>
            ))}

            {/* ── Zona de contenido — posición fija, siempre consistente ── */}
            {hasContent && (
                <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
                    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 pb-14 sm:pb-16">
                        <div key={current} className="max-w-xl animate-fade-in-up-d1 pointer-events-auto">
                            {slide.title && (
                                <h2
                                    className="font-display font-black text-white leading-tight drop-shadow-lg mb-2"
                                    style={{ fontSize: 'clamp(1.3rem, 3.2vw, 2.6rem)' }}
                                >
                                    {slide.title}
                                </h2>
                            )}
                            {slide.subtitle && (
                                <p
                                    className="text-white/80 leading-relaxed drop-shadow mb-5"
                                    style={{ fontSize: 'clamp(0.82rem, 1.3vw, 0.97rem)' }}
                                >
                                    {slide.subtitle}
                                </p>
                            )}
                            {slide.linkUrl && (
                                <Link
                                    href={slide.linkUrl}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                                        bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm
                                        transition-all duration-200 group shadow-lg"
                                >
                                    {slide.linkLabel || 'Ver más'}
                                    <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
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
        </section>
    );
}
