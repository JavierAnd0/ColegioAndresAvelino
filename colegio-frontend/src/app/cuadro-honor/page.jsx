'use client';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import HonorBoard from '@/components/organisms/HonorBoard';
import MonthSelector from '@/components/molecules/MonthSelector';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import { honorService } from '@/services/honorService';

export default function CuadroHonorPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBoard = async (y, m) => {
        setLoading(true);
        try {
            const data = await honorService.getBoard(y, m);
            setEntries(data.data || []);
        } catch {
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard(year, month);
    }, [year, month]);

    const handleMonthChange = (newYear, newMonth) => {
        setYear(newYear);
        setMonth(newMonth);
    };

    return (
        <MainLayout>
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Heading level="h2">Cuadro de Honor</Heading>
                        <Paragraph color="muted" className="mt-1">
                            Reconocimiento mensual a nuestros mejores estudiantes
                        </Paragraph>
                    </div>
                    <MonthSelector year={year} month={month} onChange={handleMonthChange} />
                </div>

                <HonorBoard entries={entries} loading={loading} year={year} month={month} />
            </section>
        </MainLayout>
    );
}
