'use client';
import * as Sentry from '@sentry/nextjs';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import EventCalendar from '@/components/organisms/EventCalendar';
import { eventService } from '@/services/eventService';

export default function CalendarioPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setCategory] = useState('all');

    const fetchEvents = async (y, m) => {
        setLoading(true);
        try {
            const data = await eventService.getByMonth(y, m);
            let filtered = data.data || [];
            if (activeCategory !== 'all') {
                filtered = filtered.filter(e => e.category === activeCategory);
            }
            setEvents(filtered);
        } catch (error) {
            Sentry.captureException(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(year, month); }, [month, year, activeCategory]);

    const handleMonthChange = (monthIndex, newYear) => {
        setMonth(monthIndex + 1);
        setYear(newYear);
    };

    return (
        <MainLayout>
            {/* ── Hero ── */}
            <section className="relative bg-neutral-950 overflow-hidden py-24">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-900 opacity-20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-yellow-900 opacity-10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-4">
                        Agenda institucional
                    </span>
                    <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-5">
                        Calendario de <span className="gradient-text">Eventos</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl">
                        Consulta todos los eventos, reuniones y actividades programadas por nuestra institución.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            <EventCalendar
                events={events}
                loading={loading}
                activeCategory={activeCategory}
                onCategoryChange={(cat) => setCategory(cat)}
                onMonthChange={handleMonthChange}
            />
        </MainLayout>
    );
}
