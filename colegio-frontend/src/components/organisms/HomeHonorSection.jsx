'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { honorService, gradeService } from '@/services/honorService';
import {
    LuSun, LuMoon, LuTrophy, LuBookOpen, LuStar, LuLeaf,
    LuUser, LuArrowRight, LuChevronLeft, LuChevronRight,
} from 'react-icons/lu';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

/* Paleta alineada con brand verde + acento dorado */
const CAT = {
    academico: {
        label: 'Académico', Icon: LuBookOpen,
        accent: '#10b981',
        bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.22)', text: '#6ee7b7',
        ring: 'rgba(16,185,129,0.35)',
    },
    valores: {
        label: 'Valores', Icon: LuStar,
        accent: '#d97706',
        bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.22)', text: '#fcd34d',
        ring: 'rgba(217,119,6,0.35)',
    },
    reciclaje: {
        label: 'Reciclaje', Icon: LuLeaf,
        accent: '#16a34a',
        bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.22)', text: '#86efac',
        ring: 'rgba(22,163,74,0.35)',
    },
};

const CATS = ['academico', 'valores', 'reciclaje'];

/* ── Tarjeta de estudiante ── */
function StudentCard({ entry, category }) {
    const cfg = CAT[category];
    const Icon = cfg.Icon;
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative flex flex-col items-center gap-4 p-5 rounded-2xl overflow-hidden cursor-default"
            style={{
                background: hovered
                    ? `linear-gradient(160deg, ${cfg.bg}, rgba(255,255,255,0.02))`
                    : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hovered ? cfg.border : 'rgba(255,255,255,0.07)'}`,
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered
                    ? `0 24px 48px rgba(0,0,0,0.4), 0 0 40px ${cfg.ring}`
                    : '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.3s cubic-bezier(.22,.68,0,1.2)',
            }}
        >
            {/* Ambient glow top */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 50% -10%, ${cfg.bg} 0%, transparent 65%)`,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }} />

            {/* Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.6rem] font-mono font-bold uppercase tracking-widest z-10"
                style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                <Icon className="w-3 h-3" />
                {cfg.label}
            </div>

            {/* Photo */}
            <div className="relative z-10">
                <div className="w-24 h-24 rounded-full overflow-hidden"
                    style={{
                        boxShadow: `0 0 0 2px ${hovered ? cfg.accent : 'rgba(255,255,255,0.08)'}, 0 0 ${hovered ? 24 : 0}px ${cfg.ring}`,
                        transition: 'box-shadow 0.3s ease',
                    }}>
                    {entry?.photo?.url ? (
                        <img src={entry.photo.url} alt={entry.studentName}
                            className="w-full h-full object-cover"
                            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${cfg.accent}18, ${cfg.accent}06)` }}>
                            <LuUser className="w-10 h-10" style={{ color: `${cfg.accent}50` }} />
                        </div>
                    )}
                </div>
                {/* Category badge on photo */}
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{ background: cfg.accent, borderColor: '#0a0f0a' }}>
                    <Icon className="w-2.5 h-2.5 text-white" />
                </div>
            </div>

            {/* Name */}
            <div className="text-center z-10">
                {entry ? (
                    <>
                        <p className="font-display font-black text-white text-sm leading-snug">
                            {entry.studentName}
                        </p>
                        <div className="h-px w-8 rounded-full mx-auto mt-2"
                            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />
                        {entry.grade?.name && (
                            <p className="text-[0.65rem] mt-1.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {entry.grade.name}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.15)' }}>Sin asignar</p>
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
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const [entries,     setEntries]     = useState([]);
    const [grades,      setGrades]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [jornada,     setJornada]     = useState('manana');
    const [paused,      setPaused]      = useState(false);
    const autoPlayRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [boardData, gradeData] = await Promise.all([
                    honorService.getBoard(year, month),
                    gradeService.getAll(),
                ]);
                setEntries(boardData.data || []);
                setGrades(gradeData.data  || []);
            } catch {
                setEntries([]); setGrades([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month]);

    const byGrade = useMemo(() => {
        const map = {};
        entries.forEach(e => {
            const id = e.grade?._id || e.grade;
            if (!map[id]) map[id] = { name: e.grade?.name || 'Sin grado', order: e.grade?.order ?? 99, entries: {} };
            map[id].entries[e.category] = e;
        });
        return map;
    }, [entries]);

    const sortedGrades = useMemo(() =>
        grades
            .filter(g => (g.jornada || 'manana') === jornada)
            .map(g => ({ _id: g._id, name: g.name, order: g.order, entries: byGrade[g._id]?.entries || {} }))
            .sort((a, b) => a.order - b.order),
        [grades, jornada, byGrade]
    );

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

            {/* Ambient blobs — verde institucional */}
            <div className="absolute -top-60 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.07), transparent 65%)' }} />
            <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 65%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.04), transparent 65%)' }} />

            {/* Dot pattern verde */}
            <div className="absolute inset-0 dot-pattern opacity-[0.035] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="block text-xs font-mono font-bold uppercase tracking-[0.25em] mb-4"
                        style={{ color: 'rgba(22,163,74,0.7)' }}>
                        {MONTHS[month - 1]} · {year}
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
                        Reconocimientos mensuales a nuestros estudiantes destacados
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

                {sortedGrades.length === 0 ? (
                    <div className="text-center py-16">
                        <LuTrophy className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(22,163,74,0.25)' }} />
                        <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            No hay grados registrados para esta jornada.
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

                        {/* Cards */}
                        <div key={`${safeIndex}-${jornada}`}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
                            {CATS.map(cat => (
                                <StudentCard
                                    key={cat}
                                    entry={activeGrade.entries[cat]}
                                    category={cat}
                                />
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
