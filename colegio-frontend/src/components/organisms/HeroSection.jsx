'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { heroService } from '@/services/heroService';
import { LuBookOpen, LuClipboardList, LuMonitor } from 'react-icons/lu';

const quickLinks = [
    { label: 'Ingreso Académico',    Icon: LuBookOpen,      href: '/admisiones' },
    { label: 'Manual de Convivencia', Icon: LuClipboardList, href: '/manual-convivencia' },
    { label: 'Plataforma de Notas',  Icon: LuMonitor,       href: '/notas' },
];

export default function HeroSection({
    subtitle = 'Una institución educativa comprometida con la excelencia, los valores y el desarrollo integral de cada estudiante.',
}) {
    const [heroImg, setHeroImg]     = useState('');
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        heroService.get()
            .then(res => { if (res.data?.image?.url) setHeroImg(res.data.image.url); })
            .catch(() => {});
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden bg-neutral-950">

            {/* ── Imagen de fondo ── */}
            {heroImg && (
                <img
                    src={heroImg}
                    alt=""
                    aria-hidden
                    onLoad={() => setImgLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                        ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
            )}

            {/* ── Gradientes de legibilidad ── */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/25 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-neutral-950/50 pointer-events-none" />

            {/* ── Patrón de puntos ── */}
            <div className="absolute inset-0 dot-pattern opacity-[0.04] pointer-events-none" />

            {/* ── Blobs de color (solo sin imagen) ── */}
            {!heroImg && (
                <>
                    <div className="absolute -top-60 right-0 w-[700px] h-[700px] bg-brand-700 rounded-full opacity-[0.10] blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-brand-900 rounded-full opacity-25 blur-3xl pointer-events-none" />
                </>
            )}

            {/* ── Contenido principal ── */}
            <div className="flex-1 flex items-center relative z-10">
                <div className="max-w-6xl mx-auto px-6 py-28 w-full">
                    <div className="max-w-2xl flex flex-col gap-8">

                        {/* Título */}
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

                        {/* Subtítulo */}
                        <p className="animate-fade-in-up-d2 text-neutral-300 leading-relaxed"
                            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}>
                            {subtitle}
                        </p>


                    </div>
                </div>
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
