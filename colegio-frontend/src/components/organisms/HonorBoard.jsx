'use client';
import { useRef, useEffect, useMemo, useState } from 'react';
import { LuTrophy, LuUser } from 'react-icons/lu';

const POS = {
    1: {
        label: 'Primer Puesto',
        accent: '#fbbf24',
        cardBg: 'linear-gradient(145deg, #1a1200 0%, #2e2000 50%, #221800 100%)',
        ring1: 'rgba(251,191,36,0.55)', ring2: 'rgba(251,191,36,0.2)',
        glow: '0 0 50px rgba(251,191,36,0.25)',
        badgeBg: 'rgba(251,191,36,0.12)', badgeText: '#fde68a', badgeBorder: 'rgba(251,191,36,0.3)',
        shine: 'rgba(251,191,36,0.08)',
        podiumH: 80,
        podiumGrad: 'linear-gradient(180deg, #d97706 0%, #92400e 100%)',
        podiumText: '#fde68a',
        medal: '🥇',
    },
    2: {
        label: 'Segundo Puesto',
        accent: '#9ca3af',
        cardBg: 'linear-gradient(145deg, #0f0f0f 0%, #1c1c1c 50%, #141414 100%)',
        ring1: 'rgba(156,163,175,0.55)', ring2: 'rgba(156,163,175,0.2)',
        glow: '0 0 50px rgba(156,163,175,0.2)',
        badgeBg: 'rgba(156,163,175,0.12)', badgeText: '#d1d5db', badgeBorder: 'rgba(156,163,175,0.3)',
        shine: 'rgba(156,163,175,0.06)',
        podiumH: 56,
        podiumGrad: 'linear-gradient(180deg, #6b7280 0%, #374151 100%)',
        podiumText: '#e5e7eb',
        medal: '🥈',
    },
    3: {
        label: 'Tercer Puesto',
        accent: '#cd7c3a',
        cardBg: 'linear-gradient(145deg, #120800 0%, #1f1000 50%, #170c00 100%)',
        ring1: 'rgba(180,83,9,0.55)', ring2: 'rgba(180,83,9,0.2)',
        glow: '0 0 50px rgba(180,83,9,0.2)',
        badgeBg: 'rgba(180,83,9,0.12)', badgeText: '#fbbf87', badgeBorder: 'rgba(180,83,9,0.3)',
        shine: 'rgba(180,83,9,0.06)',
        podiumH: 40,
        podiumGrad: 'linear-gradient(180deg, #92400e 0%, #6b2f0a 100%)',
        podiumText: '#fbbf87',
        medal: '🥉',
    },
};

/* ── Tarjeta de estudiante ── */
function StudentCard({ entry, position, visible, delay, compact = false }) {
    const cfg = POS[position];
    const hasPhoto = !!entry?.photo?.url;
    const rootRef = useRef(null);
    const shineRef = useRef(null);
    const photoRef = useRef(null);

    const onEnter = () => {
        const el = rootRef.current;
        if (!el) return;
        el.style.transform = 'translateY(-4px) scale(1.02)';
        el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), ${cfg.glow}`;
        el.style.borderColor = cfg.ring1;
        if (shineRef.current) shineRef.current.style.opacity = '1';
        if (photoRef.current) photoRef.current.style.boxShadow =
            `0 0 0 3px ${cfg.ring1}, 0 0 0 7px ${cfg.ring2}, 0 0 30px ${cfg.ring2}`;
    };

    const onLeave = () => {
        const el = rootRef.current;
        if (!el) return;
        el.style.transform = 'translateY(0) scale(1)';
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
        el.style.borderColor = 'rgba(255,255,255,0.06)';
        if (shineRef.current) shineRef.current.style.opacity = '0';
        if (photoRef.current) photoRef.current.style.boxShadow = `0 0 0 2px ${cfg.ring2}`;
    };

    const photoSize = compact ? 'w-20 h-20' : position === 1 ? 'w-32 h-32' : 'w-28 h-28';
    const iconSize = compact ? 'w-10 h-10' : position === 1 ? 'w-14 h-14' : 'w-12 h-12';
    const padding = compact ? 'p-4' : 'p-6';

    return (
        <div
            ref={rootRef}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className={`relative flex flex-col items-center gap-4 ${padding} rounded-3xl overflow-hidden cursor-default select-none w-full`}
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
            <div ref={shineRef} className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 50% -10%, ${cfg.shine} 0%, transparent 65%)`,
                    opacity: 0, transition: 'opacity 0.35s ease',
                }} />

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}70, transparent)` }} />

            {/* Position badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.6rem] font-mono font-bold uppercase tracking-widest z-10 flex-shrink-0"
                style={{ background: cfg.badgeBg, color: cfg.badgeText, border: `1px solid ${cfg.badgeBorder}` }}>
                <span>{cfg.medal}</span>
                {cfg.label}
            </div>

            {/* Photo */}
            <div className="relative z-10 flex-shrink-0">
                <div ref={photoRef}
                    className={`${photoSize} rounded-full overflow-hidden`}
                    style={{ boxShadow: `0 0 0 2px ${cfg.ring2}`, transition: 'box-shadow 0.35s ease' }}>
                    {hasPhoto ? (
                        <img src={entry.photo.url} alt={entry.studentName}
                            className="w-full h-full object-cover"
                            style={{ transition: 'transform 0.5s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${cfg.accent}18, ${cfg.accent}06)` }}>
                            <LuUser className={`${iconSize}`} style={{ color: `${cfg.accent}50` }} />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black"
                    style={{ background: cfg.accent, borderColor: 'rgba(0,0,0,0.6)', color: '#000' }}>
                    {position}
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

