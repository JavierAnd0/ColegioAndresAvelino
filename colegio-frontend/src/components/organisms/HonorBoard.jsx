'use client';
import { useRef, useEffect, useMemo, useState } from 'react';
import { LuTrophy, LuBookOpen, LuStar, LuLeaf, LuUser } from 'react-icons/lu';

const CATS = ['academico', 'valores', 'reciclaje'];

const CAT = {
    academico: {
        label: 'Mejor Académico', short: 'Académico',
        Icon: LuBookOpen,
        accent: '#3b82f6',
        cardBg: 'linear-gradient(145deg, #060d1f 0%, #0c1e40 50%, #0a1830 100%)',
        ring1: 'rgba(59,130,246,0.55)', ring2: 'rgba(59,130,246,0.2)',
        glow: '0 0 50px rgba(59,130,246,0.2)',
        badgeBg: 'rgba(59,130,246,0.12)', badgeText: '#93c5fd', badgeBorder: 'rgba(59,130,246,0.3)',
        shine: 'rgba(59,130,246,0.08)',
        headerAccent: '#3b82f6',
    },
    valores: {
        label: 'Mejor en Valores', short: 'Valores',
        Icon: LuStar,
        accent: '#eab308',
        cardBg: 'linear-gradient(145deg, #1a1000 0%, #2e1f00 50%, #221700 100%)',
        ring1: 'rgba(234,179,8,0.55)', ring2: 'rgba(234,179,8,0.2)',
        glow: '0 0 50px rgba(234,179,8,0.2)',
        badgeBg: 'rgba(234,179,8,0.12)', badgeText: '#fde68a', badgeBorder: 'rgba(234,179,8,0.3)',
        shine: 'rgba(234,179,8,0.08)',
        headerAccent: '#eab308',
    },
    reciclaje: {
        label: 'Mejor en Reciclaje', short: 'Reciclaje',
        Icon: LuLeaf,
        accent: '#22c55e',
        cardBg: 'linear-gradient(145deg, #001208 0%, #00230e 50%, #001a0a 100%)',
        ring1: 'rgba(34,197,94,0.55)', ring2: 'rgba(34,197,94,0.2)',
        glow: '0 0 50px rgba(34,197,94,0.2)',
        badgeBg: 'rgba(34,197,94,0.12)', badgeText: '#86efac', badgeBorder: 'rgba(34,197,94,0.3)',
        shine: 'rgba(34,197,94,0.08)',
        headerAccent: '#22c55e',
    },
};

