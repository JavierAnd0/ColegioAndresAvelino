'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { honorService } from '@/services/honorService';
import { periodService } from '@/services/periodService';
import {
    LuSun, LuMoon, LuTrophy,
    LuUser, LuArrowRight, LuChevronLeft, LuChevronRight,
} from 'react-icons/lu';

const POS = {
    1: {
        label: 'Primer Puesto', medal: '🥇',
        accent: '#fbbf24', // Premium gold
        bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.4)', text: '#fde68a',
        ring: 'rgba(251,191,36,0.5)', height: '260px',
    },
    2: {
        label: 'Segundo Puesto', medal: '🥈',
        accent: '#94a3b8', // Sleek silver
        bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.4)', text: '#f1f5f9',
        ring: 'rgba(148,163,184,0.5)', height: '180px',
    },
    3: {
        label: 'Tercer Puesto', medal: '🥉',
        accent: '#c2410c', // Deep bronze
        bg: 'rgba(194,65,12,0.08)', border: 'rgba(194,65,12,0.4)', text: '#ffedd5',
        ring: 'rgba(194,65,12,0.5)', height: '130px',
    },
};

/* ── Tarjeta de estudiante ── */
function StudentCard({ entry, position }) {
    const cfg = POS[position];
    const [hovered, setHovered] = useState(false);

    // Dynamic scaling for podium effect on desktop
    const isFirst = position === 1;
    const baseScale = isFirst ? 'sm:scale-[1.15] z-20' : 'sm:scale-95 z-10';

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative flex flex-col items-center gap-5 p-6 rounded-3xl overflow-hidden cursor-default w-full ${baseScale} transform-gpu`}
            style={{
                background: hovered
                    ? `linear-gradient(160deg, ${cfg.bg}, rgba(5,10,5,0.8))`
                    : 'rgba(5,10,5,0.4)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${hovered ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                boxShadow: hovered
                    ? `0 30px 60px rgba(0,0,0,0.6), 0 0 45px ${cfg.ring}`
                    : '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
        >
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% -20%, ${cfg.bg} 0%, transparent 70%)`,
                    opacity: hovered ? 1 : 0.5,
                    transition: 'opacity 0.5s ease',
                }} />

            {/* Position badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.65rem] font-mono font-bold uppercase tracking-widest z-10"
                style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, boxShadow: `0 4px 12px ${cfg.ring}40` }}>
                <span className="text-sm">{cfg.medal}</span>
                {cfg.label}
            </div>

            {/* Photo */}
            <div className="relative z-10 mt-2">
                <div className={`${isFirst ? 'w-28 h-28' : 'w-24 h-24'} rounded-full overflow-hidden`}
                    style={{
                        boxShadow: `0 0 0 2px ${hovered ? cfg.accent : 'rgba(255,255,255,0.08)'}, 0 0 ${hovered ? 30 : 0}px ${cfg.ring}`,
                        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}>
                    {entry?.photo?.url ? (
                        <img src={entry.photo.url} alt={entry.studentName}
                            className="w-full h-full object-cover"
                            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${cfg.accent}15, ${cfg.accent}05)` }}>
                            <LuUser className={`${isFirst ? 'w-12 h-12' : 'w-10 h-10'}`} style={{ color: `${cfg.accent}60` }} />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black"
                    style={{ background: cfg.accent, borderColor: '#0a0f0a', color: '#000', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    {position}
                </div>
            </div>

            {/* Name */}
            <div className="text-center z-10 mt-2">
                {entry ? (
                    <>
                        <p className={`font-display font-black text-white leading-tight ${isFirst ? 'text-lg' : 'text-base'}`}>
                            {entry.studentName}
                        </p>
                        <div className={`h-px rounded-full mx-auto mt-3 ${hovered ? 'w-12' : 'w-6'}`}
                            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`, transition: 'width 0.4s ease' }} />
                        {entry.grade?.name && (
                            <p className="text-[0.65rem] mt-2 font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {entry.grade.name}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Sin asignar</p>
                )}
            </div>
        </div>
    );
}

