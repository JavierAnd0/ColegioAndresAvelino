'use client';
import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import HonorBoard from '@/components/organisms/HonorBoard';
import MonthSelector from '@/components/molecules/MonthSelector';
import { honorService, gradeService } from '@/services/honorService';
import { LuSun, LuMoon, LuTrophy, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/* ── Partículas de fondo ── */
function Stars() {
    const stars = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: (i * 37.7) % 100,
            y: (i * 53.3) % 100,
            size: (i % 3) + 1,
            dur: ((i % 4) + 2),
            delay: (i % 5) * 0.7,
            opacity: ((i % 5) + 2) / 10,
        })), []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map(s => (
                <div key={s.id}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        left: `${s.x}%`, top: `${s.y}%`,
                        width: `${s.size}px`, height: `${s.size}px`,
                        background: 'white', opacity: s.opacity,
                        animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
                    }} />
            ))}
        </div>
    );
}

export default function CuadroHonorPage() {
    const now = new Date();
    const [year, setYear]       = useState(now.getFullYear());
    const [month, setMonth]     = useState(now.getMonth() + 1);
    const [entries, setEntries] = useState([]);
    const [grades, setGrades]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [jornada, setJornada] = useState('manana');

    const fetchData = async (y, m) => {
        setLoading(true);
        try {
            const [boardData, gradeData] = await Promise.all([
                honorService.getBoard(y, m),
                gradeService.getAll(),
            ]);
            setEntries(boardData.data || []);
            setGrades(gradeData.data || []);
        } catch {
            setEntries([]); setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(year, month); }, [year, month]);

    const handleMonthChange = (y, m) => { setYear(y); setMonth(m); };

    const prevMonth = () => {
        if (month === 1) handleMonthChange(year - 1, 12);
        else handleMonthChange(year, month - 1);
    };
    const nextMonth = () => {
        if (month === 12) handleMonthChange(year + 1, 1);
        else handleMonthChange(year, month + 1);
    };

    const jornadaGradeIds = new Set(
        grades.filter(g => (g.jornada || 'manana') === jornada).map(g => g._id)
    );
    const filteredEntries = entries.filter(e => {
        const gradeId = e.grade?._id || e.grade;
        return jornadaGradeIds.has(gradeId);
    });

    const totalHonored = filteredEntries.length;

    return (
        <MainLayout>
            {/* ══════════════════════════════════════════════════════ HERO */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #020b18 0%, #050e1e 40%, #060c15 100%)', minHeight: '480px' }}>

                <Stars />

                {/* Blobs */}
                <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.07), transparent 70%)' }} />
                <div className="absolute top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.08), transparent 70%)' }} />
                <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)' }} />

                <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-28 text-center">

                    {/* Trofeo */}
                    <div className="relative inline-flex items-center justify-center mb-8">
                        <div className="absolute w-40 h-40 rounded-full animate-pulse pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.12), transparent)', animationDuration: '2.5s' }} />
                        <div className="absolute w-28 h-28 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.18), transparent)' }} />
                        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))',
                                border: '1px solid rgba(234,179,8,0.35)',
                                boxShadow: '0 0 40px rgba(234,179,8,0.2)',
                            }}>
                            <LuTrophy className="w-10 h-10 text-yellow-400" />
                        </div>
                    </div>

                    {/* Label */}
                    <span className="block text-xs font-mono font-bold uppercase tracking-[0.25em] mb-4"
                        style={{ color: 'rgba(234,179,8,0.7)' }}>
                        Reconocimientos mensuales · {year}
                    </span>

                    {/* Título */}
                    <h1 className="font-display font-black text-white leading-none tracking-tight mb-5"
                        style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
                        Cuadro de{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #facc15, #fbbf24, #f59e0b)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Honor</span>
                    </h1>

                    <p className="text-white/40 font-mono text-sm max-w-sm mx-auto mb-8">
                        Celebramos el esfuerzo y logros de nuestros mejores estudiantes
                    </p>

                    {/* Stats pill */}
                    {!loading && totalHonored > 0 && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="font-black text-white text-lg leading-none">{totalHonored}</span>
                            <span className="text-white/40 text-xs font-mono">estudiantes honrados este mes</span>
                        </div>
                    )}
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full"
                        style={{ fill: '#f9fafb' }}>
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ CONTROLES */}
            <section className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Jornada */}
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-neutral-200 shadow-sm">
                        {[
                            { key: 'manana', label: 'Mañana', Icon: LuSun },
                            { key: 'tarde',  label: 'Tarde',  Icon: LuMoon },
                        ].map(j => (
                            <button key={j.key} type="button" onClick={() => setJornada(j.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                                    ${jornada === j.key
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'}`}>
                                <j.Icon className="w-4 h-4" />
                                Jornada {j.label}
                            </button>
                        ))}
                    </div>

                    {/* Navegación de mes */}
                    <div className="flex items-center gap-3">
                        <button onClick={prevMonth}
                            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-colors cursor-pointer shadow-sm">
                            <LuChevronLeft className="w-4 h-4 text-neutral-500" />
                        </button>
                        <div className="px-5 py-2 rounded-xl bg-white border border-neutral-200 shadow-sm min-w-[160px] text-center">
                            <span className="font-display font-bold text-neutral-900 text-sm">
                                {MONTHS[month - 1]} {year}
                            </span>
                        </div>
                        <button onClick={nextMonth}
                            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-colors cursor-pointer shadow-sm">
                            <LuChevronRight className="w-4 h-4 text-neutral-500" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ BOARD */}
            <section style={{ background: 'linear-gradient(180deg, #060c15 0%, #040a12 100%)', minHeight: '60vh' }}>
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <HonorBoard entries={filteredEntries} loading={loading} year={year} month={month} />
                </div>
            </section>

        </MainLayout>
    );
}
