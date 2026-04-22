'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/templates/AdminLayout';
import Spinner from '@/components/atoms/Spinner';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/blogService';
import { eventService } from '@/services/eventService';
import { activityService } from '@/services/activityService';
import { teacherService } from '@/services/teacherService';
import { honorService, gradeService } from '@/services/honorService';
import { periodService } from '@/services/periodService';
import { carouselService } from '@/services/carouselService';
import { heroService } from '@/services/heroService';
import {
    LuFileText, LuCalendar, LuBookOpen, LuUsers, LuImages,
    LuTrophy, LuRefreshCw, LuArrowRight, LuCheck, LuX,
    LuTriangleAlert, LuLayoutTemplate, LuGraduationCap,
    LuCircleDot, LuClock, LuExternalLink,
} from 'react-icons/lu';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Hoy';
    if (d === 1) return 'Ayer';
    if (d < 7) return `Hace ${d} días`;
    if (d < 30) return `Hace ${Math.floor(d / 7)} sem.`;
    return `Hace ${Math.floor(d / 30)} mes.`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, colorClass, bgClass, href, warn }) {
    return (
        <Link href={href}
            className={`group flex flex-col gap-4 p-5 rounded-2xl border bg-white
                hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
                ${warn ? 'border-orange-200 bg-orange-50/40' : 'border-neutral-200'}`}
        >
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <LuArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
                <p className="text-2xl font-black text-neutral-900 leading-none">{value}</p>
                <p className="text-sm font-medium text-neutral-500 mt-1">{label}</p>
                {sub && <p className={`text-xs mt-1 ${warn ? 'text-orange-600 font-semibold' : 'text-neutral-400'}`}>{sub}</p>}
            </div>
        </Link>
    );
}

function MiniBar({ value, total, colorClass }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-mono font-bold text-neutral-500 w-8 text-right">{pct}%</span>
        </div>
    );
}

