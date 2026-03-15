'use client';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import HonorBoard from '@/components/organisms/HonorBoard';
import MonthSelector from '@/components/molecules/MonthSelector';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import { honorService, gradeService } from '@/services/honorService';

export default function CuadroHonorPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [entries, setEntries] = useState([]);
    const [grades, setGrades] = useState([]);
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
            setEntries([]);
            setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(year, month);
    }, [year, month]);

    const handleMonthChange = (newYear, newMonth) => {
        setYear(newYear);
        setMonth(newMonth);
    };

    // Filtrar entries por jornada usando los grados
    const jornadaGradeIds = new Set(
        grades.filter(g => (g.jornada || 'manana') === jornada).map(g => g._id)
    );
    const filteredEntries = entries.filter(e => {
        const gradeId = e.grade?._id || e.grade;
        return jornadaGradeIds.has(gradeId);
    });

    return (
        <MainLayout>
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <Heading level="h2">Cuadro de Honor</Heading>
                        <Paragraph color="muted" className="mt-1">
                            Reconocimiento mensual a nuestros mejores estudiantes
                        </Paragraph>
                    </div>
                    <MonthSelector year={year} month={month} onChange={handleMonthChange} />
                </div>

                {/* Selector de jornada */}
                <div className="flex justify-center gap-2 mb-8">
                    {[
                        { key: 'manana', label: 'Mañana', icon: '☀️' },
                        { key: 'tarde', label: 'Tarde', icon: '🌙' },
                    ].map(j => (
                        <button
                            key={j.key}
                            type="button"
                            onClick={() => setJornada(j.key)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                jornada === j.key
                                    ? 'bg-neutral-900 text-white shadow-md'
                                    : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                            }`}
                        >
                            {j.icon} Jornada {j.label}
                        </button>
                    ))}
                </div>

                <HonorBoard entries={filteredEntries} loading={loading} year={year} month={month} />
            </section>
        </MainLayout>
    );
}
