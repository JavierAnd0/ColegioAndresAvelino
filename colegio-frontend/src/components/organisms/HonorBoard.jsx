'use client';
import HonorStudentCard from '@/components/molecules/HonorStudentCard';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Spinner from '@/components/atoms/Spinner';

const CATEGORIES_ORDER = ['academico', 'valores', 'reciclaje'];

export default function HonorBoard({ entries = [], loading = false, year, month }) {
    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size="lg" />
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-5xl">🏆</span>
                <Heading level="h4" className="text-neutral-500">
                    Sin cuadro de honor
                </Heading>
                <Paragraph color="muted">
                    No hay cuadro de honor para este mes.
                </Paragraph>
            </div>
        );
    }

    // Agrupar entries por grado
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

    const sortedGrades = Object.values(byGrade).sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col gap-8">
            {sortedGrades.map((gradeGroup) => (
                <div key={gradeGroup.name} className="bg-neutral-50 rounded-2xl p-5 sm:p-6">
                    {/* Nombre del grado */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="h-8 w-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-mono text-xs font-bold">
                                {gradeGroup.name.charAt(0)}
                            </span>
                        </div>
                        <Heading level="h5">{gradeGroup.name}</Heading>
                    </div>

                    {/* 3 cards de estudiantes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {CATEGORIES_ORDER.map(cat => {
                            const entry = gradeGroup.entries[cat];
                            if (!entry) {
                                return (
                                    <div key={cat} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-dashed border-neutral-200 min-h-[160px]">
                                        <span className="text-neutral-300 text-sm">Sin asignar</span>
                                    </div>
                                );
                            }
                            return (
                                <HonorStudentCard
                                    key={entry._id}
                                    studentName={entry.studentName}
                                    photo={entry.photo}
                                    category={entry.category}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