const EVENT_COLORS = {
    académico:  { bg: 'bg-blue-100',   text: 'text-blue-700' },
    cultural:   { bg: 'bg-purple-100', text: 'text-purple-700' },
    deportivo:  { bg: 'bg-green-100',  text: 'text-green-700' },
    cívico:     { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    otro:       { bg: 'bg-neutral-100',text: 'text-neutral-600' },
};

function EventBadge({ category }) {
    const c = EVENT_COLORS[category?.toLowerCase()] || EVENT_COLORS.otro;
    return (
        <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {category || 'Evento'}
        </span>
    );
}

const STATUS_STYLES = {
    publicado: 'bg-green-100 text-green-700',
    borrador:  'bg-neutral-100 text-neutral-500',
    pendiente: 'bg-yellow-100 text-yellow-700',
    rechazado: 'bg-red-100 text-red-600',
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { user } = useAuth();

    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [postTab, setPostTab]       = useState('todos');
    const [eventTab, setEventTab]     = useState('proximos');
    const [actLoading, setActLoading] = useState({});

    const fetchAll = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const [
                allPosts, upcomingEvents, pendingActs,
                teachersRes, periodsRes, gradesRes,
                carouselRes, heroRes,
            ] = await Promise.allSettled([
                blogService.getAll({ limit: 100 }),
                eventService.getAll({ limit: 300 }),
                activityService.getPending(),
                teacherService.getAllAdmin(),
                periodService.getAll(),
                gradeService.getAll(),
                carouselService.getAdmin(),
                heroService.get(),
            ]);

            const posts     = allPosts.value?.data       || [];
            const allEvents = upcomingEvents.value?.data || [];
            const pending = pendingActs.value?.data     || [];
            const teachers = teachersRes.value?.data?.data
                          ?? teachersRes.value?.data    ?? [];
            const months   = periodsRes.value?.data      || [];
            const grades   = gradesRes.value?.data      || [];
            const slides   = carouselRes.value?.data    || [];
            const hero     = heroRes.value?.data        || null;

            const _now = new Date();
            setData({
                posts: {
                    all:       posts,
                    published: posts.filter(p => p.status === 'publicado'),
                    drafts:    posts.filter(p => p.status === 'borrador'),
                },
                events: {
                    upcoming: allEvents.filter(e => new Date(e.startDate || e.date) >= _now)
                                       .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date)),
                    past:     allEvents.filter(e => new Date(e.startDate || e.date) < _now)
                                       .sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date)),
                },
                pending,
                teachers: Array.isArray(teachers) ? teachers : [],
                months,
                grades: Array.isArray(grades) ? grades : [],
                slides,
                activeSlides: slides.filter(s => s.active),
                hero,
            });
            setLastUpdated(new Date());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleApprove = async (id) => {
        setActLoading(p => ({ ...p, [id]: 'approve' }));
        try {
            await activityService.approve(id);
            setData(d => ({ ...d, pending: d.pending.filter(a => a._id !== id) }));
        } finally {
            setActLoading(p => ({ ...p, [id]: null }));
        }
    };

    const handleReject = async (id) => {
        setActLoading(p => ({ ...p, [id]: 'reject' }));
        try {
            await activityService.reject(id);
            setData(d => ({ ...d, pending: d.pending.filter(a => a._id !== id) }));
        } finally {
            setActLoading(p => ({ ...p, [id]: null }));
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        </AdminLayout>
    );

    const { posts, events, pending, teachers, months, grades, slides, activeSlides, hero } = data;

    const filteredPosts  = postTab === 'publicados' ? posts.published
        : postTab === 'borradores' ? posts.drafts
        : posts.all;

    const eventsToShow   = eventTab === 'proximos' ? events.upcoming : events.past;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    return (
        <AdminLayout>
            <div className="flex flex-col gap-7">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1">
                            {greeting}, {user?.name?.split(' ')[0] || 'Admin'}
                        </p>
                        <h1 className="font-display text-2xl font-black text-neutral-900">Dashboard</h1>
                        {lastUpdated && (
                            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                                <LuClock className="w-3 h-3" />
                                Actualizado {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => fetchAll(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200
                            bg-white text-sm font-medium text-neutral-600 hover:bg-neutral-50
                            transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* ── KPIs ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <KpiCard
                        icon={LuFileText}
                        label="Posts publicados"
                        value={posts.published.length}
                        sub={`${posts.drafts.length} borrador${posts.drafts.length !== 1 ? 'es' : ''}`}
                        colorClass="text-blue-600" bgClass="bg-blue-50"
                        href="/admin/blog"
                    />
                    <KpiCard
                        icon={LuBookOpen}
                        label="Actividades pendientes"
                        value={pending.length}
                        sub={pending.length > 0 ? 'Requieren revisión' : 'Todo al día'}
                        colorClass={pending.length > 0 ? 'text-orange-600' : 'text-green-600'}
                        bgClass={pending.length > 0 ? 'bg-orange-50' : 'bg-green-50'}
                        href="/admin/actividades"
                        warn={pending.length > 0}
                    />
                    <KpiCard
                        icon={LuCalendar}
                        label="Eventos próximos"
                        value={events.upcoming.length}
                        sub="En las próximas semanas"
                        colorClass="text-brand-600" bgClass="bg-brand-50"
                        href="/admin/eventos"
                    />
                    <KpiCard
                        icon={LuUsers}
                        label="Docentes"
                        value={teachers.length}
                        sub={`${grades.length} grados`}
                        colorClass="text-purple-600" bgClass="bg-purple-50"
                        href="/admin/docentes"
                    />
                    <KpiCard
                        icon={LuImages}
                        label="Slides activos"
                        value={activeSlides.length}
                        sub={`${slides.length} en total`}
                        colorClass="text-teal-600" bgClass="bg-teal-50"
                        href="/admin/carousel"
                    />
                    <KpiCard
                        icon={LuTrophy}
                        label="Cuadro de honor"
                        value={months.length}
                        sub="Periodos registrados"
                        colorClass="text-yellow-600" bgClass="bg-yellow-50"
                        href="/admin/cuadro-honor"
                    />
                </div>

                {/* ── Fila media: análisis + eventos ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Análisis de contenido */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display font-bold text-neutral-900">Estado del contenido</h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Blog */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                                        <LuFileText className="w-3.5 h-3.5 text-blue-500" /> Blog
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        {posts.published.length} / {posts.all.length} publicados
                                    </span>
                                </div>
                                <MiniBar value={posts.published.length} total={Math.max(posts.all.length, 1)} colorClass="bg-blue-500" />
                            </div>

                            {/* Carousel */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                                        <LuImages className="w-3.5 h-3.5 text-teal-500" /> Carousel
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        {activeSlides.length} / {slides.length} activos
                                    </span>
                                </div>
                                <MiniBar value={activeSlides.length} total={Math.max(slides.length, 1)} colorClass="bg-teal-500" />
                            </div>

                            {/* Actividades pendientes */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                                        <LuBookOpen className="w-3.5 h-3.5 text-orange-500" /> Actividades
                                    </span>
                                    <span className="text-xs text-neutral-400">{pending.length} pendientes</span>
                                </div>
                                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                    {pending.length > 0 ? (
                                        <div className="h-full bg-orange-400 rounded-full animate-pulse" style={{ width: '100%' }} />
                                    ) : (
                                        <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }} />
                                    )}
                                </div>
                                <p className="text-[0.65rem] text-neutral-400 mt-1">
                                    {pending.length > 0 ? 'Hay actividades esperando aprobación' : 'Sin pendientes'}
                                </p>
                            </div>

                            {/* Hero */}
                            <div className="pt-3 border-t border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                                        <LuLayoutTemplate className="w-3.5 h-3.5 text-brand-500" /> Imagen del hero
                                    </span>
                                    {hero?.image?.url ? (
                                        <span className="text-[0.65rem] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                            Configurada
                                        </span>
                                    ) : (
                                        <span className="text-[0.65rem] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                            Sin imagen
                                        </span>
                                    )}
                                </div>
                                {!hero?.image?.url && (
                                    <Link href="/admin/carousel"
                                        className="text-[0.65rem] text-brand-600 font-semibold mt-1 inline-flex items-center gap-1 hover:underline">
                                        Configurar ahora <LuArrowRight className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Eventos */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="font-display font-bold text-neutral-900">Eventos</h2>
                            <div className="flex items-center gap-1">
                                <div className="flex items-center bg-neutral-100 rounded-lg p-1 gap-1">
                                    {[
                                        { key: 'proximos', label: 'Próximos', count: events.upcoming.length },
                                        { key: 'pasados',  label: 'Pasados',  count: events.past.length },
                                    ].map(tab => (
                                        <button key={tab.key} onClick={() => setEventTab(tab.key)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer
                                                ${eventTab === tab.key
                                                    ? 'bg-white text-neutral-900 shadow-sm'
                                                    : 'text-neutral-500 hover:text-neutral-700'}`}>
                                            {tab.label}
                                            <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold
                                                ${eventTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-neutral-200 text-neutral-500'}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <Link href="/admin/eventos"
                                    className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1 ml-1">
                                    Ver todos <LuArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {eventsToShow.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
                                <LuCalendar className="w-8 h-8" />
                                <p className="text-sm">
                                    {eventTab === 'proximos' ? 'No hay eventos próximos' : 'No hay eventos pasados'}
                                </p>
                                {eventTab === 'proximos' && (
                                    <Link href="/admin/eventos"
                                        className="text-xs text-brand-600 font-semibold hover:underline">
                                        Crear evento
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
                                {eventsToShow.slice(0, 8).map(ev => (
                                    <div key={ev._id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group">
                                        <div className="flex-shrink-0 w-12 text-center">
                                            <p className={`text-lg font-black leading-none ${eventTab === 'pasados' ? 'text-neutral-400' : 'text-neutral-900'}`}>
                                                {new Date(ev.date || ev.startDate).getDate()}
                                            </p>
                                            <p className="text-[0.6rem] uppercase font-bold text-neutral-400 tracking-wider">
                                                {new Date(ev.date || ev.startDate).toLocaleDateString('es-CO', { month: 'short' })}
                                            </p>
                                        </div>
                                        <div className="w-px h-8 bg-neutral-200 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${eventTab === 'pasados' ? 'text-neutral-500' : 'text-neutral-800'}`}>
                                                {ev.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <EventBadge category={ev.category} />
                                            </div>
                                        </div>
                                        <LuCircleDot className="w-4 h-4 text-neutral-300 flex-shrink-0 group-hover:text-brand-400 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Fila inferior: posts + pendientes ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Posts con filtro */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="font-display font-bold text-neutral-900">Publicaciones</h2>
                            <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 overflow-x-auto">
                                {[
                                    { key: 'todos',       label: 'Todos',     count: posts.all.length },
                                    { key: 'publicados',  label: 'Publicados',count: posts.published.length },
                                    { key: 'borradores',  label: 'Borradores',count: posts.drafts.length },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setPostTab(tab.key)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer
                                            ${postTab === tab.key
                                                ? 'bg-white text-neutral-900 shadow-sm'
                                                : 'text-neutral-500 hover:text-neutral-700'
                                            }`}
                                    >
                                        {tab.label}
                                        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold
                                            ${postTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-neutral-200 text-neutral-500'}`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
                                <LuFileText className="w-8 h-8" />
                                <p className="text-sm">No hay posts en esta categoría</p>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-neutral-100">
                                {filteredPosts.slice(0, 8).map(post => (
                                    <div key={post._id} className="flex items-center gap-3 py-2.5 group">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">{post.title}</p>
                                            <p className="text-[0.65rem] text-neutral-400 mt-0.5">
                                                {timeAgo(post.createdAt || post.publishedAt)}
                                            </p>
                                        </div>
                                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                                            ${STATUS_STYLES[post.status] || 'bg-neutral-100 text-neutral-500'}`}>
                                            {post.status}
                                        </span>
                                        <Link href={`/admin/blog/edit/${post._id}`}
                                            className="p-1.5 rounded-lg text-neutral-300 hover:text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0">
                                            <LuExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link href="/admin/blog"
                            className="flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-neutral-200
                                text-xs text-neutral-400 hover:text-brand-600 hover:border-brand-300 transition-colors">
                            Ver todas las publicaciones <LuArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Actividades pendientes */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display font-bold text-neutral-900">
                                Actividades pendientes
                            </h2>
                            {pending.length > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-[0.6rem] font-black">
                                    {pending.length}
                                </span>
                            )}
                        </div>

                        {pending.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3 text-center">
                                <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                                    <LuCheck className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-neutral-600">Todo al día</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">No hay actividades pendientes</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 overflow-y-auto max-h-[340px]">
                                {pending.map(act => (
                                    <div key={act._id}
                                        className="p-3 rounded-xl border border-orange-100 bg-orange-50/50 flex flex-col gap-2">
                                        <div className="flex items-start gap-2">
                                            <LuTriangleAlert className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs font-medium text-neutral-800 line-clamp-2 flex-1">
                                                {act.title}
                                            </p>
                                        </div>
                                        {act.type && (
                                            <span className="text-[0.6rem] font-bold bg-white border border-neutral-200 text-neutral-500 px-2 py-0.5 rounded-full w-fit">
                                                {act.type}
                                            </span>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(act._id)}
                                                disabled={!!actLoading[act._id]}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                                                    bg-green-600 hover:bg-green-700 text-white text-[0.65rem] font-bold
                                                    transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                {actLoading[act._id] === 'approve'
                                                    ? <Spinner size="xs" />
                                                    : <><LuCheck className="w-3 h-3" /> Aprobar</>
                                                }
                                            </button>
                                            <button
                                                onClick={() => handleReject(act._id)}
                                                disabled={!!actLoading[act._id]}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                                                    border border-red-200 text-red-600 hover:bg-red-50 text-[0.65rem] font-bold
                                                    transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                {actLoading[act._id] === 'reject'
                                                    ? <Spinner size="xs" />
                                                    : <><LuX className="w-3 h-3" /> Rechazar</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link href="/admin/actividades"
                            className="flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-neutral-200
                                text-xs text-neutral-400 hover:text-brand-600 hover:border-brand-300 transition-colors">
                            Gestionar actividades <LuArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* ── Accesos rápidos ── */}
                <div>
                    <h2 className="font-display font-bold text-neutral-900 mb-3">Accesos rápidos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                        {[
                            { label: 'Blog',         href: '/admin/blog',          Icon: LuFileText,      color: 'text-blue-600   bg-blue-50   border-blue-100' },
                            { label: 'Actividades',  href: '/admin/actividades',   Icon: LuBookOpen,      color: 'text-orange-600 bg-orange-50 border-orange-100' },
                            { label: 'Eventos',      href: '/admin/eventos',       Icon: LuCalendar,      color: 'text-brand-600  bg-brand-50  border-brand-100' },
                            { label: 'Docentes',     href: '/admin/docentes',      Icon: LuUsers,         color: 'text-purple-600 bg-purple-50 border-purple-100' },
                            { label: 'Carousel',     href: '/admin/carousel',      Icon: LuImages,        color: 'text-teal-600   bg-teal-50   border-teal-100' },
                            { label: 'Honor',        href: '/admin/cuadro-honor',  Icon: LuTrophy,        color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
                            { label: 'Grados',       href: '/admin/grados',        Icon: LuGraduationCap, color: 'text-neutral-700 bg-neutral-50 border-neutral-200' },
                            { label: 'Ver sitio',    href: '/',                    Icon: LuExternalLink,  color: 'text-neutral-500 bg-neutral-50 border-neutral-200' },
                        ].map(({ label, href, Icon, color }) => (
                            <Link key={href} href={href}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center
                                    hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 ${color}`}>
                                <Icon className="w-5 h-5" />
                                <span className="text-[0.65rem] font-bold">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
