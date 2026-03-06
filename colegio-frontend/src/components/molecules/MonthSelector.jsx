'use client';
import Button from '@/components/atoms/Button';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MonthSelector({ year, month, onChange }) {
    const handlePrev = () => {
        if (month === 1) {
            onChange(year - 1, 12);
        } else {
            onChange(year, month - 1);
        }
    };

    const handleNext = () => {
        if (month === 12) {
            onChange(year + 1, 1);
        } else {
            onChange(year, month + 1);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrev}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Button>
            <span className="font-mono text-sm font-semibold text-neutral-900 min-w-36 text-center">
                {MONTHS[month - 1]} {year}
            </span>
            <Button variant="outline" size="sm" onClick={handleNext}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Button>
        </div>
    );
}
