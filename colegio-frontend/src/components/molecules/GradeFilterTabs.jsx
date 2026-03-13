'use client';

const gradeLabels = {
    0: 'Preescolar',
    1: '1°',
    2: '2°',
    3: '3°',
    4: '4°',
    5: '5°',
    6: '6°',
    7: '7°',
    8: '8°',
    9: '9°',
    10: '10°',
    11: '11°',
};

export default function GradeFilterTabs({ grades = [], selected, onChange }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {/* Tab "Todos" */}
            <button
                type="button"
                onClick={() => onChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
                    ${selected === null
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
            >
                Todos
            </button>

            {/* Tabs de grados */}
            {grades.map((grade) => (
                <button
                    key={grade._id}
                    type="button"
                    onClick={() => onChange(grade.order)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
                        ${selected === grade.order
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                >
                    {gradeLabels[grade.order] || grade.name}
                </button>
            ))}
        </div>
    );
}