/* ── Slot del podio (carta + bloque) ── */
function PodiumSlot({ entry, position, visible, delay }) {
    const cfg = POS[position];
    return (
        <div className="flex flex-col items-stretch" style={{ flex: 1, maxWidth: position === 1 ? '230px' : '190px' }}>
            <StudentCard entry={entry} position={position} visible={visible} delay={delay} />
            <div
                className="w-full rounded-t-xl flex items-end justify-center pb-3"
                style={{
                    height: `${cfg.podiumH}px`,
                    background: cfg.podiumGrad,
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.6s ease ${delay + 100}ms`,
                }}
            >
                <span className="font-black text-3xl leading-none" style={{ color: cfg.podiumText }}>
                    {position}
                </span>
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
            { threshold: 0.06 }
        );
        const el = ref.current;
        if (el) obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const base = index * 40;

    return (
        <div ref={ref}>
            {/* Grade header */}
            <div className="flex items-center gap-4 mb-8"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    transitionDelay: `${base}ms`,
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

            {/* Desktop: Podio — 2do izquierda, 1ro centro elevado, 3ro derecha */}
            <div className="hidden sm:flex items-end justify-center gap-3 mb-14">
                <PodiumSlot position={2} entry={gradeGroup.entries[2]} visible={visible} delay={base + 120} />
                <PodiumSlot position={1} entry={gradeGroup.entries[1]} visible={visible} delay={base + 0} />
                <PodiumSlot position={3} entry={gradeGroup.entries[3]} visible={visible} delay={base + 240} />
            </div>

            {/* Mobile: apilados verticalmente, 1ro arriba */}
            <div className="flex flex-col gap-4 sm:hidden mb-14">
                {[1, 2, 3].map((pos, i) => (
                    <StudentCard
                        key={pos}
                        entry={gradeGroup.entries[pos]}
                        position={pos}
                        visible={visible}
                        delay={base + i * 120}
                        compact
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
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-white/5 rounded" />
                        <div className="h-9 w-48 bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-px flex-1 bg-white/5 rounded" />
                    </div>
                    <div className="hidden sm:flex items-end justify-center gap-3">
                        {[56, 80, 40].map((h, j) => (
                            <div key={j} className="flex flex-col" style={{ flex: 1, maxWidth: j === 1 ? '230px' : '190px' }}>
                                <div className="animate-pulse rounded-3xl p-6 flex flex-col items-center gap-4"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="h-6 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                    <div className={`${j === 1 ? 'w-32 h-32' : 'w-28 h-28'} rounded-full`} style={{ background: 'rgba(255,255,255,0.06)' }} />
                                    <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                </div>
                                <div className="animate-pulse rounded-t-xl" style={{ height: `${h}px`, background: 'rgba(255,255,255,0.04)' }} />
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
                <p className="text-white/30 text-sm mt-2 font-mono">No hay registros para este periodo.</p>
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
            byGrade[gradeId].entries[entry.position] = entry;
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
