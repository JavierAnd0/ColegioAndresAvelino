'use client';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import EventCalendar from '@/components/organisms/EventCalendar';
import { eventService } from '@/services/eventService';

export default function CalendarioPage() {
    const now = new Date();

    // Guardamos mes como 1-12 (no 0-11)
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setCategory] = useState('all');

    const fetchEvents = async (y, m) => {
        setLoading(true);
        try {
            console.log(`Fetching events for ${y}/${m}`); // ← debug
            const data = await eventService.getByMonth(y, m);
            console.log('Events received:', data);         // ← debug

            let filtered = data.data || [];
            if (activeCategory !== 'all') {
                filtered = filtered.filter(e => e.category === activeCategory);
            }
            setEvents(filtered);
        } catch (error) {
            console.error('Error cargando eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar eventos cuando cambie mes, año o categoría
    useEffect(() => {
        fetchEvents(year, month);
    }, [month, year, activeCategory]);

    // EventCalendar llama esto con (monthIndex 0-11, year)
    // Nosotros guardamos mes como 1-12, así que sumamos 1
    const handleMonthChange = (monthIndex, newYear) => {
        setMonth(monthIndex + 1);
        setYear(newYear);
    };

    return (
        <MainLayout>
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