/* ── Skeleton ── */
function LoadingSkeleton() {
    return (
        <section className="relative py-24 overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #070d07 0%, #0d180d 50%, #060c06 100%)' }}>
            <div className="max-w-5xl mx-auto px-4 text-center">
                <div className="h-3 w-28 rounded-full animate-pulse mx-auto mb-5"
                    style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-12 w-64 rounded-2xl animate-pulse mx-auto mb-10"
                    style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="flex justify-center gap-3 mb-10">
                    {[1, 2].map(i => (
                        <div key={i} className="h-10 w-36 rounded-xl animate-pulse"
                            style={{ background: 'rgba(255,255,255,0.06)' }} />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-5 max-w-3xl mx-auto">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl p-5 animate-pulse flex flex-col items-center gap-4"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            <div className="w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            <div className="h-4 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Componente principal ── */
export default function HomeHonorSection() {
    const [entries,     setEntries]     = useState([]);
    const [activePeriod, setActivePeriod] = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [jornada,     setJornada]     = useState('manana');
    const [paused,      setPaused]      = useState(false);
    const autoPlayRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const periodData = await periodService.getActive();
                const period = periodData.data;
                setActivePeriod(period);
                if (period) {
                    const boardData = await honorService.getBoard(period._id);
                    setEntries(boardData.data || []);
                }
            } catch {
                setEntries([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sortedGrades = useMemo(() => {
        const map = {};
        entries
            .filter(e => e.jornada === jornada)
            .forEach(e => {
                const id = e.grade?._id || e.grade;
                if (!map[id]) map[id] = { name: e.grade?.name || 'Sin grado', order: e.grade?.order ?? 99, entries: {} };
                map[id].entries[e.position] = e;
            });
        return Object.values(map).sort((a, b) => a.order - b.order);
    }, [entries, jornada]);

    useEffect(() => { setActiveIndex(0); }, [jornada]);

    useEffect(() => {
        if (sortedGrades.length <= 1 || paused) return;
        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % sortedGrades.length);
        }, 5000);
        return () => clearInterval(autoPlayRef.current);
    }, [sortedGrades.length, paused]);

    const goTo = useCallback((index) => {
        setActiveIndex(index);
        setPaused(true);
        setTimeout(() => setPaused(false), 8000);
    }, []);

    const prev = useCallback(() => goTo((activeIndex - 1 + sortedGrades.length) % sortedGrades.length), [activeIndex, sortedGrades.length, goTo]);
    const next = useCallback(() => goTo((activeIndex + 1) % sortedGrades.length), [activeIndex, sortedGrades.length, goTo]);

    if (loading) return <LoadingSkeleton />;

    const safeIndex   = sortedGrades.length > 0 ? Math.min(activeIndex, sortedGrades.length - 1) : 0;
    const activeGrade = sortedGrades[safeIndex];

    return (
        <section className="relative py-24 overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #070d07 0%, #0e1a0e 55%, #060c06 100%)' }}>

            <div className="absolute -top-60 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.07), transparent 65%)' }} />
            <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 65%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.04), transparent 65%)' }} />

            <div className="absolute inset-0 dot-pattern opacity-[0.035] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="block text-xs font-mono font-bold uppercase tracking-[0.25em] mb-4"
                        style={{ color: 'rgba(22,163,74,0.7)' }}>
                        {activePeriod ? `${activePeriod.name} · ${activePeriod.year}` : 'Reconocimientos por periodo'}
                    </span>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-16"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(22,163,74,0.35))' }} />
                        <h2 className="font-display font-black text-white text-4xl md:text-5xl leading-none">
                            Cuadro de{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #facc15 0%, #d97706 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>Honor</span>
                        </h2>
                        <div className="h-px w-16"
                            style={{ background: 'linear-gradient(90deg, rgba(22,163,74,0.35), transparent)' }} />
                    </div>
                    <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Reconocimientos a nuestros estudiantes destacados del periodo
                    </p>
                </div>

                {/* Jornada toggle */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-1 p-1 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {[
                            { key: 'manana', label: 'Jornada Mañana', Icon: LuSun },
                            { key: 'tarde',  label: 'Jornada Tarde',  Icon: LuMoon },
                        ].map(j => (
                            <button key={j.key} type="button" onClick={() => setJornada(j.key)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                                style={jornada === j.key
                                    ? {
                                        background: 'rgba(22,163,74,0.18)',
                                        color: '#86efac',
                                        boxShadow: '0 2px 12px rgba(22,163,74,0.15)',
                                        border: '1px solid rgba(22,163,74,0.25)',
                                      }
                                    : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }}>
                                <j.Icon className="w-4 h-4" />
                                {j.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!activePeriod || sortedGrades.length === 0 ? (
                    <div className="text-center py-16">
                        <LuTrophy className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(22,163,74,0.25)' }} />
                        <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {!activePeriod ? 'No hay un periodo activo.' : 'No hay grados registrados para esta jornada.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Grado activo + navegación */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {sortedGrades.length > 1 && (
                                <button onClick={prev}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                                    <LuChevronLeft className="w-4 h-4" />
                                </button>
                            )}
                            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl"
                                style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
                                <LuTrophy className="w-4 h-4 flex-shrink-0" style={{ color: '#facc15' }} />
                                <span className="font-display font-black text-white text-sm tracking-wide">
                                    {activeGrade.name}
                                </span>
                                {sortedGrades.length > 1 && (
                                    <span className="text-xs font-mono ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                        {safeIndex + 1}/{sortedGrades.length}
                                    </span>
                                )}
                            </div>
                            {sortedGrades.length > 1 && (
                                <button onClick={next}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                                    <LuChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Cards de posiciones - Podium Layout */}
                        <div key={`${safeIndex}-${jornada}`}
                            className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 sm:gap-2 max-w-4xl mx-auto mt-8 sm:mt-16 sm:px-10">
                            {[2, 1, 3].map((pos, i) => (
                                <div key={pos} className={`w-full sm:w-1/3 flex flex-col items-center ${pos === 1 ? 'order-first sm:order-none' : ''}`}>
                                    {/* The Card */}
                                    <StudentCard
                                        entry={activeGrade.entries[pos]}
                                        position={pos}
                                    />
                                    {/* Desktop Podium Pedestal */}
                                    <div className="hidden sm:flex w-[85%] -mt-6 pt-6 flex-col items-center justify-center rounded-t-xl relative z-0"
                                         style={{ 
                                            height: POS[pos].height,
                                            background: `linear-gradient(180deg, ${POS[pos].bg} 0%, rgba(0,0,0,0) 100%)`,
                                            borderTop: `3px solid ${POS[pos].accent}`,
                                            boxShadow: `0 -10px 40px -10px ${POS[pos].accent}50`,
                                            borderLeft: `1px solid rgba(255,255,255,0.04)`,
                                            borderRight: `1px solid rgba(255,255,255,0.04)`,
                                        }}>
                                        {/* Noise Texture */}
                                        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                                             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
                                        
                                        {/* Top Glow Blur */}
                                        <div className="absolute top-0 inset-x-0 h-32 blur-[40px] pointer-events-none" style={{ background: POS[pos].accent, opacity: 0.15 }} />
                                        
                                        {/* Huge Position Number */}
                                        <span className="font-display font-black text-[5rem] leading-none mix-blend-plus-lighter relative z-10" 
                                              style={{ 
                                                  color: POS[pos].accent, 
                                                  opacity: pos === 1 ? 0.35 : 0.25, 
                                                  textShadow: `0 10px 40px ${POS[pos].accent}` 
                                              }}>
                                            {pos}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progress dots */}
                        {sortedGrades.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-8">
                                {sortedGrades.map((_, i) => (
                                    <button key={i} onClick={() => goTo(i)}
                                        className="rounded-full transition-all duration-300 cursor-pointer"
                                        style={{
                                            width: i === safeIndex ? '24px' : '6px',
                                            height: '6px',
                                            background: i === safeIndex
                                                ? '#16a34a'
                                                : 'rgba(255,255,255,0.12)',
                                        }} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                <div className="text-center mt-12">
                    <Link href="/cuadro-honor"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group"
                        style={{
                            background: 'rgba(22,163,74,0.1)',
                            border: '1px solid rgba(22,163,74,0.25)',
                            color: '#86efac',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(22,163,74,0.18)';
                            e.currentTarget.style.borderColor = 'rgba(22,163,74,0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(22,163,74,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(22,163,74,0.25)';
                        }}>
                        Ver cuadro completo
                        <LuArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