/* ── Tarjeta de estudiante ── */
// Usa refs para hover: cero re-renders, transiciones 100% CSS nativo
function StudentCard({ entry, category, visible, delay }) {
    const cfg      = CAT[category];
    const Icon     = cfg.Icon;
    const hasPhoto = !!entry?.photo?.url;

    const rootRef  = useRef(null);
    const shineRef = useRef(null);
    const photoRef = useRef(null);

    const onEnter = () => {
        const el = rootRef.current;
        if (!el) return;
        el.style.transform  = 'translateY(-4px) scale(1.02)';
        el.style.boxShadow  = `0 20px 60px rgba(0,0,0,0.5), ${cfg.glow}`;
        el.style.borderColor = cfg.ring1;
        if (shineRef.current) shineRef.current.style.opacity = '1';
        if (photoRef.current) photoRef.current.style.boxShadow =
            `0 0 0 3px ${cfg.ring1}, 0 0 0 7px ${cfg.ring2}, 0 0 30px ${cfg.ring2}`;
    };

    const onLeave = () => {
        const el = rootRef.current;
        if (!el) return;
        el.style.transform   = 'translateY(0) scale(1)';
        el.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.4)';
        el.style.borderColor = 'rgba(255,255,255,0.06)';
        if (shineRef.current) shineRef.current.style.opacity = '0';
        if (photoRef.current) photoRef.current.style.boxShadow = `0 0 0 2px ${cfg.ring2}`;
    };

    return (
        <div
            ref={rootRef}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="relative flex flex-col items-center gap-5 p-7 rounded-3xl overflow-hidden cursor-default select-none"
            style={{
                background: cfg.cardBg,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease, border-color 0.35s ease, opacity 0.6s ease, translate 0.6s ease',
                opacity: visible ? 1 : 0,
                translate: visible ? '0 0' : '0 28px',
                transitionDelay: `${delay}ms`,
            }}
        >
            {/* Shine on hover */}
            <div ref={shineRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 50% -10%, ${cfg.shine} 0%, transparent 65%)`,
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                }} />

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}70, transparent)` }} />

            {/* Category badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.6rem] font-mono font-bold uppercase tracking-widest z-10 flex-shrink-0"
                style={{ background: cfg.badgeBg, color: cfg.badgeText, border: `1px solid ${cfg.badgeBorder}` }}>
                <Icon className="w-3 h-3" />
                {cfg.short}
            </div>

            {/* Photo */}
            <div className="relative z-10 flex-shrink-0">
                <div ref={photoRef}
                    className="w-32 h-32 rounded-full overflow-hidden"
                    style={{
                        boxShadow: `0 0 0 2px ${cfg.ring2}`,
                        transition: 'box-shadow 0.35s ease',
                    }}>
                    {hasPhoto ? (
                        <img src={entry.photo.url} alt={entry.studentName}
                            className="w-full h-full object-cover"
                            style={{ transition: 'transform 0.5s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${cfg.accent}18, ${cfg.accent}06)` }}>
                            <LuUser className="w-14 h-14" style={{ color: `${cfg.accent}50` }} />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center"
                    style={{ background: cfg.accent, borderColor: 'rgba(0,0,0,0.6)' }}>
                    <Icon className="w-3 h-3 text-black" />
                </div>
            </div>

            {/* Name */}
            <div className="text-center z-10 space-y-2">
                {entry ? (
                    <>
                        <p className="font-display font-black text-white text-base leading-snug">
                            {entry.studentName}
                        </p>
                        <div className="h-0.5 w-10 rounded-full mx-auto"
                            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />
                    </>
                ) : (
                    <p className="text-white/15 text-sm italic font-light">Sin asignar</p>
                )}
            </div>
        </div>
    );
}

/* ── Sección de grado con scroll-trigger ── */
function GradeSection({ gradeGroup, index }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.08 }
        );
        const el = ref.current;
        if (el) obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref}>
            {/* Grade header */}
            <div className="flex items-center gap-4 mb-7"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    transitionDelay: `${index * 40}ms`,
                }}>
                <div className="h-px flex-1"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12))' }} />
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <LuTrophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="font-display font-black text-white text-sm tracking-wide">
                        {gradeGroup.name}
                    </span>
                    <span className="text-[0.6rem] font-mono text-white/30 uppercase tracking-widest ml-1">
                        {Object.keys(gradeGroup.entries).length} honores
                    </span>
                </div>
                <div className="h-px flex-1"
                    style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.12), transparent)' }} />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
                {CATS.map((cat, catIdx) => (
                    <StudentCard
                        key={cat}
                        entry={gradeGroup.entries[cat]}
                        category={cat}
                        visible={visible}
                        delay={(index * 40) + (catIdx * 120)}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Skeleton ── */
function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-10">
            {[1, 2, 3].map(i => (
                <div key={i}>
                    <div className="flex items-center gap-4 mb-7">
                        <div className="h-px flex-1 bg-white/5 rounded" />
                        <div className="h-9 w-48 bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-px flex-1 bg-white/5 rounded" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="flex flex-col items-center gap-5 p-7 rounded-3xl animate-pulse"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="h-6 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                <div className="w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Empty state ── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
                <div className="absolute inset-0 rounded-full animate-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.2), transparent)', transform: 'scale(2)' }} />
                <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                    <LuTrophy className="w-12 h-12 text-yellow-500/40" />
                </div>
            </div>
            <div className="text-center">
                <p className="font-display font-bold text-white/70 text-xl">Sin cuadro de honor</p>
                <p className="text-white/30 text-sm mt-2 font-mono">No hay registros para este período.</p>
            </div>
        </div>
    );
}

/* ── Main export ── */
export default function HonorBoard({ entries = [], loading = false }) {
    const sortedGrades = useMemo(() => {
        if (!entries.length) return [];
        const byGrade = {};
        entries.forEach(entry => {
            const gradeId = entry.grade?._id || entry.grade;
            if (!byGrade[gradeId]) {
                byGrade[gradeId] = {
                    name: entry.grade?.name || 'Sin grado',
                    order: entry.grade?.order ?? 99,
                    entries: {},
                };
            }
            byGrade[gradeId].entries[entry.category] = entry;
        });
        return Object.values(byGrade).sort((a, b) => a.order - b.order);
    }, [entries]);

    if (loading) return <LoadingSkeleton />;
    if (!sortedGrades.length) return <EmptyState />;

    return (
        <div>
            {sortedGrades.map((gradeGroup, idx) => (
                <GradeSection key={gradeGroup.name} gradeGroup={gradeGroup} index={idx} />
            ))}
        </div>
    );
}
